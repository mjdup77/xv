// Board confidence, objectives, sackings and the job market.
// Spec: docs/manager/DESIGN-management.md §6. Multi-league (July 2026): job
// offers span both leagues — same-league moves are the norm, cross-league
// approaches are rarer but real, and overperformance attracts approaches
// from the other league at season's end (season.ts).

import { Rng } from "../../engine/rng";
import type { BoardState, ClubId, LeagueId } from "../types";
import { clubsOf, leagueOf, stature, statureRank } from "../world";
import { clamp } from "./util";

export function objectiveFor(clubId: ClubId): { target: number; label: string } {
  const rank = statureRank(clubId);
  if (leagueOf(clubId) === "urc") {
    // 16 clubs, top 8 make the playoffs.
    if (rank <= 2) return { target: 2, label: "Challenge for the title" };
    if (rank <= 4) return { target: 4, label: "Top four — a home quarter-final" };
    if (rank <= 8) return { target: 8, label: "Make the playoffs" };
    if (rank <= 12) return { target: 10, label: "Push for the top half" };
    return { target: 14, label: "Stay competitive — build for the future" };
  }
  // Premiership: 10 clubs, top 4.
  if (rank <= 2) return { target: 2, label: "Challenge for the title" };
  if (rank <= 4) return { target: 4, label: "Make the playoffs" };
  if (rank <= 7) return { target: 6, label: "Finish top six" };
  if (rank <= 9) return { target: 8, label: "Finish top eight" };
  return { target: 10, label: "Stay competitive — build for the future" };
}

export function freshBoard(clubId: ClubId): BoardState {
  const o = objectiveFor(clubId);
  return { confidence: 55, objective: o.target, objectiveLabel: o.label };
}

/**
 * Weekly confidence update after a round. Position vs objective is the slow
 * pressure; the result is the fast one. Early season is graded gently.
 */
export function updateConfidence(
  board: BoardState,
  pos: number,
  round: number,
  result: "win" | "draw" | "loss" | "none",
): void {
  const posWeight = Math.min(1, round / 6); // table noise early on
  const posDelta = (board.objective - pos) * 0.9 * posWeight;
  // Modest-objective boards expect losses and treasure wins; title boards
  // expect wins and punish slip-ups.
  const winBonus = 2.5 + 0.18 * Math.max(0, board.objective - 2);
  const lossHit = -(1.3 + 0.16 * Math.max(0, 10 - board.objective));
  const resDelta = result === "win" ? winBonus : result === "loss" ? lossHit : 0;
  board.confidence = clamp(0, 100, board.confidence + posDelta + resDelta);
}

/** Sackable this week? Boards don't act before round 6. */
export function sackCheck(board: BoardState, round: number): boolean {
  return round >= 6 && board.confidence <= 5;
}

/** Season's end: objective missed badly with low confidence = sacked. */
export function endOfSeasonSack(board: BoardState, pos: number): boolean {
  return pos > board.objective + 3 && board.confidence < 30;
}

/**
 * Jobs open to a manager sacked from `fromClub`: lesser clubs take a punt.
 * Mostly your own league; sometimes a club from the other league calls.
 */
export function jobOffers(fromClub: ClubId, seed: string): ClubId[] {
  const rng = new Rng(seed + ":jobs");
  const myStature = stature(fromClub);
  const league = leagueOf(fromClub);
  const lesserOf = (l: LeagueId) =>
    clubsOf(l)
      .map((c) => c.id)
      .filter((id) => id !== fromClub && stature(id) < myStature);

  let pool = lesserOf(league);
  if (pool.length < 2)
    pool = clubsOf(league)
      .map((c) => c.id)
      .filter((id) => id !== fromClub)
      .sort((a, b) => stature(a) - stature(b))
      .slice(0, 3);
  const offers = rng.shuffle(pool).slice(0, Math.min(3, Math.max(2, pool.length)));

  // Cross-league punt: ~1 in 3 sacked managers gets a call from the other
  // league (a lesser club willing to gamble on a name they've read about).
  const other = lesserOf(league === "prem" ? "urc" : "prem");
  if (other.length && rng.next() < 0.35) {
    const pick = other[Math.floor(rng.next() * other.length)];
    if (!offers.includes(pick)) offers[offers.length > 2 ? offers.length - 1 : offers.length] = pick;
  }
  return offers;
}

/**
 * Season-end poaching: an overperforming employed manager attracts one
 * approach from a bigger club — preferring the OTHER league (win the URC and
 * a Prem club comes calling, and vice versa). Returns null most seasons.
 */
export function poachApproach(
  clubId: ClubId,
  finishedPos: number,
  objective: number,
  champion: boolean,
  seed: string,
): ClubId | null {
  const overshoot = objective - finishedPos; // how far above the brief
  if (!champion && overshoot < 2) return null;
  const rng = new Rng(seed + ":poach");
  const chance = Math.min(0.85, (champion ? 0.5 : 0.2) + overshoot * 0.12);
  if (rng.next() > chance) return null;

  const myStature = stature(clubId);
  const league = leagueOf(clubId);
  const biggerOf = (l: LeagueId) =>
    clubsOf(l)
      .map((c) => c.id)
      .filter((id) => id !== clubId && stature(id) > myStature + 0.5);
  const other = biggerOf(league === "prem" ? "urc" : "prem");
  const same = biggerOf(league);
  // Prefer the cross-league story when one exists.
  const pool = other.length && (rng.next() < 0.6 || !same.length) ? other : same;
  if (!pool.length) return null;
  return pool[Math.floor(rng.next() * pool.length)];
}
