// Money: player valuation, wage demands, club budgets, and wage ceilings.
// One transfer kitty per club (PRD §3) + a wage ceiling per club, which
// together make "can I afford him?" a two-line check everywhere.
// Spec: docs/manager/DESIGN-management.md §4.
//
// Multi-league note: the Premiership has a real league-wide salary cap, so
// every Prem club shares WAGE_CAP. The URC has no single uniform cap (five
// unions, five sets of rules) — there, each club's wage ceiling is seeded
// from its stature, exactly like the transfer kitty. Same checks, same code
// paths, no per-union salary law simulation.

import type { Career, ClubId, PlayerRec } from "../types";
import { leagueOf, rosterOf, stature } from "../world";

const clamp = (lo: number, hi: number, v: number) => Math.max(lo, Math.min(hi, v));

/** Premiership league-wide wage cap, £k per season (mirrors the real cap). */
export const WAGE_CAP = 6400;

/**
 * A club's wage ceiling, £k per season. Prem: the league cap. URC: stature-
 * seeded — Leinster/Bulls money approaches a Prem wage bill, Zebre runs on a
 * fraction of it. Calibrated so top URC squads land at 76-88% of their
 * ceiling under the same normalisation as the Prem (season.ts).
 */
export function wageCapFor(clubId: ClubId): number {
  if (leagueOf(clubId) === "prem") return WAGE_CAP;
  return Math.round(3000 + Math.max(0, stature(clubId) - 64) * 180);
}

/** Season transfer kitty, £k, seeded by club stature (both leagues). */
export function seasonBudget(clubId: ClubId): number {
  return Math.round(400 + Math.max(0, stature(clubId) - 70) * 170);
}

/** Fair wage for a rating, £k per season. Calibrated so a full ~38-man squad
 *  lands around 80-85% of the Prem cap, leaving real room to work the market. */
export function wageFor(ovr: number, age: number, pot: number): number {
  const base = 22 + Math.pow(Math.max(0, ovr - 58), 2) * 0.4;
  const youthPremium = age <= 23 ? (pot - ovr) * 2 : 0;
  return Math.round(clamp(18, 800, base + youthPremium));
}

/** Transfer valuation, £k. Peak-age stars cost millions; veterans go cheap. */
export function valuation(p: PlayerRec): number {
  const ageF =
    p.age <= 24 ? 1.3 : p.age <= 28 ? 1.0 : p.age <= 30 ? 0.7 : p.age <= 32 ? 0.45 : 0.25;
  const potF = 1 + Math.max(0, p.pot - p.ovr) * 0.05;
  const base = Math.pow(Math.max(0, p.ovr - 58), 2.1) * 2.1;
  return Math.round(clamp(15, 15000, base * ageF * potF));
}

/** What a club will demand to sell (listed players go near value; first-choice
 *  players cost a premium). */
export function askingPrice(p: PlayerRec, fringe: boolean): number {
  const mult = p.listed ? 0.85 : fringe ? 1.0 : 1.3;
  return Math.round(valuation(p) * mult);
}

/** A club's committed wage bill, £k (loaned-in players count half). */
export function wageBill(career: Career, clubId: ClubId): number {
  return rosterOf(career, clubId).reduce((s, p) => {
    const share = p.loan && p.clubId !== clubId ? 0.5 : 1;
    return s + p.wage * share;
  }, 0);
}

/** Contract renewal demand: fair wage bumped by leverage (form, expiry). */
export function renewalDemand(p: PlayerRec): { wage: number; years: number } {
  const fair = wageFor(p.ovr, p.age, p.pot);
  const bump = p.morale < 45 ? 1.15 : 1.05;
  return {
    wage: Math.round(Math.max(p.wage, fair * bump)),
    years: p.age >= 32 ? 1 : p.age >= 29 ? 2 : 3,
  };
}

export function fmtMoney(k: number): string {
  if (k >= 1000) return `£${(k / 1000).toFixed(k >= 10000 ? 0 : 1)}m`;
  return `£${Math.round(k)}k`;
}
