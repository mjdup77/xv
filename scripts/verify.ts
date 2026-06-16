import { SQUADS } from "../src/data/squads";
import { SLOTS } from "../src/data/slots";
import { simulate } from "../src/engine/sim";
import type { Lineup, Player } from "../src/types";

function rolesOf(p: Player): string[] {
  return [p.role, ...(p.alt ?? [])];
}

// Can this set of players fill all 15 slots (1 player per slot)?
// Backtracking, most-constrained slot first.
function fillXV(players: Player[]): Lineup | null {
  const slots = SLOTS.map((s) => ({
    id: s.id,
    cands: players.filter((p) => s.accepts.some((r) => rolesOf(p).includes(r))),
  }));
  const used = new Set<string>();
  const lineup: Lineup = {};

  function solve(remaining: typeof slots): boolean {
    if (remaining.length === 0) return true;
    remaining.sort(
      (a, b) =>
        a.cands.filter((p) => !used.has(p.id)).length -
        b.cands.filter((p) => !used.has(p.id)).length,
    );
    const [slot, ...rest] = remaining;
    for (const p of slot.cands) {
      if (used.has(p.id)) continue;
      used.add(p.id);
      lineup[slot.id] = p;
      if (solve(rest)) return true;
      used.delete(p.id);
      delete lineup[slot.id];
    }
    return false;
  }

  return solve([...slots]) ? lineup : null;
}

let failures = 0;
console.log(`Checking ${SQUADS.length} squads can each field a full XV...\n`);
for (const sq of SQUADS) {
  const xv = fillXV(sq.players);
  if (!xv) {
    failures++;
    console.log(`  ❌ ${sq.id} (${sq.nation} ${sq.year}) CANNOT fill XV (${sq.players.length} players)`);
  }
}
if (failures === 0) console.log(`  ✅ All ${SQUADS.length} squads can field a complete XV.`);

// End-to-end: draft a best-XV from a couple of the NEW squads and simulate.
console.log("\nEnd-to-end sim with a 2007 Springboks XV:");
const boks = SQUADS.find((s) => s.id === "rsa07")!;
const lineup = fillXV(boks.players)!;
const res = simulate(lineup, 12345);
console.log(`  overall ${res.overall} | verdict: ${res.verdict}`);
console.log(`  champion: ${res.champion} | perfect35: ${res.perfect35} | triesFor ${res.triesFor} triesAgainst ${res.triesAgainst}`);
console.log(`  results: ${res.matches.map((m) => `${m.won ? "W" : m.draw ? "D" : "L"} ${m.pf}-${m.pa}`).join(", ")}`);
console.log(`  MotM sample: ${res.matches[0].motm} (vs ${res.matches[0].opponent})`);
console.log(`  stalwarts: ${res.stalwarts.slice(0, 3).map((s) => `${s.name}(${s.awards})`).join(", ")}`);

process.exit(failures > 0 ? 1 : 0);
