import { SLOTS } from "../src/data/slots";
import { ALL_PLAYERS, SQUADS } from "../src/data/squads";
import { eligibleSlots } from "../src/data/slots";
import { simulate } from "../src/engine/sim";
import { computeFacets } from "../src/engine/ratings";
import type { Lineup, Player, SlotId } from "../src/types";

function rolesOf(p: Player) {
  return [p.role, ...(p.alt ?? [])];
}

// Best-overall XV (mixed nations -> low chemistry).
function bestXV(): Lineup {
  const lineup: Lineup = {};
  const used = new Set<string>();
  // Fill rarest-eligibility slots first.
  const order = [...SLOTS].sort(
    (a, b) => a.accepts.length - b.accepts.length,
  );
  for (const slot of order) {
    const cand = ALL_PLAYERS.filter(
      (p) => !used.has(p.id) && eligibleSlots(rolesOf(p), [slot.id]).length > 0,
    ).sort((a, b) => b.ovr - a.ovr);
    if (cand[0]) {
      lineup[slot.id] = cand[0];
      used.add(cand[0].id);
    }
  }
  return lineup;
}

// A full XV drawn from a single squad (high chemistry) if it has coverage.
function squadXV(squadId: string): Lineup | null {
  const sq = SQUADS.find((s) => s.id === squadId)!;
  const lineup: Lineup = {};
  const used = new Set<string>();
  const order = [...SLOTS].sort((a, b) => a.accepts.length - b.accepts.length);
  for (const slot of order) {
    const cand = sq.players
      .filter((p) => !used.has(p.id) && eligibleSlots(rolesOf(p), [slot.id]).length > 0)
      .sort((a, b) => b.ovr - a.ovr);
    if (!cand[0]) return null;
    lineup[slot.id] = cand[0];
    used.add(cand[0].id);
  }
  return lineup;
}

// Random legal XV.
function randomXV(): Lineup {
  const lineup: Lineup = {};
  const used = new Set<string>();
  const order = [...SLOTS].sort(() => Math.random() - 0.5);
  for (const slot of order) {
    const cand = ALL_PLAYERS.filter(
      (p) => !used.has(p.id) && eligibleSlots(rolesOf(p), [slot.id]).length > 0,
    );
    const pick = cand[Math.floor(Math.random() * cand.length)];
    if (pick) {
      lineup[slot.id] = pick;
      used.add(pick.id);
    }
  }
  return lineup;
}

function report(name: string, lineup: Lineup, n = 4000) {
  const filled = (Object.keys(lineup) as SlotId[]).length;
  let champ = 0;
  let perfect = 0;
  let advance = 0;
  let scoreSum = 0;
  for (let i = 0; i < n; i++) {
    const r = simulate(lineup, "seed-" + i);
    if (r.champion) champ++;
    if (r.perfect35) perfect++;
    if (r.advancedFromPool) advance++;
    scoreSum += r.perfectScore;
  }
  const f = computeFacets(lineup);
  console.log(
    `${name.padEnd(22)} slots=${filled} ovr=${f.overall.toFixed(1)} chem=${f.chemistry.toFixed(1)} | ` +
      `advance=${((advance / n) * 100).toFixed(1)}% champ=${((champ / n) * 100).toFixed(1)}% ` +
      `perfect35=${((perfect / n) * 100).toFixed(2)}% avgScore=${(scoreSum / n).toFixed(1)}`,
  );
}

report("Best-overall XV", bestXV());
const nz = squadXV("nzl15");
if (nz) report("All NZ 2015 XV", nz);
const rsa = squadXV("rsa19");
if (rsa) report("All RSA 2019 XV", rsa);
let rsum = 0;
const R = 50;
for (let i = 0; i < R; i++) {
  // crude average for random teams
  const r = simulate(randomXV(), "x" + i);
  rsum += r.champion ? 1 : 0;
}
console.log(`Random XV champ (rough, ${R} teams x1 sim) ≈ ${((rsum / R) * 100).toFixed(0)}%`);
report("Random XV (one)", randomXV());
