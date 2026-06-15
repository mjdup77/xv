import type { Lineup, Player, SlotId, Squad } from "../types";
import { SLOTS, eligibleSlots } from "../data/slots";
import { SQUADS } from "../data/squads";
import { Rng } from "./rng";

export function rolesOf(p: Player): string[] {
  return [p.role, ...(p.alt ?? [])];
}

export function openSlots(lineup: Lineup): SlotId[] {
  return SLOTS.filter((s) => !lineup[s.id]).map((s) => s.id);
}

// Open slots a given player is allowed to fill.
export function eligibleOpenSlots(p: Player, lineup: Lineup): SlotId[] {
  return eligibleSlots(rolesOf(p), openSlots(lineup));
}

export function isPickable(p: Player, lineup: Lineup, pickedIds: Set<string>): boolean {
  if (pickedIds.has(p.id)) return false;
  return eligibleOpenSlots(p, lineup).length > 0;
}

export function squadHasPick(
  squad: Squad,
  lineup: Lineup,
  pickedIds: Set<string>,
): boolean {
  return squad.players.some((p) => isPickable(p, lineup, pickedIds));
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
export function buildSpinSequence(seed: string, length = 60): Squad[] {
  const rng = new Rng(seed + ":spins");
  const out: Squad[] = [];
  let last = "";
  for (let i = 0; i < length; i++) {
    let s = rng.pick(SQUADS);
    // Avoid immediate repeats for variety.
    let guard = 0;
    while (s.id === last && guard++ < 5) s = rng.pick(SQUADS);
    last = s.id;
    out.push(s);
  }
  return out;
}
