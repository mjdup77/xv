import type { Lineup, Player, SlotId, Squad } from "../types";
import { SLOTS, eligibleSlots } from "../data/slots";
import { SQUADS, applyRatingMode, type RatingMode } from "../data/squads";
import { Rng } from "./rng";

export function rolesOf(p: Player): string[] {
  return [p.role, ...(p.alt ?? [])];
}

// Identity for dedup: the same person across different World Cup years (e.g.
// Campese '87 vs '91) must not be drafted twice, so we key on name, not id.
export function playerKey(p: Player): string {
  return p.name.trim().toLowerCase();
}

export function openSlots(lineup: Lineup): SlotId[] {
  return SLOTS.filter((s) => !lineup[s.id]).map((s) => s.id);
}

// Open slots a given player is allowed to fill.
export function eligibleOpenSlots(p: Player, lineup: Lineup): SlotId[] {
  return eligibleSlots(rolesOf(p), openSlots(lineup));
}

export function isPickable(p: Player, lineup: Lineup, pickedKeys: Set<string>): boolean {
  if (pickedKeys.has(playerKey(p))) return false;
  return eligibleOpenSlots(p, lineup).length > 0;
}

export function squadHasPick(
  squad: Squad,
  lineup: Lineup,
  pickedKeys: Set<string>,
): boolean {
  return squad.players.some((p) => isPickable(p, lineup, pickedKeys));
}

// Slots an already-placed player can be moved to: open eligible slots, plus
// occupied slots where a straight swap is legal (the other player can cover
// the slot being vacated).
export function moveTargets(from: SlotId, lineup: Lineup): SlotId[] {
  const player = lineup[from];
  if (!player) return [];
  const roles = rolesOf(player);
  return SLOTS.filter((s) => s.id !== from)
    .filter((s) => {
      if (eligibleSlots(roles, [s.id]).length === 0) return false;
      const occupant = lineup[s.id];
      if (!occupant) return true;
      return eligibleSlots(rolesOf(occupant), [from]).length > 0;
    })
    .map((s) => s.id);
}

export function applyMove(from: SlotId, to: SlotId, lineup: Lineup): Lineup {
  const next: Lineup = { ...lineup };
  const a = lineup[from];
  const b = lineup[to];
  if (a) next[to] = a;
  if (b) next[from] = b;
  else delete next[from];
  return next;
}

// Pre-roll a deterministic sequence of squads for a seed.
export function buildSpinSequence(
  seed: string,
  length = 60,
  minYear = 0,
  ratingMode: RatingMode = "seasonal",
): Squad[] {
  const rng = new Rng(seed + ":spins");
  // Restrict to the selected era, falling back to all squads if the filter is empty.
  const filtered = SQUADS.filter((s) => s.year >= minYear);
  const base = filtered.length > 0 ? filtered : SQUADS;
  const pool = base.map((s) => applyRatingMode(s, ratingMode));

  // "Bag" randomiser (like Tetris): deal out a full shuffle of the pool before
  // any squad can recur, so you never roll the same squad twice in a pass. Big
  // nations (NZ/Aus/France have ~10 squads each) would still bunch up in a raw
  // shuffle, so we space same-nation entries apart.
  const decluster = (a: Squad[]): Squad[] => {
    for (let i = 1; i < a.length; i++) {
      if (a[i].nation !== a[i - 1].nation) continue;
      for (let k = i + 1; k < a.length; k++) {
        if (a[k].nation !== a[i - 1].nation) {
          [a[i], a[k]] = [a[k], a[i]];
          break;
        }
      }
    }
    return a;
  };

  const out: Squad[] = [];
  let guard = 0;
  while (out.length < length && guard++ < 50) {
    const bag = decluster(rng.shuffle(pool));
    // Guard the seam between consecutive bags against a same-nation repeat.
    if (out.length > 0 && bag.length > 1 && bag[0].nation === out[out.length - 1].nation) {
      bag.push(bag.shift()!);
    }
    out.push(...bag);
  }
  return out.slice(0, length);
}
