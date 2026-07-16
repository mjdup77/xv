// Headless verification harness for the management game (multi-league).
//
//   npx tsx scripts/mgr-sim.ts difficulty        — passive-player finish distributions (Prem)
//   npx tsx scripts/mgr-sim.ts difficulty-urc    — same for URC clubs (top/mid/bottom)
//   npx tsx scripts/mgr-sim.ts drift             — 5-season world drift + health (both leagues)
//   npx tsx scripts/mgr-sim.ts week              — trace one club's inbox for a few weeks
//   npx tsx scripts/mgr-sim.ts injuries          — injury frequency/streakiness audit
//   npx tsx scripts/mgr-sim.ts inbox-size        — inbox depth over a season (hygiene audit)
//
// "Passive player" = starts a career, then only ever taps Continue/Matchday
// (auto-filled selection, Balanced plan untouched, no market activity).

import { newCareer, playMatchday, advanceWeek, startNextSeason, pendingFixtures } from "../src/manager/engine/season";
import { computeTable } from "../src/manager/engine/table";
import { clubsOf, leagueOf } from "../src/manager/world";
import type { Career, ClubId, LeagueId } from "../src/manager/types";

const mode = process.argv[2] ?? "difficulty";

function playSeason(career: Career): void {
  let guard = 0;
  while (career.season.phase !== "offseason" && guard++ < 80) {
    if (pendingFixtures(career).length > 0) playMatchday(career);
    else advanceWeek(career);
  }
}

function finishOf(career: Career, clubId: ClubId) {
  const lg = leagueOf(clubId);
  const ls = career.season.leagues[lg];
  const table = computeTable(clubsOf(lg).map((c) => c.id), ls.fixtures);
  return {
    pos: table.findIndex((r) => r.clubId === clubId) + 1,
    champion: ls.championId === clubId,
    won: table.find((r) => r.clubId === clubId)!.won,
    played: table.find((r) => r.clubId === clubId)!.played,
  };
}

function difficultyRun(clubs: ClubId[], N: number): void {
  for (const clubId of clubs) {
    const lg = leagueOf(clubId);
    const nTeams = clubsOf(lg).length;
    const playoffN = lg === "urc" ? 8 : 4;
    const positions: number[] = [];
    let champs = 0, playoffs = 0, winSum = 0, playedSum = 0, sacked = 0, shields = 0;
    for (let i = 0; i < N; i++) {
      const c = newCareer(clubId, `sim-${clubId}-${i}`);
      playSeason(c);
      const f = finishOf(c, clubId);
      positions.push(f.pos);
      if (f.champion) champs++;
      if (f.pos <= playoffN) playoffs++;
      winSum += f.won;
      playedSum += f.played;
      if (c.unemployed) sacked++;
      const sw = c.season.leagues[lg].shieldWinners;
      if (sw && Object.values(sw).includes(clubId)) shields++;
    }
    const avg = positions.reduce((s, v) => s + v, 0) / N;
    const dist = Array.from({ length: nTeams }, (_, i) => positions.filter((p) => p === i + 1).length);
    console.log(
      `${clubId.padEnd(11)} avgPos ${avg.toFixed(2)}  top${playoffN} ${((playoffs / N) * 100).toFixed(0)}%  title ${((champs / N) * 100).toFixed(0)}%${lg === "urc" ? `  shield ${((shields / N) * 100).toFixed(0)}%` : ""}  winRate ${((winSum / playedSum) * 100).toFixed(0)}%  sacked ${((sacked / N) * 100).toFixed(0)}%  posDist [${dist.join(",")}]`,
    );
  }
}

// Optional club filter: `npx tsx scripts/mgr-sim.ts difficulty-urc zebre`
// (a full two-league season sim is heavy — this allows parallel runs).
const onlyClub = process.argv[3] as ClubId | undefined;
const filt = (clubs: ClubId[]) => (onlyClub ? clubs.filter((c) => c === onlyClub) : clubs);

if (mode === "difficulty") {
  difficultyRun(filt(["bath", "sale", "gloucester", "newcastle"]), 100);
}

if (mode === "difficulty-urc") {
  // Top (Leinster, Bulls), mid (Edinburgh, Cardiff), bottom (Dragons, Zebre).
  difficultyRun(filt(["leinster", "bulls", "edinburgh", "cardiff", "dragons", "zebre"]), 100);
}

if (mode === "titles") {
  // AI-only world health: who wins each league over N passive seasons?
  const N = 100;
  const winners: Record<LeagueId, Record<string, number>> = { prem: {}, urc: {} };
  for (let i = 0; i < N; i++) {
    const c = newCareer("gloucester", `titles-${i}`);
    playSeason(c);
    for (const lg of ["prem", "urc"] as LeagueId[]) {
      const champ = c.season.leagues[lg].championId!;
      winners[lg][champ] = (winners[lg][champ] ?? 0) + 1;
    }
  }
  for (const lg of ["prem", "urc"] as LeagueId[]) {
    const sorted = Object.entries(winners[lg]).sort((a, b) => b[1] - a[1]);
    console.log(`${lg}: ${sorted.map(([k, v]) => `${k} ${v}%`).join("  ")}`);
  }
}

if (mode === "drift") {
  const SEASONS = 5;
  const c = newCareer("sale", "drift-1");
  const snapshot = (label: string) => {
    const players = Object.values(c.players).filter((p) => p.clubId);
    const avg = players.reduce((s, p) => s + p.ovr, 0) / players.length;
    const avgAge = players.reduce((s, p) => s + p.age, 0) / players.length;
    const perLeague = (["prem", "urc"] as LeagueId[]).map((lg) => {
      const top23s = clubsOf(lg).map((cl) => {
        const top = players.filter((p) => p.clubId === cl.id).map((p) => p.ovr).sort((a, b) => b - a).slice(0, 23);
        return top.reduce((s, v) => s + v, 0) / Math.max(1, top.length);
      });
      return `${lg} ${(top23s.reduce((s, v) => s + v, 0) / top23s.length).toFixed(1)}`;
    });
    console.log(
      `${label}: players ${players.length}  avgOvr ${avg.toFixed(1)}  avgTop23 ${perLeague.join(" / ")}  avgAge ${avgAge.toFixed(1)}`,
    );
  };
  snapshot("start   ");
  for (let sIdx = 0; sIdx < SEASONS; sIdx++) {
    playSeason(c);
    const f = finishOf(c, c.clubId);
    const inboxThisSeason = c.inbox.filter((it) => it.season === c.seasonIndex).length;
    console.log(
      `  season ${sIdx + 1}: ${c.clubId} finished ${f.pos}${c.unemployed ? " (SACKED)" : ""}  premChamp=${c.season.leagues.prem.championId}  urcChamp=${c.season.leagues.urc.championId}  inboxItems ${inboxThisSeason}  cash ${Math.round(c.clubs[c.clubId].cash)}`,
    );
    // If sacked, take the first job offer so the run can continue.
    if (c.unemployed && c.jobOffers?.length) {
      const job = c.jobOffers[0];
      c.clubId = job;
      c.unemployed = false;
      c.jobOffers = undefined;
    }
    startNextSeason(c);
    snapshot(`season ${sIdx + 1}`);
  }
}

if (mode === "injuries") {
  // Injury frequency & streakiness audit (CEO playtest follow-up).
  // Sanity bands: 0.3–0.6 new injuries per club per match, P(2+ in a match)
  // < 10%, a typical squad carrying ~2–4 injured mid-season, and week 1 no
  // worse than any other week.
  const SEASONS = Number(process.argv[3] ?? 20);
  const perMatch = [0, 0, 0, 0, 0]; // count of club-matches with 0,1,2,3,4+ new injuries
  let clubMatches = 0;
  let totalNew = 0;
  const byWeek = new Map<number, { m: number; inj: number }>();
  let simulSamples = 0;
  let simulSum = 0;
  const simulDist = [0, 0, 0, 0, 0, 0, 0]; // squads carrying 0..6+ injured (mid-season)
  const durSum = { w: 0, n: 0 };

  const clubOf = (p: { clubId: ClubId | null; loan?: { toId: ClubId } }) =>
    p.loan?.toId ?? p.clubId;

  for (let s = 0; s < SEASONS; s++) {
    const c = newCareer("gloucester", `injaudit-${s}`);
    let guard = 0;
    while (c.season.phase !== "offseason" && guard++ < 80) {
      if (pendingFixtures(c).length > 0) {
        const week = c.season.week;
        const playing = new Set<ClubId>();
        for (const f of pendingFixtures(c)) {
          playing.add(f.homeId);
          playing.add(f.awayId);
        }
        const before = new Set(
          Object.values(c.players).filter((p) => p.injury).map((p) => p.id),
        );
        playMatchday(c);
        const fresh = Object.values(c.players).filter((p) => p.injury && !before.has(p.id));
        const perClub = new Map<ClubId, number>();
        for (const id of playing) perClub.set(id, 0);
        for (const p of fresh) {
          const id = clubOf(p);
          if (id && playing.has(id)) perClub.set(id, (perClub.get(id) ?? 0) + 1);
          durSum.w += p.injury!.weeks;
          durSum.n += 1;
        }
        for (const [, n] of perClub) {
          clubMatches++;
          totalNew += n;
          perMatch[Math.min(n, 4)]++;
          const bw = byWeek.get(week) ?? { m: 0, inj: 0 };
          bw.m++;
          bw.inj += n;
          byWeek.set(week, bw);
        }
      } else {
        advanceWeek(c);
        // Mid-season carried-injury load, sampled after recovery ticks.
        if (c.season.week >= 6 && c.season.week <= 16) {
          const carried = new Map<ClubId, number>();
          for (const p of Object.values(c.players)) {
            const id = clubOf(p);
            if (id && p.injury) carried.set(id, (carried.get(id) ?? 0) + 1);
          }
          for (const club of [...clubsOf("prem"), ...clubsOf("urc")]) {
            const n = carried.get(club.id) ?? 0;
            simulSamples++;
            simulSum += n;
            simulDist[Math.min(n, 6)]++;
          }
        }
      }
    }
  }

  const pct = (n: number) => ((n / clubMatches) * 100).toFixed(1);
  console.log(`club-matches sampled: ${clubMatches} over ${SEASONS} two-league seasons`);
  console.log(`new injuries per club per match: ${(totalNew / clubMatches).toFixed(3)}`);
  console.log(
    `per-match distribution: P(0) ${pct(perMatch[0])}%  P(1) ${pct(perMatch[1])}%  P(2) ${pct(perMatch[2])}%  P(3+) ${pct(perMatch[3] + perMatch[4])}%  → P(2+) ${pct(perMatch[2] + perMatch[3] + perMatch[4])}%`,
  );
  console.log(`avg injury duration: ${(durSum.w / durSum.n).toFixed(2)} weeks`);
  console.log(
    `mid-season carried injuries per squad (wks 6-16): avg ${(simulSum / simulSamples).toFixed(2)}  dist 0:${((simulDist[0] / simulSamples) * 100).toFixed(0)}% 1:${((simulDist[1] / simulSamples) * 100).toFixed(0)}% 2:${((simulDist[2] / simulSamples) * 100).toFixed(0)}% 3:${((simulDist[3] / simulSamples) * 100).toFixed(0)}% 4:${((simulDist[4] / simulSamples) * 100).toFixed(0)}% 5+:${(((simulDist[5] + simulDist[6]) / simulSamples) * 100).toFixed(0)}%`,
  );
  const weeks = [...byWeek.entries()].sort((a, b) => a[0] - b[0]);
  console.log("rate by calendar week:");
  for (const [w, v] of weeks)
    console.log(`  wk ${String(w).padStart(2)}: ${(v.inj / v.m).toFixed(3)} (${v.m} club-matches)`);
}

if (mode === "inbox-size") {
  // Inbox depth audit for the hygiene work: how deep does a passive player's
  // inbox get by mid-season / season end?
  const c = newCareer("gloucester", "inboxsize-1");
  let guard = 0;
  while (c.season.phase !== "offseason" && guard++ < 80) {
    if (pendingFixtures(c).length > 0) playMatchday(c);
    else {
      advanceWeek(c);
      const open = c.inbox.filter((it) => it.decision && !it.resolved).length;
      console.log(
        `wk ${String(c.season.week).padStart(2)}: inbox ${String(c.inbox.length).padStart(3)} items (${open} open decisions)`,
      );
    }
  }
}

if (mode === "week") {
  const c = newCareer("gloucester", "week-trace-1");
  console.log("== WEEK 0 (pre-season) ==");
  for (const it of [...c.inbox].reverse()) console.log(`  [${it.kind}] ${it.subject}`);
  for (let w = 1; w <= 12; w++) {
    const before = c.inbox.length;
    if (pendingFixtures(c).length > 0) playMatchday(c);
    advanceWeek(c);
    const fresh = c.inbox.slice(0, c.inbox.length - before);
    console.log(`== WEEK ${c.season.week} == (${fresh.length} new items)`);
    for (const it of [...fresh].reverse()) {
      console.log(`  [${it.kind}]${it.decision ? " (DECISION)" : ""} ${it.subject}`);
    }
  }
}
