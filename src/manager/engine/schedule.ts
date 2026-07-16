// Fixture scheduling for both leagues + playoff creation.
//
// Premiership: 18-round double round robin for 10 clubs (circle method).
// URC: the real 2025-26 structure — four regional pools supply 6 home-and-away
// derby rounds, and the other 12 rounds are a single round robin of the twelve
// clubs from the other pools (6H/6A each). Playoffs are data-driven from
// CompetitionDef (top-4 semis for the Prem, seeded top-8 QF/SF/Final for the
// URC, hosting per finalHosting).

import { Rng } from "../../engine/rng";
import { COMPETITIONS } from "../../data/manager";
import { URC_POOLS } from "../../data/manager/urc";
import type { ClubId, Fixture, LeagueId, TableRow } from "../types";

function fixtureId(league: LeagueId, round: number, home: ClubId, away: ClubId): string {
  return `${league}-r${round}-${home}-${away}`;
}

function fixtureSeed(careerSeed: string, seasonIndex: number, id: string): string {
  return `${careerSeed}:s${seasonIndex}:${id}`;
}

function mkFixture(
  league: LeagueId,
  round: number,
  home: ClubId,
  away: ClubId,
  careerSeed: string,
  seasonIndex: number,
): Fixture {
  const id = fixtureId(league, round, home, away);
  return { id, league, round, homeId: home, awayId: away, seed: fixtureSeed(careerSeed, seasonIndex, id) };
}

/** Double round robin (circle method), venues alternated; rounds 1..2(n-1). */
function doubleRoundRobin(
  league: LeagueId,
  clubIds: ClubId[],
  careerSeed: string,
  seasonIndex: number,
): Fixture[] {
  const rng = new Rng(`${careerSeed}:schedule:${league}:${seasonIndex}`);
  const order = rng.shuffle([...clubIds]);
  const n = order.length;
  const half = n - 1;
  const fixtures: Fixture[] = [];

  const rot = order.slice(1);
  for (let r = 0; r < half; r++) {
    const ring = [order[0], ...rot];
    for (let i = 0; i < n / 2; i++) {
      const a = ring[i];
      const b = ring[n - 1 - i];
      const [home, away] = (r + i) % 2 === 0 ? [a, b] : [b, a];
      fixtures.push(mkFixture(league, r + 1, home, away, careerSeed, seasonIndex));
      fixtures.push(mkFixture(league, r + 1 + half, away, home, careerSeed, seasonIndex));
    }
    rot.unshift(rot.pop()!);
  }

  return fixtures;
}

/**
 * URC 18 rounds: 6 derby rounds (each pool of four plays a home-and-away
 * round robin, all pools in parallel) + 12 cross-pool rounds (three pool
 * pairings × 4 bipartite rounds; home split 2H/2A per pairing so every club
 * gets 6H/6A cross-pool). The round ORDER is shuffled per season so derby
 * blocks land differently each year (SA "mini-tours" fall out naturally when
 * consecutive cross-pool rounds hit the same pool pairing).
 */
function urcFixtures(careerSeed: string, seasonIndex: number): Fixture[] {
  const rng = new Rng(`${careerSeed}:schedule:urc:${seasonIndex}`);
  // Shuffle club order within each pool per season.
  const pools = URC_POOLS.map((p) => rng.shuffle([...p] as ClubId[]));

  // Round templates: each is a list of [home, away] pairs (8 matches).
  const templates: [ClubId, ClubId][][] = [];

  // 6 derby rounds: single RR of 4 (3 rounds via fixed pairings), mirrored.
  const rr4: [number, number][][] = [
    [[0, 1], [2, 3]],
    [[0, 2], [3, 1]],
    [[0, 3], [1, 2]],
  ];
  for (let r = 0; r < 3; r++) {
    const first: [ClubId, ClubId][] = [];
    const second: [ClubId, ClubId][] = [];
    for (const pool of pools) {
      for (const [h, a] of rr4[r]) {
        first.push([pool[h], pool[a]]);
        second.push([pool[a], pool[h]]); // return leg, venues swapped
      }
    }
    templates.push(first, second);
  }

  // 12 cross-pool rounds: pool pairings (A-B, C-D) / (A-C, B-D) / (A-D, B-C),
  // each pairing playing a 4-round bipartite round robin (i vs (i+k)%4).
  const pairings: [number, number][][] = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]],
  ];
  for (const pairing of pairings) {
    for (let k = 0; k < 4; k++) {
      const round: [ClubId, ClubId][] = [];
      for (const [x, y] of pairing) {
        for (let i = 0; i < 4; i++) {
          const a = pools[x][i];
          const b = pools[y][(i + k) % 4];
          // 2 home / 2 away per club per pairing.
          round.push(k % 2 === 0 ? [a, b] : [b, a]);
        }
      }
      templates.push(round);
    }
  }

  // Shuffle the 18 round templates into the season calendar.
  const orderIdx = rng.shuffle(templates.map((_, i) => i));
  const fixtures: Fixture[] = [];
  orderIdx.forEach((tIdx, slot) => {
    for (const [home, away] of templates[tIdx])
      fixtures.push(mkFixture("urc", slot + 1, home, away, careerSeed, seasonIndex));
  });
  return fixtures;
}

/** Build one league's full regular season. */
export function buildFixtures(
  league: LeagueId,
  careerSeed: string,
  seasonIndex: number,
): Fixture[] {
  const fixtures =
    league === "urc"
      ? urcFixtures(careerSeed, seasonIndex)
      : doubleRoundRobin(league, [...COMPETITIONS[league].clubIds], careerSeed, seasonIndex);
  return fixtures.sort((a, b) => a.round - b.round);
}

/** Display label for a fixture, format-aware (used by reports + previews). */
export function roundLabel(fx: Fixture): string {
  const comp = COMPETITIONS[fx.league];
  const k = fx.round - comp.rounds;
  if (k <= 0) return `Round ${fx.round}`;
  const ladder =
    comp.playoffTeams === 8
      ? ["Quarter-final", "Semi-final", "Grand Final"]
      : ["Semi-final", `${comp.shortName} Final`];
  return ladder[k - 1] ?? "Final";
}

// ---------------------------------------------------------------- Playoffs

function knockout(
  league: LeagueId,
  round: number,
  tag: string,
  pairs: { home: ClubId; away: ClubId }[],
  careerSeed: string,
  seasonIndex: number,
): Fixture[] {
  return pairs.map(({ home, away }, i) => {
    const id = `${league}-${tag}${i + 1}-${home}-${away}`;
    return { id, league, round, homeId: home, awayId: away, seed: fixtureSeed(careerSeed, seasonIndex, id) };
  });
}

const seedOf = (table: TableRow[]) => (c: ClubId) => table.findIndex((r) => r.clubId === c) + 1;

/** Quarter-finals (top-8 leagues): 1v8, 2v7, 3v6, 4v5 at the higher seed. */
export function buildQuarters(
  league: LeagueId,
  table: TableRow[],
  careerSeed: string,
  seasonIndex: number,
): Fixture[] {
  const top = table.slice(0, 8).map((r) => r.clubId);
  const pairs = [0, 1, 2, 3].map((i) => ({ home: top[i], away: top[7 - i] }));
  return knockout(league, COMPETITIONS[league].rounds + 1, "qf", pairs, careerSeed, seasonIndex);
}

/**
 * Semi-finals. Top-4 leagues: 1v4 and 2v3 straight from the table. Top-8
 * leagues: quarter-final winners re-seeded — best surviving seed hosts the
 * worst, second hosts third.
 */
export function buildSemis(
  league: LeagueId,
  table: TableRow[],
  careerSeed: string,
  seasonIndex: number,
  quarterWinners?: ClubId[],
): Fixture[] {
  const comp = COMPETITIONS[league];
  const pos = seedOf(table);
  let pairs: { home: ClubId; away: ClubId }[];
  if (comp.playoffTeams === 8) {
    const seeded = [...(quarterWinners ?? [])].sort((a, b) => pos(a) - pos(b));
    pairs = [
      { home: seeded[0], away: seeded[3] },
      { home: seeded[1], away: seeded[2] },
    ];
  } else {
    const [first, second, third, fourth] = table.slice(0, 4).map((r) => r.clubId);
    pairs = [
      { home: first, away: fourth },
      { home: second, away: third },
    ];
  }
  const round = comp.rounds + (comp.playoffTeams === 8 ? 2 : 1);
  return knockout(league, round, "sf", pairs, careerSeed, seasonIndex);
}

/**
 * The final. Neutral-venue leagues (Prem): higher seed is "home" for display
 * only. Highest-seed leagues (URC): the best surviving seed genuinely hosts.
 */
export function buildFinal(
  league: LeagueId,
  winners: [ClubId, ClubId],
  table: TableRow[],
  careerSeed: string,
  seasonIndex: number,
): Fixture {
  const comp = COMPETITIONS[league];
  const pos = seedOf(table);
  const [home, away] = pos(winners[0]) <= pos(winners[1]) ? winners : [winners[1], winners[0]];
  const round = comp.rounds + (comp.playoffTeams === 8 ? 3 : 2);
  const id = `${league}-final-${home}-${away}`;
  return { id, league, round, homeId: home, awayId: away, seed: fixtureSeed(careerSeed, seasonIndex, id) };
}
