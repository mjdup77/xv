// Squad → matchday-23 selection over persistent world players (PlayerRec):
// availability (injuries), effective ratings (form/fatigue/morale), the
// auto-picker (most-constrained-slot-first), and cohesion for a selected XV.

import type { Lineup, Role, SlotId } from "../../types";
import { SLOTS } from "../../data/slots";
import { Rng } from "../../engine/rng";
import type { PlayerRec, Selection } from "../types";
import { toEngine } from "../world";
import { effectiveOvr, familiarity, teamCohesion } from "./tactics";

export function isAvailable(p: PlayerRec): boolean {
  return !p.injury || p.injury.weeks <= 0;
}

export function effOvrOf(p: PlayerRec): number {
  return Math.round(effectiveOvr(p.ovr, p.form, p.fatigue, p.morale));
}

export function lineupFromSelection(
  selection: Selection,
  players: Record<string, PlayerRec>,
  year: number,
): Lineup {
  const lineup: Lineup = {};
  for (const [slot, pid] of Object.entries(selection.starters) as [SlotId, string][]) {
    const p = players[pid];
    if (p) lineup[slot] = toEngine(p, year);
  }
  return lineup;
}

export function benchAverage(
  selection: Selection,
  players: Record<string, PlayerRec>,
): number {
  const effs = selection.bench
    .map((pid) => players[pid])
    .filter(Boolean)
    .map((p) => effectiveOvr(p.ovr, p.form, p.fatigue, p.morale));
  if (effs.length === 0) return 60; // an empty bench is a bad bench
  // Missing bench spots drag the average down toward the floor.
  const sum = effs.reduce((s, v) => s + v, 0) + (8 - effs.length) * 60;
  return sum / 8;
}

export function selectionCohesion(
  selection: Selection,
  players: Record<string, PlayerRec>,
): number {
  const windows = Object.values(selection.starters)
    .map((pid) => players[pid]?.window)
    .filter(Boolean) as number[][];
  return teamCohesion(windows);
}

function eligible(p: PlayerRec, accepts: readonly Role[]): boolean {
  return accepts.includes(p.role) || (p.alt ?? []).some((r) => accepts.includes(r));
}

// Standard 5/3 bench shape (front-row cover is mandatory in real rugby).
const BENCH_SHAPE: Role[][] = [
  ["prop"],
  ["hooker"],
  ["prop"],
  ["lock", "flanker", "number8"],
  ["flanker", "number8"],
  ["scrumhalf"],
  ["flyhalf", "centre"],
  ["centre", "wing", "fullback", "flyhalf"],
];

/**
 * Auto-pick a matchday 23 from a club roster. Injured players are never
 * picked. `rotate` biases against fatigued players; familiarity is worth a
 * little so the picker doesn't churn the XV for marginal rating gains —
 * mirroring the cohesion mechanic every club plays under.
 */
export function autoPickSquad(
  roster: PlayerRec[],
  opts: { seed: string; rotate: boolean },
  /** Existing picks to preserve — used to auto-complete a partial team sheet
   *  and to give AI clubs week-to-week continuity. */
  base?: Selection,
): Selection {
  const rng = new Rng(opts.seed + ":pick");
  const pool = roster.filter(isAvailable);
  const score = (p: PlayerRec): number =>
    effectiveOvr(p.ovr, p.form, p.fatigue, p.morale) +
    (opts.rotate ? -p.fatigue * 0.08 : 0) +
    familiarity(p.window) * 1.5 +
    rng.next() * 0.8;
  const scores = new Map<string, number>(pool.map((p) => [p.id, score(p)]));
  const poolIds = new Set(pool.map((p) => p.id));
  const taken = new Set<string>();

  // Starters: most-constrained slot first (preserving any base picks).
  const starters: Partial<Record<SlotId, string>> = {};
  const open = new Set<SlotId>(SLOTS.map((s) => s.id));
  if (base) {
    for (const [slot, pid] of Object.entries(base.starters) as [SlotId, string][]) {
      if (pid && poolIds.has(pid) && !taken.has(pid)) {
        starters[slot] = pid;
        taken.add(pid);
        open.delete(slot);
      }
    }
  }
  while (open.size > 0) {
    let bestSlot: SlotId | null = null;
    let bestCands: PlayerRec[] = [];
    for (const id of open) {
      const slot = SLOTS.find((s) => s.id === id)!;
      const cands = pool.filter((p) => !taken.has(p.id) && eligible(p, slot.accepts));
      if (bestSlot === null || cands.length < bestCands.length) {
        bestSlot = id;
        bestCands = cands;
      }
    }
    if (!bestSlot) break;
    open.delete(bestSlot);
    if (bestCands.length === 0) continue;
    const choice = bestCands.reduce((a, b) =>
      (scores.get(b.id) ?? 0) > (scores.get(a.id) ?? 0) ? b : a,
    );
    starters[bestSlot] = choice.id;
    taken.add(choice.id);
  }

  // Bench: fill the 5/3 shape with the best remaining cover (preserving base).
  const bench: string[] = [];
  if (base) {
    for (const pid of base.bench) {
      if (pid && poolIds.has(pid) && !taken.has(pid) && bench.length < 8) {
        bench.push(pid);
        taken.add(pid);
      }
    }
  }
  for (const accepts of BENCH_SHAPE) {
    if (bench.length >= 8) break;
    const cands = pool.filter((p) => !taken.has(p.id) && eligible(p, accepts));
    const fallback = pool.filter((p) => !taken.has(p.id));
    const from = cands.length > 0 ? cands : fallback;
    if (from.length === 0) continue;
    const choice = from.reduce((a, b) =>
      (scores.get(b.id) ?? 0) > (scores.get(a.id) ?? 0) ? b : a,
    );
    bench.push(choice.id);
    taken.add(choice.id);
  }

  return { starters, bench };
}

/**
 * Weekly AI (and "Suggest XV") selection: keep last week's 23 for continuity,
 * but drop the injured and anyone running on empty, then refill the gaps.
 */
export function weeklySelection(
  roster: PlayerRec[],
  prev: Selection | undefined,
  seed: string,
  fatigueLimit = 62,
): Selection {
  const keepable = (pid: string): boolean => {
    const p = roster.find((r) => r.id === pid);
    return !!p && isAvailable(p) && p.fatigue <= fatigueLimit;
  };
  const base: Selection | undefined = prev && {
    starters: Object.fromEntries(
      Object.entries(prev.starters).filter(([, pid]) => pid && keepable(pid)),
    ),
    bench: prev.bench.filter(keepable),
  };
  return autoPickSquad(roster, { seed, rotate: true }, base);
}

/** Players a slot will accept, available first, sorted by effective rating. */
export function slotCandidates(slotId: SlotId, roster: PlayerRec[]): PlayerRec[] {
  const slot = SLOTS.find((s) => s.id === slotId)!;
  return roster
    .filter((p) => eligible(p, slot.accepts))
    .sort(
      (a, b) =>
        Number(isAvailable(b)) - Number(isAvailable(a)) || effOvrOf(b) - effOvrOf(a),
    );
}

/** Squad-legality floor: the minimum owned cover per position group. */
const MIN_COVER: [Role[], number, string][] = [
  [["prop"], 3, "props"],
  [["hooker"], 2, "hookers"],
  [["lock"], 3, "locks"],
  [["flanker", "number8"], 4, "back-rowers"],
  [["scrumhalf"], 2, "scrum-halves"],
  [["flyhalf"], 2, "fly-halves"],
  [["centre"], 3, "centres"],
  [["wing", "fullback"], 4, "back-three players"],
];

/**
 * Could the club still field a legal squad if this player left?
 * Returns null if fine, otherwise the reason ("last recognised hooker").
 */
export function departureBlock(roster: PlayerRec[], playerId: string): string | null {
  const rest = roster.filter((p) => p.id !== playerId);
  for (const [roles, min, label] of MIN_COVER) {
    const covers = (p: PlayerRec) =>
      roles.includes(p.role) || (p.alt ?? []).some((r) => roles.includes(r));
    const leaving = roster.find((p) => p.id === playerId);
    if (!leaving || !covers(leaving)) continue;
    if (rest.filter(covers).length < min) return `that would leave too few ${label}`;
  }
  return null;
}
