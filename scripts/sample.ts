import { SLOTS, eligibleSlots } from "../src/data/slots";
import { ALL_PLAYERS } from "../src/data/squads";
import { simulate } from "../src/engine/sim";
import type { Lineup, Player } from "../src/types";

const rolesOf = (p: Player) => [p.role, ...(p.alt ?? [])];
const lineup: Lineup = {};
const used = new Set<string>();
for (const slot of [...SLOTS].sort((a, b) => a.accepts.length - b.accepts.length)) {
  const c = ALL_PLAYERS.filter(
    (p) => !used.has(p.id) && eligibleSlots(rolesOf(p), [slot.id]).length,
  ).sort((a, b) => b.ovr - a.ovr)[0];
  if (c) {
    lineup[slot.id] = c;
    used.add(c.id);
  }
}
for (const seed of ["sample-3", "sample-9", "sample-21"]) {
  const r = simulate(lineup, seed);
  console.log(`\n=== ${seed} -> ${r.verdict} | tries ${r.triesFor}-${r.triesAgainst}`);
  r.matches.forEach((m) =>
    console.log(
      `  ${m.round.padEnd(15)} ${m.opponent.padEnd(13)} ${m.pf}-${m.pa} ${m.won ? "W" : m.draw ? "D" : "L"}${m.bonusPoint ? "★" : " "}  MOTM: ${m.motm}`,
    ),
  );
  console.log("  Stalwarts:", r.stalwarts.map((s) => `${s.name}(${s.awards})`).join(", "));
  console.log("  Advice:", r.advice.join(" | "));
}
