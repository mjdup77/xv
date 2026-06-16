import type { Attr, Lineup, Player, Role, SlotId } from "../types";

const ATTRS: Attr[] = [
  "setPiece",
  "breakdown",
  "carry",
  "defence",
  "handling",
  "kick",
  "goalKick",
  "pace",
  "gameManage",
  "discipline",
];

// Per-role attribute shape: delta applied to a player's overall.
// Signature overrides (in the data) take precedence over these defaults.
const PROFILES: Record<Role, Partial<Record<Attr, number>>> = {
  prop: { setPiece: 6, breakdown: -2, handling: -18, kick: -30, goalKick: -35, pace: -22, gameManage: -12, discipline: -4 },
  hooker: { setPiece: 3, breakdown: 3, carry: -2, handling: -10, kick: -25, goalKick: -32, pace: -14, gameManage: -8, discipline: -2 },
  lock: { setPiece: 6, defence: 2, handling: -14, kick: -28, goalKick: -34, pace: -16, gameManage: -8, discipline: -4 },
  flanker: { setPiece: -2, breakdown: 6, carry: 2, defence: 4, handling: -8, kick: -22, goalKick: -30, pace: -4, gameManage: -6, discipline: -6 },
  number8: { setPiece: -2, breakdown: 4, carry: 6, defence: 2, handling: -2, kick: -16, goalKick: -28, pace: -2, gameManage: -4, discipline: -4 },
  scrumhalf: { setPiece: -30, breakdown: 2, carry: -6, defence: -2, handling: 6, kick: 2, goalKick: -16, pace: 4, gameManage: 4 },
  flyhalf: { setPiece: -34, breakdown: -10, carry: -6, defence: -4, handling: 4, kick: 8, goalKick: 6, gameManage: 8 },
  centre: { setPiece: -32, breakdown: -4, carry: 4, defence: 4, handling: 2, kick: -8, goalKick: -16, pace: 4, gameManage: -2, discipline: -2 },
  wing: { setPiece: -36, breakdown: -8, carry: 2, defence: -2, handling: 2, kick: -12, goalKick: -20, pace: 8, gameManage: -8 },
  fullback: { setPiece: -34, breakdown: -8, defence: 2, handling: 4, kick: 4, goalKick: -10, pace: 6, gameManage: -2 },
};

const clamp = (n: number) => Math.max(1, Math.min(99, Math.round(n)));

export interface Tag {
  icon: string;
  label: string;
}

// Up to two signature traits per player, derived from their attributes. Only
// genuinely standout traits qualify, so most players get 0-2 and the truly
// elite get the punchiest badges.
export function signatureTags(p: Player): Tag[] {
  const a = getAttrs(p);
  const cands: { tag: Tag; v: number; min: number }[] = [
    { tag: { icon: "🎯", label: "Goal-kicker" }, v: a.goalKick, min: 84 },
    { tag: { icon: "⚡", label: "Strike runner" }, v: a.pace, min: 89 },
    { tag: { icon: "🎩", label: "Playmaker" }, v: a.gameManage, min: 87 },
    { tag: { icon: "🧱", label: "Enforcer" }, v: a.defence, min: 90 },
    { tag: { icon: "💪", label: "Ball carrier" }, v: a.carry, min: 89 },
    { tag: { icon: "🪝", label: "Jackal" }, v: a.breakdown, min: 89 },
    { tag: { icon: "🏛️", label: "Set-piece rock" }, v: a.setPiece, min: 90 },
    { tag: { icon: "🧤", label: "Distributor" }, v: a.handling, min: 90 },
  ];
  return cands
    .filter((c) => c.v >= c.min)
    .sort((x, y) => y.v - y.min - (x.v - x.min))
    .slice(0, 2)
    .map((c) => c.tag);
}

export function getAttrs(p: Player): Record<Attr, number> {
  const prof = PROFILES[p.role];
  const out = {} as Record<Attr, number>;
  for (const a of ATTRS) {
    const ov = p.overrides?.[a];
    out[a] = ov != null ? clamp(ov) : clamp(p.ovr + (prof[a] ?? 0));
  }
  return out;
}

const BACKS: SlotId[] = ["SH", "FH", "IC", "OC", "LW", "RW", "FB"];

const SET_PIECE_W: Partial<Record<SlotId, number>> = {
  LH: 0.16, TH: 0.16, HK: 0.13, L4: 0.15, L5: 0.15, N8: 0.1, F6: 0.08, F7: 0.07,
};
const BREAKDOWN_W: Partial<Record<SlotId, number>> = {
  F7: 0.24, F6: 0.2, N8: 0.18, HK: 0.12, L4: 0.07, L5: 0.07, LH: 0.06, TH: 0.06,
};
const DEFENCE_W: Partial<Record<SlotId, number>> = {
  LH: 1, HK: 1, TH: 1, L4: 1, L5: 1, F6: 1.2, F7: 1.2, N8: 1.1,
  SH: 0.8, FH: 0.9, IC: 1.2, OC: 1.2, LW: 0.9, RW: 0.9, FB: 1,
};

function weighted(
  lineup: Lineup,
  weights: Partial<Record<SlotId, number>>,
  attr: Attr,
): number {
  let sum = 0;
  let wsum = 0;
  for (const [slot, w] of Object.entries(weights) as [SlotId, number][]) {
    const p = lineup[slot];
    if (!p) continue;
    sum += getAttrs(p)[attr] * w;
    wsum += w;
  }
  return wsum > 0 ? sum / wsum : 0;
}

export interface Facets {
  setPiece: number;
  breakdown: number;
  defence: number;
  attack: number;
  control: number;
  goalKick: number;
  discipline: number;
  overall: number;
}

export function computeFacets(lineup: Lineup): Facets {
  const present = Object.values(lineup).filter(Boolean) as Player[];

  const setPiece = weighted(lineup, SET_PIECE_W, "setPiece");
  const breakdown = weighted(lineup, BREAKDOWN_W, "breakdown");
  const defence = weighted(lineup, DEFENCE_W, "defence");

  // Attack: the back line's handling/pace/carry, plus back-row carry.
  let attSum = 0;
  let attN = 0;
  for (const s of BACKS) {
    const p = lineup[s];
    if (!p) continue;
    const a = getAttrs(p);
    attSum += a.handling * 0.4 + a.pace * 0.35 + a.carry * 0.25;
    attN++;
  }
  let backRowCarry = 0;
  let brN = 0;
  for (const s of ["F6", "F7", "N8"] as SlotId[]) {
    const p = lineup[s];
    if (!p) continue;
    backRowCarry += getAttrs(p).carry;
    brN++;
  }
  const attack =
    (attN ? attSum / attN : 0) * 0.85 + (brN ? backRowCarry / brN : 0) * 0.15;

  // Control: fly-half game management & kicking, scrum-half service.
  let ctrl = 0;
  let ctrlW = 0;
  const fh = lineup.FH;
  const sh = lineup.SH;
  if (fh) {
    const a = getAttrs(fh);
    ctrl += a.gameManage * 0.45 + a.kick * 0.2 + a.handling * 0.1;
    ctrlW += 0.75;
  }
  if (sh) {
    const a = getAttrs(sh);
    ctrl += a.handling * 0.15 + a.pace * 0.1;
    ctrlW += 0.25;
  }
  const control = ctrlW > 0 ? ctrl / ctrlW : 0;

  const goalKick = present.length
    ? Math.max(...present.map((p) => getAttrs(p).goalKick))
    : 0;
  const discipline = present.length
    ? present.reduce((s, p) => s + getAttrs(p).discipline, 0) / present.length
    : 0;

  const overall =
    setPiece * 0.16 +
    breakdown * 0.14 +
    defence * 0.2 +
    attack * 0.22 +
    control * 0.14 +
    goalKick * 0.08 +
    discipline * 0.06;

  return { setPiece, breakdown, defence, attack, control, goalKick, discipline, overall };
}
