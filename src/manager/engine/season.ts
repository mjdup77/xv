// Season orchestration for the week-by-week management loop, multi-league.
//
// Both leagues share one calendar and sim concurrently every week:
//
//   preseason (week 0) → rounds 1-18 (both leagues, full player-level sim)
//   → week 19: Prem semis + URC quarter-finals
//   → week 20: Prem final + URC semi-finals
//   → week 21: URC Grand Final
//   → offseason (week 22) → rollover
//
// playMatchday(career) resolves every due fixture in BOTH leagues (injuries,
// fatigue, morale, stats, board reaction). advanceWeek(career) moves the
// calendar: recoveries, the cross-league transfer market, and everything that
// lands in the inbox. All functions mutate the career they are given — the
// store clones. Competition formats (rounds, playoff shape, hosting, shields)
// come from COMPETITIONS — nothing here hardcodes a league's structure.

import { computeFacets } from "../../engine/ratings";
import { Rng } from "../../engine/rng";
import { COMPETITIONS, seasonLabel } from "../../data/manager";
import { LEAGUE_IDS } from "../types";
import type {
  Career,
  ClubId,
  Fixture,
  GamePlanId,
  LeagueId,
  LeagueSeason,
  MatchReport,
  PlayerRec,
  Selection,
} from "../types";
import { ALL_CLUBS, clubShort, clubsOf, leagueOf, rosterOf, userLeague } from "../world";
import { buildFinal, buildFixtures, buildQuarters, buildSemis, roundLabel } from "./schedule";
import {
  autoPickSquad,
  benchAverage,
  isAvailable,
  lineupFromSelection,
  selectionCohesion,
  weeklySelection,
} from "./selection";
import { computeShields, computeTable, tablePosition } from "./table";
import { simFixture, leaguePoints, type SideInput } from "./simFixture";
import { FATIGUE_BENCH, FATIGUE_RECOVERY, FATIGUE_REST, FATIGUE_START, FORM_CAP, GAME_PLANS, fitMod } from "./tactics";
import { rollMatchInjuries, tickInjuries } from "./injuries";
import { seedPotential, runSeasonProgression, youthIntake } from "./growth";
import { seasonBudget, wageFor, wageCapFor } from "./finance";
import { aiMarketTick, runContractExpiry, windowOpen, MID_WINDOW } from "./transfers";
import { endOfSeasonSack, freshBoard, jobOffers, objectiveFor, poachApproach, sackCheck, updateConfidence } from "./board";
import * as mail from "./inbox";
import { clamp } from "./util";

/** Off-season calendar week (URC Grand Final week + 1). */
export const OFFSEASON_WEEK = 22;

function randomSeed(): string {
  return "mgr-" + Math.random().toString(36).slice(2, 10);
}

/** The user's league's season state. */
export function userSeason(career: Career): LeagueSeason {
  return career.season.leagues[userLeague(career)];
}

/** The user's league's table, computed from played fixtures. */
export function userTable(career: Career) {
  const lg = userLeague(career);
  return computeTable(
    clubsOf(lg).map((c) => c.id),
    career.season.leagues[lg].fixtures,
  );
}

// ---------------------------------------------------------------- Creation

/** The plan a squad is best built for — used to assign AI club plans. */
export function bestPlanFor(career: Career, clubId: ClubId, seed: string): GamePlanId {
  const sel = autoPickSquad(rosterOf(career, clubId), { seed: seed + ":scout:" + clubId, rotate: false });
  const facets = computeFacets(lineupFromSelection(sel, career.players, career.season.year));
  let best: GamePlanId = "balanced";
  let bestFit = 0;
  for (const plan of Object.keys(GAME_PLANS) as GamePlanId[]) {
    const f = fitMod(plan, facets);
    if (f > bestFit) {
      bestFit = f;
      best = plan;
    }
  }
  return best;
}

function freshLeagueSeasons(careerSeed: string, seasonIndex: number): Career["season"]["leagues"] {
  return Object.fromEntries(
    LEAGUE_IDS.map((lg) => [
      lg,
      {
        league: lg,
        phase: "regular",
        round: 1,
        fixtures: buildFixtures(lg, careerSeed, seasonIndex),
      } satisfies LeagueSeason,
    ]),
  ) as Career["season"]["leagues"];
}

export function newCareer(clubId: ClubId, seed = randomSeed()): Career {
  const rng = new Rng(seed + ":init");
  const startYear = COMPETITIONS.prem.startYear; // both leagues start 2025
  const players: Record<string, PlayerRec> = {};
  for (const club of ALL_CLUBS) {
    for (const d of club.players) {
      players[d.id] = {
        id: d.id,
        name: d.name,
        nation: d.nation,
        role: d.role,
        alt: d.alt,
        age: d.age,
        ovr: d.ovr,
        overrides: d.overrides,
        pot: seedPotential(seed, d),
        clubId: club.id,
        wage: wageFor(d.ovr, d.age, seedPotential(seed, d)),
        expiry: startYear + rng.int(0, 2), // 1-3 seasons left
        form: 0,
        fatigue: 0,
        window: [1, 1], // pre-season: two virtual starts → cohesion-neutral
        morale: rng.int(58, 76),
        starts: 0,
        benchApps: 0,
        minutes: 0,
        tries: 0,
      };
    }
  }

  const career: Career = {
    v: 3,
    clubId,
    seasonIndex: 0,
    seed,
    gamePlan: "balanced",
    emphasis: "balanced",
    players,
    clubs: {} as Career["clubs"],
    board: freshBoard(clubId),
    season: {
      year: startYear,
      phase: "preseason",
      week: 0,
      leagues: freshLeagueSeasons(seed, 0),
    },
    inbox: [],
    history: [],
    soldStarsThisSeason: 0,
  };

  for (const club of ALL_CLUBS) {
    career.clubs[club.id] = {
      cash: seasonBudget(club.id),
      selection: { starters: {}, bench: [] },
      plan: "balanced",
    };
  }

  // Normalise wage bills: every club starts at 76-88% of its own wage ceiling
  // (stronger squads run closer to it), so nobody is born over the ceiling
  // and everyone can do at least some business.
  for (const club of ALL_CLUBS) {
    const squad = Object.values(players).filter((p) => p.clubId === club.id);
    const bill = squad.reduce((s, p) => s + p.wage, 0);
    const avg = squad.map((p) => p.ovr).sort((a, b) => b - a).slice(0, 23).reduce((s, v, _, arr) => s + v / arr.length, 0);
    const targetPct = clamp(0.76, 0.88, 0.76 + (avg - 72) * 0.012);
    const factor = (wageCapFor(club.id) * targetPct) / Math.max(1, bill);
    for (const p of squad) p.wage = Math.max(18, Math.round(p.wage * factor));
  }
  for (const club of ALL_CLUBS) {
    career.clubs[club.id].plan = bestPlanFor(career, club.id, seed);
    career.clubs[club.id].selection = autoPickSquad(rosterOf(career, club.id), {
      seed: seed + ":initial:" + club.id,
      rotate: false,
    });
  }
  career.gamePlan = career.clubs[clubId].plan;

  // Week-0 inbox: the season is set up before a ball is kicked.
  mail.push(career, mail.boardObjectiveMail(career));
  mail.push(career, mail.windowMail(career, true));
  const scout = mail.scoutNote(career, seed + ":w0");
  if (scout) mail.push(career, scout);

  return career;
}

// ---------------------------------------------------------------- Fixtures

/** One league's fixtures due in calendar week `week` (knockout fixtures carry
 *  their calendar week as their round, so the gate is uniform). */
function dueFixtures(ls: LeagueSeason, week: number): Fixture[] {
  if (ls.phase === "regular")
    return week >= 1 && week === ls.round
      ? ls.fixtures.filter((f) => f.round === week && !f.result)
      : [];
  const pool =
    ls.phase === "quarters"
      ? ls.quarters
      : ls.phase === "semis"
        ? ls.semis
        : ls.phase === "final" && ls.final
          ? [ls.final]
          : [];
  return (pool ?? []).filter((f) => f.round === week && !f.result);
}

/** Fixtures the next matchday will resolve — across BOTH leagues. A round can
 *  only be played in its own calendar week — Continue advances time between. */
export function pendingFixtures(career: Career): Fixture[] {
  if (career.season.phase === "offseason") return [];
  return LEAGUE_IDS.flatMap((lg) =>
    dueFixtures(career.season.leagues[lg], career.season.week),
  );
}

/** The user's next fixture, if they're involved in the pending round. */
export function nextUserFixture(career: Career): Fixture | undefined {
  if (career.unemployed) return undefined;
  return pendingFixtures(career).find(
    (f) => f.homeId === career.clubId || f.awayId === career.clubId,
  );
}

/** True when this week's rugby has been played and Continue advances time. */
export function roundPlayed(career: Career): boolean {
  return pendingFixtures(career).length === 0;
}

// ---------------------------------------------------------------- Matchday

function sideInput(
  career: Career,
  clubId: ClubId,
  fixtureSeed: string,
): { input: Omit<SideInput, "clubId" | "label">; selection: Selection } {
  const roster = rosterOf(career, clubId);
  const isUser = !career.unemployed && clubId === career.clubId;
  const stored = career.clubs[clubId].selection;
  const selection = isUser
    ? // Respect the user's sheet; auto-fill gaps and injured picks only.
      autoPickSquad(roster, { seed: fixtureSeed + ":fill", rotate: false }, filterAvailable(stored, career))
    : weeklySelection(roster, stored, fixtureSeed + ":" + clubId);

  return {
    selection,
    input: {
      lineup: lineupFromSelection(selection, career.players, career.season.year),
      benchAvg: benchAverage(selection, career.players),
      plan: isUser ? career.gamePlan : career.clubs[clubId].plan,
      emphasis: isUser ? career.emphasis : "balanced",
      cohesion: selectionCohesion(selection, career.players),
    },
  };
}

function filterAvailable(sel: Selection, career: Career): Selection {
  const ok = (pid: string) => {
    const p = career.players[pid];
    return !!p && isAvailable(p);
  };
  return {
    starters: Object.fromEntries(
      Object.entries(sel.starters).filter(([, pid]) => pid && ok(pid)),
    ),
    bench: sel.bench.filter(ok),
  };
}

/** Post-match condition/stat/morale updates for one club's full roster. */
function updateClubStates(
  career: Career,
  clubId: ClubId,
  selection: Selection,
  won: boolean,
  draw: boolean,
  motmName: string,
  tryScorers: string[],
  rng: Rng,
): void {
  const roster = rosterOf(career, clubId);
  const starterIds = new Set(Object.values(selection.starters));
  const benchIds = new Set(selection.bench);
  const tryCounts = new Map<string, number>();
  for (const nm of tryScorers) tryCounts.set(nm, (tryCounts.get(nm) ?? 0) + 1);

  for (const p of roster) {
    const started = starterIds.has(p.id);
    const benched = benchIds.has(p.id);
    if (started || benched) {
      p.fatigue = clamp(0, 100, p.fatigue + (started ? FATIGUE_START : FATIGUE_BENCH));
      p.window.unshift(started ? 1 : 0.5);
      let delta = (won ? 0.3 : draw ? 0 : -0.3) + rng.normal(0, 0.5);
      if (p.name === motmName) delta += 0.5;
      p.form = clamp(-FORM_CAP, FORM_CAP, Math.round((p.form + delta) * 10) / 10);
      p.morale = clamp(0, 100, p.morale + (started ? 2 : 0.5) + (won ? 1 : -1));
      if (started) {
        p.starts += 1;
        p.minutes += 68;
      } else {
        p.benchApps += 1;
        p.minutes += 22;
      }
      p.tries += tryCounts.get(p.name) ?? 0;
    } else {
      p.fatigue = clamp(0, 100, p.fatigue + FATIGUE_REST);
      p.window.unshift(0);
      p.form = Math.round(p.form * 0.85 * 10) / 10;
      // Fit, good, and left out: morale slips — stars slip faster.
      if (isAvailable(p)) p.morale = clamp(0, 100, p.morale - (p.ovr >= 78 ? 2.5 : 1.2));
      else p.morale = clamp(0, 100, p.morale + 0.5); // injured: no grudge
    }
    p.window = p.window.slice(0, 5);
  }
}

/** Fatigue-only recovery for clubs with a bye (playoff weeks). */
function restClub(career: Career, clubId: ClubId): void {
  for (const p of rosterOf(career, clubId)) {
    p.fatigue = clamp(0, 100, p.fatigue + FATIGUE_REST);
    p.form = Math.round(p.form * 0.85 * 10) / 10;
  }
}

function playFixture(career: Career, fx: Fixture): MatchReport | undefined {
  const comp = COMPETITIONS[fx.league];
  const knockout = fx.round > comp.rounds;
  const finalRound = comp.rounds + (comp.playoffTeams === 8 ? 3 : 2);
  const neutralVenue = fx.round === finalRound && comp.finalHosting === "neutral";
  const home = sideInput(career, fx.homeId, fx.seed);
  const away = sideInput(career, fx.awayId, fx.seed);

  const sim = simFixture(
    { clubId: fx.homeId, label: clubShort(fx.homeId), ...home.input },
    { clubId: fx.awayId, label: clubShort(fx.awayId), ...away.input },
    { seed: fx.seed, knockout, neutralVenue },
  );

  fx.result = {
    homePts: sim.home.points,
    awayPts: sim.away.points,
    homeTries: sim.home.tries,
    awayTries: sim.away.tries,
  };

  const rng = new Rng(fx.seed + ":post");
  updateClubStates(career, fx.homeId, home.selection, sim.homeWon, sim.draw, sim.motm.name, sim.home.tryScorers, rng);
  updateClubStates(career, fx.awayId, away.selection, !sim.homeWon && !sim.draw, sim.draw, sim.motm.name, sim.away.tryScorers, rng);

  // Persist the selections actually used (continuity for every club).
  career.clubs[fx.homeId].selection = home.selection;
  career.clubs[fx.awayId].selection = away.selection;

  // Injuries, both squads.
  const injuriesFor = (clubId: ClubId, sel: Selection) => {
    const starters = Object.values(sel.starters)
      .map((pid) => career.players[pid])
      .filter(Boolean);
    const bench = sel.bench.map((pid) => career.players[pid]).filter(Boolean);
    return rollMatchInjuries(starters, bench, fx.seed + ":" + clubId);
  };
  const homeInj = injuriesFor(fx.homeId, home.selection);
  const awayInj = injuriesFor(fx.awayId, away.selection);

  const userSide =
    !career.unemployed && fx.homeId === career.clubId
      ? "home"
      : !career.unemployed && fx.awayId === career.clubId
        ? "away"
        : null;
  if (!userSide) return undefined;

  const us = userSide === "home" ? sim.home : sim.away;
  const them = userSide === "home" ? sim.away : sim.home;
  const userInj = userSide === "home" ? homeInj : awayInj;
  const bonuses: string[] = [];
  let userLeaguePoints: number | undefined;
  if (!knockout) {
    const lp = leaguePoints(us.points, them.points, us.tries);
    userLeaguePoints = lp.points;
    if (lp.tryBonus) bonuses.push("Try bonus point (4+ tries)");
    if (lp.loseBonus) bonuses.push("Losing bonus point (within 7)");
  }

  const mkTeam = (side: "home" | "away") => {
    const r = side === "home" ? sim.home : sim.away;
    const inp = side === "home" ? home.input : away.input;
    return {
      clubId: side === "home" ? fx.homeId : fx.awayId,
      label: r.label,
      points: r.points,
      tries: r.tries,
      cons: r.cons,
      pens: r.pens,
      drops: r.drops,
      tryScorers: r.tryScorers,
      tactics: {
        plan: inp.plan,
        emphasis: inp.emphasis,
        fitMod: Math.round(r.fitMod * 10) / 10,
        cohesionMod: Math.round(r.cohesionMod * 10) / 10,
        cohesion: Math.round(inp.cohesion * 100) / 100,
      },
    };
  };

  return {
    fixtureId: fx.id,
    roundLabel: roundLabel(fx),
    home: mkTeam("home"),
    away: mkTeam("away"),
    draw: sim.draw,
    homeWon: sim.homeWon,
    motm: sim.motm,
    timeline: sim.timeline,
    headline: sim.headline,
    userLeaguePoints,
    bonuses: bonuses.length ? bonuses : undefined,
    injuries: userInj.length
      ? userInj.map((i) => ({ name: i.player.name, label: i.label, weeks: i.weeks }))
      : undefined,
  };
}

/** Advance one league's phase machine after its due fixtures were played. */
function advanceLeaguePhase(career: Career, ls: LeagueSeason): void {
  const comp = COMPETITIONS[ls.league];
  const clubIds = clubsOf(ls.league).map((c) => c.id);

  if (ls.phase === "regular") {
    if (ls.round >= comp.rounds) {
      const table = computeTable(clubIds, ls.fixtures);
      ls.leaderId = table[0].clubId;
      if (comp.shields) {
        ls.shieldWinners = computeShields(comp.shields, ls.fixtures);
        maybeShieldMail(career, ls);
      }
      if (comp.playoffTeams === 8) {
        ls.phase = "quarters";
        ls.quarters = buildQuarters(ls.league, table, career.seed, career.seasonIndex);
      } else {
        ls.phase = "semis";
        ls.semis = buildSemis(ls.league, table, career.seed, career.seasonIndex);
      }
    } else {
      ls.round += 1;
    }
  } else if (ls.phase === "quarters") {
    const winners = (ls.quarters ?? []).map((f) =>
      f.result!.homePts > f.result!.awayPts ? f.homeId : f.awayId,
    );
    const table = computeTable(clubIds, ls.fixtures);
    ls.semis = buildSemis(ls.league, table, career.seed, career.seasonIndex, winners);
    ls.phase = "semis";
  } else if (ls.phase === "semis") {
    const winners = (ls.semis ?? []).map((f) =>
      f.result!.homePts > f.result!.awayPts ? f.homeId : f.awayId,
    ) as [ClubId, ClubId];
    const table = computeTable(clubIds, ls.fixtures);
    ls.final = buildFinal(ls.league, winners, table, career.seed, career.seasonIndex);
    ls.phase = "final";
  } else if (ls.phase === "final") {
    const f = ls.final!;
    ls.championId = f.result!.homePts > f.result!.awayPts ? f.homeId : f.awayId;
    ls.phase = "done";
  }
}

function maybeShieldMail(career: Career, ls: LeagueSeason): void {
  const winners = ls.shieldWinners;
  const comp = COMPETITIONS[ls.league];
  if (!winners || !comp.shields) return;
  const mine = comp.shields.find((s) => winners[s.id] === career.clubId);
  if (!career.unemployed && mine) {
    mail.push(career, {
      id: `${career.seasonIndex}:${career.season.week}:shield`,
      season: career.seasonIndex,
      week: career.season.week,
      kind: "board",
      from: "The board",
      subject: `🏅 ${mine.label} winners!`,
      body: `The derby ledger is settled and it reads ${clubShort(career.clubId)}: we top the pool and lift the ${mine.label}.\nIt goes in the cabinet at season's end — and the playoffs are still to come.`,
    });
  } else if (userLeague(career) === ls.league) {
    const lines = comp.shields.map((s) => `${s.label}: ${clubShort(winners[s.id])}.`);
    mail.push(career, {
      id: `${career.seasonIndex}:${career.season.week}:shields`,
      season: career.seasonIndex,
      week: career.season.week,
      kind: "news",
      from: `${comp.shortName} Weekly`,
      subject: "Regional Shields decided",
      body: lines.join("\n"),
    });
  }
}

/**
 * Resolve the pending round in BOTH leagues (user's match + every AI fixture)
 * and run the board's reaction. Does NOT advance the week — advanceWeek does.
 */
export function playMatchday(career: Career): void {
  const fixtures = pendingFixtures(career);
  if (fixtures.length === 0) return;

  const playing = new Set<ClubId>();
  const leaguesPlayed = new Set<LeagueId>();
  let report: MatchReport | undefined;
  for (const fx of fixtures) {
    playing.add(fx.homeId);
    playing.add(fx.awayId);
    leaguesPlayed.add(fx.league);
    const rep = playFixture(career, fx);
    if (rep) report = rep;
  }
  for (const club of ALL_CLUBS) {
    if (!playing.has(club.id)) restClub(career, club.id);
  }
  career.lastReport = report;
  career.emphasis = "balanced"; // per-match dial resets

  // Phase machines (only leagues that actually played move on).
  for (const lg of leaguesPlayed) advanceLeaguePhase(career, career.season.leagues[lg]);

  // Both finals done → the season is over.
  if (LEAGUE_IDS.every((lg) => career.season.leagues[lg].phase === "done")) {
    finishSeason(career);
    return;
  }

  // Board reaction (regular season only, and only while employed).
  const us = userSeason(career);
  if (!career.unemployed && us.phase === "regular" && report) {
    const table = userTable(career);
    const pos = tablePosition(table, career.clubId);
    const userIsHome = report.home.clubId === career.clubId;
    const won = !report.draw && (userIsHome ? report.homeWon : !report.homeWon);
    const playedRound = us.round - 1 || 1;
    updateConfidence(career.board, pos, playedRound, won ? "win" : report.draw ? "draw" : "loss");

    if (!career.board.warned && career.board.confidence <= 25 && playedRound >= 4) {
      career.board.warned = true;
      mail.push(career, mail.boardWarningMail(career, pos));
    }
    if (!career.board.praised && pos <= Math.max(1, career.board.objective - 2) && playedRound >= 8) {
      career.board.praised = true;
      mail.push(career, mail.boardPraiseMail(career, pos));
    }
    if (sackCheck(career.board, playedRound)) sackUser(career, pos);
  }
}

// ---------------------------------------------------------------- Sackings

function sackUser(career: Career, pos: number): void {
  career.unemployed = true;
  career.jobOffers = jobOffers(career.clubId, career.seed + ":sack:" + career.season.week);
  mail.push(career, {
    id: `${career.seasonIndex}:${career.season.week}:sacked`,
    season: career.seasonIndex,
    week: career.season.week,
    kind: "board",
    from: "The board",
    subject: "Your services are no longer required",
    body: `The board has lost confidence in the direction of the team — ${posText(pos)} was not the plan, and the dressing room has stopped responding.\nYour contract is terminated with immediate effect. The statement thanks you for your efforts. It is two sentences long.`,
  });
  pushJobOfferMails(career);
}

function posText(pos: number): string {
  return `${pos}${pos % 10 === 1 && pos % 100 !== 11 ? "st" : pos % 10 === 2 && pos % 100 !== 12 ? "nd" : pos % 10 === 3 && pos % 100 !== 13 ? "rd" : "th"} in the table`;
}

function jobMail(career: Career, clubId: ClubId, poach = false): void {
  const already = career.inbox.some(
    (it) => it.kind === "job" && !it.resolved && it.decision?.kind === "job" && it.decision.job.clubId === clubId,
  );
  if (already) return;
  const o = objectiveFor(clubId);
  const comp = COMPETITIONS[leagueOf(clubId)];
  const cross = leagueOf(clubId) !== userLeague(career);
  mail.push(career, {
    id: `${career.seasonIndex}:${career.season.week}:job:${clubId}`,
    season: career.seasonIndex,
    week: career.season.week,
    kind: "job",
    from: clubShort(clubId),
    subject: `Approach: the ${clubShort(clubId)} job${cross ? ` (${comp.shortName})` : ""}`,
    body: poach
      ? `Your season has been noticed${cross ? " across the water" : ""}. ${clubShort(clubId)} of the ${comp.name} want you as their next head coach. The brief: ${o.label.toLowerCase()}.\nBigger club, bigger budget, bigger expectations. Your board would not stand in your way — but they would not forgive it either.`
      : `${clubShort(clubId)} would like to talk. The brief: ${o.label.toLowerCase()}.${cross ? `\nIt would mean a move to the ${comp.name}.` : ""}\nIt's not the job you had. It's the job on the table.`,
    decision: { kind: "job", job: { clubId } },
  });
}

function pushJobOfferMails(career: Career): void {
  for (const clubId of career.jobOffers ?? []) jobMail(career, clubId);
}

/** Accept a job (from unemployment or a season-end approach) — either league. */
export function takeJob(career: Career, clubId: ClubId): void {
  career.clubId = clubId;
  career.unemployed = false;
  career.jobOffers = undefined;
  career.board = freshBoard(clubId);
  career.gamePlan = career.clubs[clubId].plan;
  // Withdraw other open job offers.
  for (const it of career.inbox) {
    if (it.kind === "job" && !it.resolved)
      it.resolved = it.decision?.kind === "job" && it.decision.job.clubId === clubId ? "Accepted" : "Declined";
  }
  mail.push(career, mail.boardObjectiveMail(career));
}

// ---------------------------------------------------------------- The week

// Hand-off between the market tick and the news digest within one advanceWeek.
let pendingAiMoves: ReturnType<typeof aiMarketTick> = [];

/**
 * Advance the calendar one week: recoveries, market activity, the inbox.
 * Call only when the current week's rugby is fully played (or none exists).
 */
export function advanceWeek(career: Career): void {
  const s = career.season;
  if (s.phase === "offseason") return;
  if (pendingFixtures(career).length > 0) return; // play the round first

  const prevWeek = s.week;
  if (s.phase === "preseason") s.phase = "playing";
  s.week += 1;
  const week = s.week;
  const seed = `${career.seed}:wk:${career.seasonIndex}:${week}`;

  // 1. Bodies: injuries tick down, everyone recovers a little.
  const recovered = tickInjuries(Object.values(career.players)).filter(
    (p) => p.clubId === career.clubId || p.loan?.toId === career.clubId,
  );
  for (const p of Object.values(career.players)) {
    p.fatigue = clamp(0, 100, p.fatigue + FATIGUE_RECOVERY);
    // Morale drifts gently toward the 62 norm.
    p.morale = clamp(0, 100, p.morale + (62 - p.morale) * 0.04);
  }

  // 2. Promises come due after 5 weeks.
  if (!career.unemployed) {
    for (const p of rosterOf(career, career.clubId)) {
      if (p.promise && week - p.promise.madeWeek >= 5) {
        const startsSince = p.window.filter((v) => v === 1).length;
        if (startsSince >= 3) p.morale = clamp(0, 100, p.morale + 10);
        else p.morale = clamp(0, 100, p.morale - 20);
        delete p.promise;
      }
    }
  }

  // 3. Expire stale offers, then archive old informational mail (inbox
  //    hygiene: non-decision items self-clean after a few weeks).
  for (const it of career.inbox) {
    if (it.kind === "offer" && !it.resolved && it.decision?.kind === "offer" && week > it.decision.offer.expiresWeek)
      it.resolved = "Expired";
  }
  mail.archiveOldMail(career);

  // 4. The market (windows only) — spans both leagues.
  const open = windowOpen(week);
  const us = userSeason(career);
  if (open) {
    const moves = aiMarketTick(career, seed);
    if (us.phase !== "regular" || !moves.length) {
      const tn = mail.transferNewsOnly(career, moves);
      if (tn) mail.push(career, tn);
    } else {
      // folded into the news digest below
      pendingAiMoves = moves;
    }
    if (!career.unemployed) {
      const offer = mail.offerMail(career, seed);
      if (offer) mail.push(career, offer);
      const scout = mail.scoutNote(career, seed);
      if (scout) mail.push(career, scout);
    }
  }
  if (week === MID_WINDOW[0]) mail.push(career, mail.windowMail(career, true));
  if (week === MID_WINDOW[1]) mail.push(career, mail.windowMail(career, false));

  // 5. News digest + injury report about the round just played (user league).
  const userLg = userLeague(career);
  const comp = COMPETITIONS[userLg];
  if (prevWeek >= 1 && prevWeek <= comp.rounds) {
    const fixtures = career.season.leagues[userLg].fixtures;
    const played = fixtures.filter((f) => f.round === prevWeek);
    const clubIds = clubsOf(userLg).map((c) => c.id);
    const table = computeTable(clubIds, fixtures);
    const prevTable =
      prevWeek > 1
        ? computeTable(clubIds, fixtures.filter((f) => f.round < prevWeek))
        : null;
    mail.push(career, mail.newsDigest(career, prevWeek, played, table, prevTable, pendingAiMoves));
  }
  pendingAiMoves = [];

  // 5b. Big stories from the other league only (league news stays local).
  const other = mail.otherLeagueNews(career, prevWeek);
  if (other) mail.push(career, other);

  if (!career.unemployed) {
    const inj = mail.injuryReport(career, career.lastReport?.injuries ?? [], recovered);
    if (inj) mail.push(career, inj);

    // 6. Squad noise: contracts and unhappiness.
    for (const it of mail.contractWarnings(career)) mail.push(career, it);
    const unhappy = mail.unhappyMail(career, seed);
    if (unhappy) mail.push(career, unhappy);
  } else {
    // Unemployed: refresh the job market every couple of weeks.
    if (week % 2 === 0) {
      career.jobOffers = jobOffers(career.clubId, seed);
      pushJobOfferMails(career);
    }
  }

  // 7. Next fixture preview.
  if (!career.unemployed) {
    const next = nextUserFixture(career);
    if (next) mail.push(career, mail.matchPreview(career, next, userTable(career)));
  }
}

// ---------------------------------------------------------------- Season end

function finishSeason(career: Career): void {
  const s = career.season;
  s.phase = "offseason";
  s.week = OFFSEASON_WEEK;
  // The calendar jumps to the off-season without a weekly tick — run the
  // inbox archive here so mid-season leftovers don't linger all summer.
  mail.archiveOldMail(career);

  const userLg = userLeague(career);
  const us = s.leagues[userLg];
  const comp = COMPETITIONS[userLg];
  const table = userTable(career);
  const pos = tablePosition(table, career.clubId);
  const row = table.find((r) => r.clubId === career.clubId)!;
  const shields = comp.shields
    ?.filter((sh) => us.shieldWinners?.[sh.id] === career.clubId)
    .map((sh) => sh.id);

  // Development: growth, decline, retirements — the report the CEO asked for.
  career.progression = runSeasonProgression(career.players, career.clubId, s.year, career.seed);

  // Contracts expire (before the year ticks over in rollover).
  const { userLosses } = runContractExpiry(career, career.seed + ":" + s.year);

  const sacked = !career.unemployed && endOfSeasonSack(career.board, pos);

  career.history.push({
    year: s.year,
    clubId: career.clubId,
    league: userLg,
    position: pos,
    champion: us.championId === career.clubId,
    leader: us.leaderId === career.clubId,
    shields: shields?.length ? shields : undefined,
    wins: row.won,
    losses: row.lost,
    sacked,
  });

  // The other league's title, as world news.
  const otherLg: LeagueId = userLg === "prem" ? "urc" : "prem";
  const otherChamp = s.leagues[otherLg].championId;
  if (otherChamp) {
    mail.push(career, {
      id: `${career.seasonIndex}:${OFFSEASON_WEEK}:otherchamp`,
      season: career.seasonIndex,
      week: OFFSEASON_WEEK,
      kind: "news",
      from: "World rugby desk",
      subject: `${clubShort(otherChamp)} crowned ${COMPETITIONS[otherLg].shortName} champions`,
      body: `Across the water, ${clubShort(otherChamp)} took the ${COMPETITIONS[otherLg].name} title.\nEvery final watched from a distance is a job advert — for somebody.`,
    });
  }

  // Progression mail (summary; the review screen shows the full report).
  const rep = career.progression;
  const lines: string[] = [];
  if (rep.grew.length)
    lines.push(
      `Grew: ${rep.grew.slice(0, 4).map((e) => `${e.name} ${e.from}→${e.to}`).join(", ")}${rep.grew.length > 4 ? ` and ${rep.grew.length - 4} more` : ""}.`,
    );
  if (rep.declined.length)
    lines.push(
      `Declined: ${rep.declined.slice(0, 4).map((e) => `${e.name} ${e.from}→${e.to}`).join(", ")}${rep.declined.length > 4 ? ` and ${rep.declined.length - 4} more` : ""}.`,
    );
  if (rep.retired.length)
    lines.push(`Hanging up the boots: ${rep.retired.map((r) => `${r.name} (${r.age})`).join(", ")}.`);
  if (userLosses.length)
    lines.push(`Walked for free — contracts ran out: ${userLosses.map((p) => p.name).join(", ")}.`);
  mail.push(career, {
    id: `${career.seasonIndex}:${OFFSEASON_WEEK}:prog`,
    season: career.seasonIndex,
    week: OFFSEASON_WEEK,
    kind: "progression",
    from: "Head of development",
    subject: `Your season: who grew, who declined`,
    body: lines.length ? lines.join("\n") : "A quiet year on the training pitch.",
  });

  if (sacked) {
    career.unemployed = true;
    career.jobOffers = jobOffers(career.clubId, career.seed + ":eos:" + s.year);
    mail.push(career, {
      id: `${career.seasonIndex}:${OFFSEASON_WEEK}:sacked`,
      season: career.seasonIndex,
      week: OFFSEASON_WEEK,
      kind: "board",
      from: "The board",
      subject: "The board has made a change",
      body: `Finishing ${posText(pos)} against an objective of "${career.board.objectiveLabel}" made this inevitable. The club thanks you for your service.\nOther clubs have taken notice of your availability — offers are in your inbox.`,
    });
    pushJobOfferMails(career);
  } else if (!career.unemployed) {
    // Overperform and the other league comes calling (board.ts).
    const approach = poachApproach(
      career.clubId,
      pos,
      career.board.objective,
      us.championId === career.clubId,
      career.seed + ":eos:" + s.year,
    );
    if (approach) jobMail(career, approach, true);
  }
}

/** Roll the world into next season. */
export function startNextSeason(career: Career): void {
  const nextIndex = career.seasonIndex + 1;
  const year = COMPETITIONS.prem.startYear + nextIndex;

  // Loans end; everyone goes home.
  for (const p of Object.values(career.players)) delete p.loan;

  // Ages, condition, stats.
  for (const p of Object.values(career.players)) {
    p.age += 1;
    p.fatigue = 0;
    p.form = 0;
    p.window = [1, 1];
    p.morale = clamp(0, 100, 62 + (p.morale - 62) * 0.4);
    p.starts = 0;
    p.benchApps = 0;
    p.minutes = 0;
    p.tries = 0;
    delete p.promise;
  }

  // Youth intake, world-wide (both leagues).
  const usedNames = new Set(Object.values(career.players).map((p) => p.name));
  const userYouth: { name: string; age: number; ovr: number; role: PlayerRec["role"] }[] = [];
  for (const club of ALL_CLUBS) {
    for (const y of youthIntake(club.id, year, career.seed, usedNames)) {
      career.players[y.id] = y;
      if (club.id === career.clubId)
        userYouth.push({ name: y.name, age: y.age, ovr: y.ovr, role: y.role });
    }
  }
  if (career.progression) career.progression.youth = userYouth;

  // Budgets: fresh kitty + a slice of what was left.
  for (const club of ALL_CLUBS) {
    career.clubs[club.id].cash = Math.round(career.clubs[club.id].cash * 0.35 + seasonBudget(club.id));
    career.clubs[club.id].selection = autoPickSquad(rosterOf(career, club.id), {
      seed: career.seed + ":initial:" + club.id + ":" + nextIndex,
      rotate: false,
    });
    career.clubs[club.id].plan = bestPlanFor(career, club.id, career.seed + ":" + nextIndex);
  }

  // Season-end approaches lapse if the user is staying put.
  if (!career.unemployed) {
    for (const it of career.inbox) {
      if (it.kind === "job" && !it.resolved) it.resolved = "The moment passed";
    }
  }

  career.seasonIndex = nextIndex;
  career.emphasis = "balanced";
  career.gamePlan = career.unemployed ? career.gamePlan : career.clubs[career.clubId].plan;
  career.lastReport = undefined;
  career.soldStarsThisSeason = 0;
  career.season = {
    year,
    phase: "preseason",
    week: 0,
    leagues: freshLeagueSeasons(career.seed, nextIndex),
  };

  if (!career.unemployed) {
    const o = objectiveFor(career.clubId);
    const last = career.history[career.history.length - 1];
    const carry = last && last.position <= o.target ? 12 : 0;
    career.board = { confidence: clamp(35, 75, 55 + carry), objective: o.target, objectiveLabel: o.label };
    mail.push(career, mail.boardObjectiveMail(career));
  }
  mail.push(career, mail.windowMail(career, true));
  const scout = mail.scoutNote(career, career.seed + ":w0:" + nextIndex);
  if (scout) mail.push(career, scout);
}

export function seasonTitle(career: Career): string {
  return `${COMPETITIONS[userLeague(career)].name} ${seasonLabel(career.season.year)}`;
}
