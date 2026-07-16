import type { Lineup, Player, SlotId } from "../types";
import { SLOTS, eligibleSlots } from "../data/slots";
import { SQUADS, applyRatingMode, type RatingMode } from "../data/squads";
import { playerKey, rolesOf } from "./draft";
import { Rng } from "./rng";

// Auto-draft a legal, reasonably strong (but not optimal) XV in one shot, so a
// challenge acceptor can play in seconds instead of hand-drafting 15 players.
//
// Guarantees:
//   - respects the challenge's era (minYear) and rating mode (prime/seasonal),
//     drafting from the exact same pool a manual draft would offer;
//   - respects positional eligibility (each SLOT's `accepts`);
//   - no duplicate player (same person across years counts once, via playerKey);
//   - fully deterministic for a given seed, so a Quick Play match reproduces.
//
// "Strong but not optimal": we fill the most-constrained slot first (fewest
// eligible players left) and pick from the top handful by rating with seeded
// jitter — a competitive XV that still leaves room to out-draft by hand.
export function autoDraftLineup(opts: {
  minYear: number;
  rating: RatingMode;
  seed: string;
}): Lineup {
  const { minYear, rating, seed } = opts;

  const filtered = SQUADS.filter((s) => s.year >= minYear);
  const base = filtered.length > 0 ? filtered : SQUADS;
  const pool: Player[] = base.flatMap((s) => applyRatingMode(s, rating).players);

  const rng = new Rng(seed + ":auto");
  const lineup: Lineup = {};
  const pickedKeys = new Set<string>();
  const openSlotIds = new Set<SlotId>(SLOTS.map((s) => s.id));

  const candidatesFor = (slotId: SlotId): Player[] =>
    pool.filter(
      (p) =>
        !pickedKeys.has(playerKey(p)) &&
        eligibleSlots(rolesOf(p), [slotId]).length > 0,
    );

  while (openSlotIds.size > 0) {
    // Most-constrained-variable heuristic: solve the tightest slot first so a
    // scarce specialist (e.g. the fullback-only slot) never gets stranded by a
    // versatile player being spent early on a slot that had alternatives.
    let bestSlot: SlotId | null = null;
    let bestCands: Player[] = [];
    let bestCount = Infinity;
    for (const id of openSlotIds) {
      const cands = candidatesFor(id);
      if (cands.length < bestCount) {
        bestCount = cands.length;
        bestSlot = id;
        bestCands = cands;
      }
    }
    if (!bestSlot || bestCands.length === 0) break;

    const sorted = bestCands.sort(
      (a, b) => b.ovr - a.ovr || playerKey(a).localeCompare(playerKey(b)),
    );
    const k = Math.min(4, sorted.length);
    const choice = sorted[rng.int(0, k - 1)];
    lineup[bestSlot] = choice;
    pickedKeys.add(playerKey(choice));
    openSlotIds.delete(bestSlot);
  }

  return lineup;
}
