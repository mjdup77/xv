// Inbox generation: everything that "happens" between fixtures arrives here.
// Volume is tuned to 2-5 meaningful items per week — preview + news digest
// always, then at most two event items (offer / contract / unhappy / board /
// scout). Spec: docs/manager/DESIGN-management.md §2.

import { Rng } from "../../engine/rng";
import { computeFacets } from "../../engine/ratings";
import { COMPETITIONS } from "../../data/manager";
import type {
  Career,
  ClubId,
  Fixture,
  InboxItem,
  PlayerRec,
  TableRow,
} from "../types";
import { clubName, clubShort, rosterOf, userLeague } from "../world";
import { fmtMoney, renewalDemand, valuation } from "./finance";
import { lineupFromSelection, weeklySelection } from "./selection";
import { ordinalWord } from "./util";
import { roundLabel } from "./schedule";
import { isFringe, rollIncomingOffer, windowLabel, windowOpen, MID_WINDOW } from "./transfers";
import { GAME_PLANS } from "./tactics";
import { tablePosition } from "./table";

let counter = 0;
function mkItem(
  career: Career,
  kind: InboxItem["kind"],
  from: string,
  subject: string,
  body: string,
  decision?: InboxItem["decision"],
): InboxItem {
  // Date suffix keeps ids unique across page reloads within the same week.
  return {
    id: `${career.seasonIndex}:${career.season.week}:${kind}:${(Date.now() % 1e7).toString(36)}${counter++}`,
    season: career.seasonIndex,
    week: career.season.week,
    kind,
    from,
    subject,
    body,
    decision,
  };
}

export function push(career: Career, item: InboxItem): void {
  career.inbox.unshift(item);
  // Keep the mailbox bounded: drop resolved/read items beyond 120.
  if (career.inbox.length > 160)
    career.inbox = career.inbox.filter((it, i) => i < 120 || (!it.read && !it.resolved));
}

// ------------------------------------------------------------- Lifecycle

/** Weeks a non-pinned item survives before the weekly tick archives it. */
export const ARCHIVE_AFTER_WEEKS = 4;

/** An item the player must not lose: an unresolved decision stays pinned. */
export function isPinned(it: InboxItem): boolean {
  return !!it.decision && !it.resolved;
}

/** Calendar age of an item in weeks (seasons are 22-week calendars). */
function mailAge(career: Career, it: InboxItem): number {
  return (career.seasonIndex - it.season) * 23 + (career.season.week - it.week);
}

/**
 * Weekly hygiene tick (called from advanceWeek): informational and resolved
 * mail auto-archives after ARCHIVE_AFTER_WEEKS so a mid-season inbox stays
 * ~10-15 rows instead of 60. Pinned items (open decisions) never archive.
 */
export function archiveOldMail(career: Career): void {
  career.inbox = career.inbox.filter(
    (it) => isPinned(it) || mailAge(career, it) <= ARCHIVE_AFTER_WEEKS,
  );
}

// ---------------------------------------------------------------- Previews

export function matchPreview(career: Career, fixture: Fixture, table: TableRow[]): InboxItem {
  const isHome = fixture.homeId === career.clubId;
  const oppId = isHome ? fixture.awayId : fixture.homeId;
  const rng = new Rng(fixture.seed + ":preview");

  // Opposition analysis from their actual likely XV.
  const oppSel = weeklySelection(rosterOf(career, oppId), career.clubs[oppId].selection, fixture.seed + ":scout");
  const facets = computeFacets(lineupFromSelection(oppSel, career.players, career.season.year));
  const units: [string, number][] = [
    ["set-piece", facets.setPiece],
    ["breakdown", facets.breakdown],
    ["defence", facets.defence],
    ["attack", facets.attack],
    ["kicking game", facets.control],
  ];
  units.sort((a, b) => b[1] - a[1]);
  const strong = units[0];
  const weak = units[units.length - 1];
  const star = rosterOf(career, oppId)
    .filter((p) => !p.injury)
    .sort((a, b) => b.ovr - a.ovr)[0];
  const oppPos = tablePosition(table, oppId);
  const plan = GAME_PLANS[career.clubs[oppId].plan].label;

  const opener = rng.pick([
    `The analysts have been through the tape ahead of ${isHome ? "the visit of" : "the trip to"} ${clubName(oppId)}.`,
    `${clubShort(oppId)} up next. Here's what the video room makes of them.`,
    `Preparation week. The coaches' notes on ${clubShort(oppId)} are in.`,
  ]);
  const body = [
    opener,
    `They sit ${ordinalWord(oppPos)} and set up ${plan}. Their ${strong[0]} is the platform everything runs off — if we blunt that, we're halfway there. The soft spot is their ${weak[0]}.`,
    star ? `Danger man: ${star.name} (${star.ovr}). Kick to him at your peril.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const comp = COMPETITIONS[fixture.league];
  const finalRound = comp.rounds + (comp.playoffTeams === 8 ? 3 : 2);
  const label = fixture.round === finalRound ? "THE FINAL" : roundLabel(fixture);
  return mkItem(
    career,
    "preview",
    "Analysis dept.",
    `${label}: ${isHome ? "vs" : "at"} ${clubShort(oppId)} — scouting notes`,
    body,
  );
}

// ---------------------------------------------------------------- Injuries

export function injuryReport(
  career: Career,
  injuries: { name: string; label: string; weeks: number }[],
  recovered: PlayerRec[],
): InboxItem | null {
  const mine = injuries;
  const back = recovered;
  if (!mine.length && !back.length) return null;
  const lines: string[] = [];
  for (const i of mine)
    lines.push(`${i.name} — ${i.label}. Out ${i.weeks} week${i.weeks === 1 ? "" : "s"}.`);
  if (back.length)
    lines.push(`Back in full training: ${back.map((p) => p.name).join(", ")}.`);
  const subject = mine.length
    ? `Physio report: ${mine.length === 1 ? mine[0].name : `${mine.length} players`} injured`
    : `Physio report: ${back.map((p) => p.name).join(", ")} passed fit`;
  return mkItem(career, "injury", "Physio room", subject, lines.join("\n"));
}

// ---------------------------------------------------------------- News

export function newsDigest(
  career: Career,
  round: number,
  results: Fixture[],
  table: TableRow[],
  prevTable: TableRow[] | null,
  aiMoves: { playerName: string; from: ClubId; to: ClubId; fee: number }[],
): InboxItem {
  const rng = new Rng(career.seed + ":news:" + career.seasonIndex + ":" + round);
  const lines: string[] = [];

  // Standout result elsewhere.
  const others = results.filter(
    (f) => f.result && f.homeId !== career.clubId && f.awayId !== career.clubId,
  );
  if (others.length) {
    const biggest = [...others].sort(
      (a, b) =>
        Math.abs(b.result!.homePts - b.result!.awayPts) -
        Math.abs(a.result!.homePts - a.result!.awayPts),
    )[0];
    const r = biggest.result!;
    const winner = r.homePts >= r.awayPts ? biggest.homeId : biggest.awayId;
    const loser = winner === biggest.homeId ? biggest.awayId : biggest.homeId;
    lines.push(
      rng.pick([
        `${clubShort(winner)} put ${clubShort(loser)} to the sword, ${Math.max(r.homePts, r.awayPts)}–${Math.min(r.homePts, r.awayPts)}.`,
        `Statement from ${clubShort(winner)}: ${Math.max(r.homePts, r.awayPts)}–${Math.min(r.homePts, r.awayPts)} over ${clubShort(loser)}.`,
        `Elsewhere, ${clubShort(winner)} saw off ${clubShort(loser)} ${Math.max(r.homePts, r.awayPts)}–${Math.min(r.homePts, r.awayPts)}.`,
      ]),
    );
  }

  // Table movement.
  if (prevTable) {
    for (const row of table.slice(0, 6)) {
      const was = prevTable.findIndex((r) => r.clubId === row.clubId) + 1;
      const now = table.findIndex((r) => r.clubId === row.clubId) + 1;
      if (row.clubId !== career.clubId && was - now >= 2) {
        lines.push(`${clubShort(row.clubId)} climb from ${ordinalWord(was)} to ${ordinalWord(now)}.`);
        break;
      }
    }
  }
  lines.push(
    `Top of the table: ${clubShort(table[0].clubId)} (${table[0].points} pts), then ${clubShort(table[1].clubId)} (${table[1].points}).`,
  );

  // Transfer business elsewhere.
  for (const m of aiMoves) {
    lines.push(
      m.fee > 0
        ? `Deal done: ${m.playerName} joins ${clubShort(m.to)} from ${clubShort(m.from)} for ${fmtMoney(m.fee)}.`
        : `${m.playerName} moves to ${clubShort(m.to)} from ${clubShort(m.from)}.`,
    );
  }

  return mkItem(
    career,
    "news",
    `${COMPETITIONS[userLeague(career)].shortName} Weekly`,
    `Round ${round}: around the grounds`,
    lines.join("\n"),
  );
}

export function transferNewsOnly(career: Career, aiMoves: { playerName: string; from: ClubId; to: ClubId; fee: number }[]): InboxItem | null {
  if (!aiMoves.length) return null;
  const lines = aiMoves.map((m) =>
    m.fee > 0
      ? `${m.playerName}: ${clubShort(m.from)} → ${clubShort(m.to)}, ${fmtMoney(m.fee)}.`
      : `${m.playerName}: ${clubShort(m.from)} → ${clubShort(m.to)}.`,
  );
  return mkItem(
    career,
    "news",
    `${COMPETITIONS[userLeague(career)].shortName} Weekly`,
    "Transfer round-up",
    lines.join("\n"),
  );
}

/**
 * Big stories only from the OTHER league: its playoff results (quarters and
 * semis — the champion gets its own mail at season's end). Regular rounds
 * over there stay out of your inbox; league news is league-local.
 */
export function otherLeagueNews(career: Career, prevWeek: number): InboxItem | null {
  const otherLg = userLeague(career) === "prem" ? "urc" : "prem";
  const comp = COMPETITIONS[otherLg];
  if (prevWeek <= comp.rounds) return null;
  const ls = career.season.leagues[otherLg];
  const finalRound = comp.rounds + (comp.playoffTeams === 8 ? 3 : 2);
  const played = [...(ls.quarters ?? []), ...(ls.semis ?? [])].filter(
    (f) => f.round === prevWeek && f.round < finalRound && f.result,
  );
  if (!played.length) return null;
  const lines = played.map(
    (f) => `${clubShort(f.homeId)} ${f.result!.homePts}–${f.result!.awayPts} ${clubShort(f.awayId)}`,
  );
  return mkItem(
    career,
    "news",
    "World rugby desk",
    `${comp.shortName} ${roundLabel(played[0]).toLowerCase()}s: the results`,
    lines.join("\n"),
  );
}

// ---------------------------------------------------------------- Offers

export function offerMail(career: Career, seed: string): InboxItem | null {
  const offer = rollIncomingOffer(career, seed);
  if (!offer) return null;
  const p = career.players[offer.playerId];
  const buyer = clubName(offer.fromClub);
  if (offer.loan) {
    return mkItem(
      career,
      "offer",
      "Director of rugby",
      `Loan offer: ${buyer} want ${p.name}`,
      `${buyer} are offering to take ${p.name} (${p.ovr}, ${p.age}) on loan until the end of the season, covering half his wage.\nHe'd get the minutes he isn't getting here — and he knows they've asked.`,
      { kind: "offer", offer },
    );
  }
  return mkItem(
    career,
    "offer",
    "Director of rugby",
    `Bid received: ${fmtMoney(offer.fee)} for ${p.name}`,
    `${buyer} have tabled ${fmtMoney(offer.fee)} for ${p.name} (${p.ovr}, age ${p.age}).\nOur valuation is around ${fmtMoney(valuation(p))}. ${p.listed ? "He is on the transfer list, so a sale would surprise nobody." : "He is NOT listed — selling a wanted man will not go down well in the dressing room or the stands."}\nThe offer expires in two weeks. We can accept, reject, or push them for more.`,
    { kind: "offer", offer },
  );
}

// ---------------------------------------------------------------- Contracts

export function contractWarnings(career: Career): InboxItem[] {
  const week = career.season.week;
  if (![6, 12, 16].includes(week)) return [];
  const expiring = rosterOf(career, career.clubId).filter(
    (p) => p.clubId === career.clubId && p.expiry <= career.season.year,
  );
  const out: InboxItem[] = [];
  for (const p of expiring.sort((a, b) => b.ovr - a.ovr).slice(0, week === 16 ? 3 : 1)) {
    // Skip if an unresolved mail for this player is already sitting in the inbox.
    const already = career.inbox.some(
      (it) =>
        it.kind === "contract" &&
        !it.resolved &&
        it.decision?.kind === "contract" &&
        it.decision.contract.playerId === p.id,
    );
    if (already) continue;
    const d = renewalDemand(p);
    out.push(
      mkItem(
        career,
        "contract",
        "Club secretary",
        `${p.name}'s contract expires this season`,
        `${p.name} (${p.ovr}, age ${p.age}) is out of contract at the end of the season. If nothing is agreed he walks for free.\nHis camp want ${fmtMoney(d.wage)} a season for ${d.years} year${d.years === 1 ? "" : "s"} (currently ${fmtMoney(p.wage)}).`,
        { kind: "contract", contract: { playerId: p.id, demandWage: d.wage, years: d.years } },
      ),
    );
  }
  return out;
}

// ---------------------------------------------------------------- Morale

export function unhappyMail(career: Career, seed: string): InboxItem | null {
  const rng = new Rng(seed + ":unhappy");
  const roster = rosterOf(career, career.clubId);
  const cands = roster.filter(
    (p) =>
      p.clubId === career.clubId &&
      p.morale <= 40 &&
      !p.promise &&
      p.ovr >= 72 &&
      !career.inbox.some(
        (it) =>
          it.kind === "unhappy" &&
          !it.resolved &&
          it.decision?.kind === "unhappy" &&
          it.decision.unhappy.playerId === p.id,
      ),
  );
  if (!cands.length || rng.next() < 0.45) return null;
  const p = cands.sort((a, b) => a.morale - b.morale)[0];
  const listed = !!p.listed;
  return mkItem(
    career,
    "unhappy",
    "Captain's office",
    listed ? `${p.name} is unsettled by the transfer listing` : `${p.name} wants game time`,
    listed
      ? `${p.name} has seen his name on the list and his head has dropped. Training intensity is down and it's starting to spread.\nEither move him on this window or take him off the list and rebuild the bridge.`
      : `${p.name} (${p.ovr}) has knocked on the door. He's started ${p.starts} match${p.starts === 1 ? "" : "es"} this season and he's not happy about it.\nPromise him starts and he'll knuckle down — but break that promise and you'll lose him for good. Or tell him straight that he's a squad player and let him decide his future.`,
    { kind: "unhappy", unhappy: { playerId: p.id, reason: listed ? "listed" : "gametime" } },
  );
}

// ---------------------------------------------------------------- Board

export function boardObjectiveMail(career: Career): InboxItem {
  const b = career.board;
  return mkItem(
    career,
    "board",
    "The board",
    `Season objective: ${b.objectiveLabel}`,
    `Welcome${career.history.length ? " back" : ""} to ${clubName(career.clubId)}.\nThe board's expectation for this ${COMPETITIONS[userLeague(career)].shortName} season is clear: ${b.objectiveLabel.toLowerCase()}. Your transfer kitty is ${fmtMoney(career.clubs[career.clubId].cash)} and the wage bill must stay under the club's wage ceiling.\nDeliver, and there is a future here. Fall short, and the board will act — they always do.`,
  );
}

export function boardWarningMail(career: Career, pos: number): InboxItem {
  return mkItem(
    career,
    "board",
    "The board",
    "The board is concerned",
    `Results have not matched expectations — we are ${ordinalWord(pos)} against a stated objective of ${career.board.objectiveLabel.toLowerCase()}.\nThe board has asked us to remind you that confidence is not unconditional. Turn this around, quickly.`,
  );
}

export function boardPraiseMail(career: Career, pos: number): InboxItem {
  return mkItem(
    career,
    "board",
    "The board",
    "The board is delighted",
    `Sitting ${ordinalWord(pos)} — ahead of where anyone in that boardroom dared hope. The chairman was seen smiling, which unsettled everyone.\nKeep this up and the club will back you in the market.`,
  );
}

// ---------------------------------------------------------------- Scout

export function scoutNote(career: Career, seed: string): InboxItem | null {
  const rng = new Rng(seed + ":scoutNote");
  if (!windowOpen(career.season.week) || rng.next() < 0.5) return null;
  // Don't nag: one scout note per window stretch.
  const recent = career.inbox.some(
    (it) => it.kind === "scout" && it.season === career.seasonIndex && career.season.week - it.week < 5,
  );
  if (recent) return null;
  // Weakest position group by best available ovr.
  const roster = rosterOf(career, career.clubId);
  const groups: [string, (p: PlayerRec) => boolean][] = [
    ["front row", (p) => p.role === "prop" || p.role === "hooker"],
    ["second row", (p) => p.role === "lock"],
    ["back row", (p) => p.role === "flanker" || p.role === "number8"],
    ["half-backs", (p) => p.role === "scrumhalf" || p.role === "flyhalf"],
    ["midfield", (p) => p.role === "centre"],
    ["back three", (p) => p.role === "wing" || p.role === "fullback"],
  ];
  const weakest = groups
    .map(([label, test]) => {
      const best = roster.filter(test).map((p) => p.ovr).sort((a, b) => b - a);
      return { label, test, top2: (best[0] ?? 0) + (best[1] ?? 0) };
    })
    .sort((a, b) => a.top2 - b.top2)[0];

  const budget = career.clubs[career.clubId].cash;
  const targets = Object.values(career.players)
    .filter(
      (p) =>
        p.clubId &&
        p.clubId !== career.clubId &&
        !p.loan &&
        weakest.test(p) &&
        p.age <= 30 &&
        valuation(p) <= Math.max(200, budget * 1.1),
    )
    .sort((a, b) => b.ovr + (b.pot - b.ovr) * 0.5 - (a.ovr + (a.pot - a.ovr) * 0.5));
  const t = targets[Math.floor(rng.next() * Math.min(3, targets.length))];
  if (!t) return null;
  return mkItem(
    career,
    "scout",
    "Chief scout",
    `Scouting: ${t.name} would fix our ${weakest.label}`,
    `Our thinnest unit is the ${weakest.label}. The best fit on the market: ${t.name} (${t.ovr}${t.age <= 23 ? `, potential to go higher` : ""}, age ${t.age}) at ${clubName(t.clubId!)}.\nExpect a fee around ${fmtMoney(valuation(t))}${isFringe(career, t) ? " — he's fringe there, they may deal" : " — they won't want to sell"}. The ${windowLabel(career.season.week).toLowerCase()} is open.`,
  );
}

// ---------------------------------------------------------------- Windows

export function windowMail(career: Career, opening: boolean): InboxItem {
  const week = career.season.week;
  return mkItem(
    career,
    "window",
    "League office",
    opening ? `${windowLabel(week)} is OPEN` : "Transfer window closes this week",
    opening
      ? `The ${windowLabel(week).toLowerCase()} is open${week >= MID_WINDOW[0] && week <= MID_WINDOW[1] ? ` until round ${MID_WINDOW[1]}` : ""}. Buy, sell, loan — the market is live. Kitty: ${fmtMoney(career.clubs[career.clubId].cash)}.`
      : `Last chance for business — the window shuts after this week. Any deal not done waits until the next window.`,
  );
}
