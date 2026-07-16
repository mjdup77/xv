// Player growth engine: potential seeding, the age-curve + minutes-played
// progression applied at season end, retirements, and youth intake.
// Spec: docs/manager/DESIGN-management.md §3.

import { Rng } from "../../engine/rng";
import type { Role } from "../../types";
import type { ClubId, PlayerRec, ProgressionReport } from "../types";
import { URC_CLUB_IDS } from "../types";

const clamp = (lo: number, hi: number, v: number) => Math.max(lo, Math.min(hi, v));

// ---- Potential ----

/**
 * Seed a hidden potential ceiling from age + current ovr, with editorial
 * variance. Deterministic per (careerSeed, playerId) so re-creating a career
 * world is reproducible. Young high-potential gems must exist: ~1 in 12
 * under-23s gets a +6..+10 "gem" bump.
 */
export function seedPotential(careerSeed: string, p: { id: string; age: number; ovr: number }): number {
  const rng = new Rng(`${careerSeed}:pot:${p.id}`);
  if (p.age >= 27) return p.ovr; // peaked — potential is where they are
  const headroomYears = 27 - p.age;
  let head = headroomYears * 1.4 + rng.normal(0, 2.5);
  if (p.age <= 23 && rng.next() < 0.085) head += 6 + rng.next() * 4; // the gem
  head = Math.max(0, head);
  // The already-elite young player can't have infinite headroom.
  return Math.round(clamp(p.ovr, 97, p.ovr + head));
}

/**
 * Scout-style display range for a potential rating ("78–84"). Uncertainty
 * shrinks with age; from 24 the number is effectively known.
 */
export function potentialRange(p: PlayerRec): [number, number] {
  const spread = p.age <= 20 ? 4 : p.age <= 23 ? 3 : p.age <= 26 ? 1 : 0;
  return [Math.max(p.ovr, p.pot - spread), Math.min(99, p.pot + spread)];
}

// ---- Season-end progression ----

/** Base growth (positive) / decline (negative) by age, before minutes. */
export function ageCurve(age: number): number {
  if (age <= 20) return 3.4;
  if (age <= 23) return 2.6;
  if (age <= 26) return 1.5;
  if (age <= 29) return 0.6;
  if (age <= 31) return -0.9;
  if (age <= 33) return -1.9;
  return -3.0;
}

/** Minutes factor for growth: bench-warming youngsters stagnate. Full effect
 *  from ~900 minutes (11 full matches of a 18-round season). */
export function minutesFactor(minutes: number): number {
  return 0.45 + 0.75 * Math.min(1, minutes / 900);
}

export interface ProgressionResult {
  delta: number;
}

export function progressPlayer(p: PlayerRec, rng: Rng): ProgressionResult {
  const base = ageCurve(p.age);
  let delta: number;
  if (base >= 0) {
    delta = base * minutesFactor(p.minutes) + rng.normal(0, 0.8);
    delta = Math.min(delta, p.pot - p.ovr); // ceiling
    delta = Math.max(0, delta);
  } else {
    delta = base + rng.normal(0, 0.7);
    delta = Math.min(0, delta);
  }
  return { delta: Math.round(delta) };
}

// ---- Retirement ----

export function retirementChance(age: number, ovr: number): number {
  if (age < 32) return 0;
  const base = age >= 37 ? 0.9 : age === 36 ? 0.75 : age === 35 ? 0.55 : age === 34 ? 0.32 : age === 33 ? 0.16 : 0.07;
  return ovr < 66 ? Math.min(1, base + 0.25) : base;
}

// ---- Youth intake ----

const YOUTH_FIRST = [
  "Arthur", "Billy", "Caleb", "Dylan", "Eli", "Fraser", "Gabriel", "Hugo",
  "Idris", "Jude", "Kian", "Louis", "Morgan", "Noah", "Oscar", "Patrick",
  "Reuben", "Seb", "Toby", "Wilf", "Zach", "Albie", "Dewi", "Efan",
];
const YOUTH_LAST = [
  "Ashworth", "Blakemore", "Caldwell", "Danaher", "Eastmond", "Farrow",
  "Goodall", "Hartley", "Ibbotson", "Jephcott", "Kershaw", "Lowndes",
  "Merrick", "Nash", "Ogilvie", "Prentice", "Rowntree", "Sillars",
  "Treharne", "Underwood", "Vickery", "Wainwright", "Yarde", "Zieliński",
];
const YOUTH_ROLES: Role[] = [
  "prop", "prop", "hooker", "lock", "flanker", "flanker", "number8",
  "scrumhalf", "flyhalf", "centre", "centre", "wing", "wing", "fullback",
];

/** Academy nationality by club (URC pools; Prem academies produce English lads). */
const YOUTH_NATION: Partial<Record<ClubId, string>> = Object.fromEntries(
  URC_CLUB_IDS.map((id) => {
    if (["leinster", "munster", "ulster", "connacht"].includes(id)) return [id, "Ireland"];
    if (["cardiff", "ospreys", "scarlets", "dragons"].includes(id)) return [id, "Wales"];
    if (["edinburgh", "glasgow"].includes(id)) return [id, "Scotland"];
    if (["benetton", "zebre"].includes(id)) return [id, "Italy"];
    return [id, "South Africa"];
  }),
);

/** 3 academy graduates per club per season: ages 18-20, raw, real headroom. */
export function youthIntake(
  clubId: ClubId,
  year: number,
  careerSeed: string,
  usedNames: Set<string>,
): PlayerRec[] {
  const rng = new Rng(`${careerSeed}:youth:${clubId}:${year}`);
  const out: PlayerRec[] = [];
  for (let i = 0; i < 3; i++) {
    let name = `${rng.pick(YOUTH_FIRST)} ${rng.pick(YOUTH_LAST)}`;
    let guard = 0;
    while (usedNames.has(name) && guard++ < 40)
      name = `${rng.pick(YOUTH_FIRST)} ${rng.pick(YOUTH_LAST)}`;
    usedNames.add(name);
    const age = rng.int(18, 20);
    const ovr = rng.int(56, 66);
    const pot = Math.round(clamp(ovr + 4, 94, ovr + 8 + rng.next() * 18));
    out.push({
      id: `yth-${clubId}-${year}-${i}`,
      name,
      nation: YOUTH_NATION[clubId] ?? "England",
      role: rng.pick(YOUTH_ROLES),
      age,
      ovr,
      pot,
      clubId,
      wage: 25,
      expiry: year + 2,
      form: 0,
      fatigue: 0,
      window: [1, 1],
      morale: 70,
      starts: 0,
      benchApps: 0,
      minutes: 0,
      tries: 0,
      youth: true,
    });
  }
  return out;
}

/**
 * Apply end-of-season progression to the whole world (mutates players).
 * Returns the report scoped to the user's club, plus league-wide retirements.
 */
export function runSeasonProgression(
  players: Record<string, PlayerRec>,
  userClubId: ClubId,
  year: number,
  careerSeed: string,
): ProgressionReport {
  const rng = new Rng(`${careerSeed}:grow:${year}`);
  const report: ProgressionReport = { year, grew: [], declined: [], retired: [], youth: [] };

  for (const p of Object.values(players)) {
    const { delta } = progressPlayer(p, rng);
    const from = p.ovr;
    p.ovr = Math.round(clamp(40, 99, p.ovr + delta));
    if (p.overrides && p.ovr !== from) {
      const shift = p.ovr - from;
      p.overrides = Object.fromEntries(
        Object.entries(p.overrides).map(([k, v]) => [k, clamp(1, 99, (v as number) + shift)]),
      ) as PlayerRec["overrides"];
    }
    if (p.age >= 27) p.pot = p.ovr;
    else p.pot = Math.max(p.pot, p.ovr);
    const mine = p.clubId === userClubId;
    if (mine && p.ovr > from) report.grew.push({ playerId: p.id, name: p.name, age: p.age, from, to: p.ovr, minutes: p.minutes });
    if (mine && p.ovr < from) report.declined.push({ playerId: p.id, name: p.name, age: p.age, from, to: p.ovr, minutes: p.minutes });
  }

  // Retirements (league-wide; report lists the user's).
  for (const p of Object.values(players)) {
    if (rng.next() < retirementChance(p.age, p.ovr)) {
      if (p.clubId === userClubId) report.retired.push({ name: p.name, age: p.age, ovr: p.ovr });
      delete players[p.id];
    }
  }

  report.grew.sort((a, b) => b.to - b.from - (a.to - a.from));
  report.declined.sort((a, b) => a.to - a.from - (b.to - b.from));
  return report;
}
