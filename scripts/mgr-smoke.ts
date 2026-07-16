// Smoke test for management flows the season sims don't exercise:
// bids/haggling, incoming offers, loans, renewals, sack → new job, rollover,
// plus the multi-league world: a URC career with its real format (18 rounds,
// top-8 playoffs, Shields), cross-league transfers and a cross-league job move.
// Run: npx tsx scripts/mgr-smoke.ts

import { newCareer, playMatchday, advanceWeek, pendingFixtures, startNextSeason, takeJob, userSeason } from "../src/manager/engine/season";
import { archiveOldMail, isPinned, ARCHIVE_AFTER_WEEKS } from "../src/manager/engine/inbox";
import type { InboxItem } from "../src/manager/types";
import { evaluateBid, completePurchase, loanOut, loanDestinations, acceptOffer, rollIncomingOffer, renewContract, runContractExpiry, aiMarketTick } from "../src/manager/engine/transfers";
import { jobOffers } from "../src/manager/engine/board";
import { leagueOf, rosterOf } from "../src/manager/world";
import { COMPETITIONS } from "../src/data/manager";
import { wageBill, wageCapFor } from "../src/manager/engine/finance";
import type { Career } from "../src/manager/types";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (!cond) failures++;
  console.log(`${cond ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const c = newCareer("gloucester", "smoke-1");

// --- Buying with a haggle ---
const target = Object.values(c.players).find((p) => p.clubId === "newcastle" && p.ovr >= 74)!;
const low = evaluateBid(c, target.id, 10);
check("lowball rejected", !low.ok && low.kind === "rejected");
const mid = evaluateBid(c, target.id, Math.round(10000));
check("big bid accepted", mid.ok);
if (mid.ok) {
  const cashBefore = c.clubs.gloucester.cash;
  completePurchase(c, target.id, mid.fee, mid.wage);
  check("purchase moves player", c.players[target.id].clubId === "gloucester");
  check("fee left kitty", c.clubs.gloucester.cash === cashBefore - mid.fee);
  check("new signing has empty window", c.players[target.id].window.length === 0);
}

// --- Loan out a youngster ---
const young = rosterOf(c, "gloucester").find((p) => p.age <= 23 && p.clubId === "gloucester");
if (young) {
  const dest = loanDestinations(c)[0];
  loanOut(c, young.id, dest);
  check("loanee plays for destination", rosterOf(c, dest).some((p) => p.id === young.id));
  check("loanee not in own roster", !rosterOf(c, "gloucester").some((p) => p.id === young.id));
}

// --- Incoming offer + acceptance ---
let offer = null;
for (let i = 0; i < 30 && !offer; i++) offer = rollIncomingOffer(c, "smoke-off-" + i);
check("incoming offers roll", !!offer);
if (offer && !offer.loan) {
  const seller = c.players[offer.playerId];
  const cashBefore = c.clubs.gloucester.cash;
  acceptOffer(c, offer);
  check("sold player moved", seller.clubId === offer.fromClub);
  check("fee banked", c.clubs.gloucester.cash === cashBefore + offer.fee);
}

// --- Renewal ---
const renewMe = rosterOf(c, "gloucester").find((p) => p.clubId === "gloucester")!;
renewContract(c, renewMe.id);
check("renewal extends expiry", renewMe.expiry > c.season.year);

// --- Wage bill sanity ---
check("wage bill under cap-ish", wageBill(c, "gloucester") < wageCapFor("gloucester") * 1.25, `${Math.round(wageBill(c, "gloucester"))}`);

// --- AI market believability: run 30 ticks, count moves ---
let moves = 0;
for (let i = 0; i < 30; i++) moves += aiMarketTick(c, "smoke-mkt-" + i).length;
check("AI clubs trade", moves > 5 && moves < 60, `${moves} moves/30 window-weeks`);

// --- Sack → job hop ---
// Play forward to round 7, then zero out confidence with a title objective so
// even a win can't rescue it.
while (userSeason(c).round < 7 && c.season.phase !== "offseason") {
  if (pendingFixtures(c).length > 0) playMatchday(c);
  else advanceWeek(c);
}
c.board.confidence = 0;
c.board.objective = 1;
while (pendingFixtures(c).length === 0) advanceWeek(c);
playMatchday(c);
check("sacked at rock bottom", !!c.unemployed);
check("job offers exist", (c.jobOffers ?? []).length >= 2, (c.jobOffers ?? []).join(","));
if (c.jobOffers?.length) {
  takeJob(c, c.jobOffers[0]);
  check("job taken", !c.unemployed && c.clubId !== "gloucester", c.clubId);
  check("board reset", c.board.confidence === 55);
}

// --- Play out the season and roll over ---
let guard = 0;
while (c.season.phase !== "offseason" && guard++ < 60) {
  if (pendingFixtures(c).length > 0) playMatchday(c);
  else advanceWeek(c);
}
check("season completes", c.season.phase === "offseason");
check("progression report exists", !!c.progression);
const expiredCheck = runContractExpiry; // (already ran inside finishSeason)
void expiredCheck;
const loaned = Object.values(c.players).filter((p) => p.loan).length;
startNextSeason(c);
check("loans ended at rollover", Object.values(c.players).every((p) => !p.loan), `${loaned} were out`);
check("youth arrived", Object.values(c.players).some((p) => p.youth));
check("new season is preseason wk0", c.season.phase === "preseason" && c.season.week === 0);
check("no player past retirement cliff", Object.values(c.players).every((p) => p.age <= 40));

// ===========================================================================
// MULTI-LEAGUE: a URC career, real format, shields, cross-league moves
// ===========================================================================

function playSeason(career: Career): void {
  let guard = 0;
  while (career.season.phase !== "offseason" && guard++ < 80) {
    if (pendingFixtures(career).length > 0) playMatchday(career);
    else advanceWeek(career);
  }
}

const u = newCareer("munster", "smoke-urc-1");
check("career can start in the URC", leagueOf(u.clubId) === "urc");
check("both leagues have fixtures", u.season.leagues.prem.fixtures.length === 90 && u.season.leagues.urc.fixtures.length === 144, `${u.season.leagues.prem.fixtures.length}/${u.season.leagues.urc.fixtures.length}`);

// URC schedule shape: 18 rounds, 8 games each, everyone plays every round.
const urcRounds = new Map<number, number>();
for (const f of u.season.leagues.urc.fixtures) urcRounds.set(f.round, (urcRounds.get(f.round) ?? 0) + 1);
check("URC has 18 rounds of 8", urcRounds.size === 18 && [...urcRounds.values()].every((n) => n === 8));
const appearances = new Map<string, number>();
for (const f of u.season.leagues.urc.fixtures)
  for (const id of [f.homeId, f.awayId]) appearances.set(id, (appearances.get(id) ?? 0) + 1);
check("every URC club plays 18", [...appearances.values()].every((n) => n === 18), `${[...appearances.values()].join(",")}`);

// Cross-league buying: a URC club can sign a Prem player.
const premTarget = Object.values(u.players).find((p) => p.clubId === "newcastle" && p.ovr >= 72)!;
const xBid = evaluateBid(u, premTarget.id, 10000);
check("cross-league bid accepted", xBid.ok);
if (xBid.ok) {
  completePurchase(u, premTarget.id, xBid.fee, xBid.wage);
  check("Prem player now at a URC club", u.players[premTarget.id].clubId === "munster");
}

// Play the URC season out.
playSeason(u);
const uls = u.season.leagues.urc;
check("URC season completes", u.season.phase === "offseason");
check("URC ran quarters", (uls.quarters ?? []).length === 4);
check("URC ran semis", (uls.semis ?? []).length === 2);
check("URC crowned a champion", !!uls.championId, uls.championId);
check("Prem season also completed", u.season.leagues.prem.phase === "done" && !!u.season.leagues.prem.championId);

// Shields: all four decided, each by a club from the right pool.
const shields = uls.shieldWinners ?? {};
check("four shields decided", Object.keys(shields).length === 4, Object.keys(shields).join(","));
const shieldDefs = COMPETITIONS.urc.shields!;
check(
  "shield winners come from their pools",
  shieldDefs.every((s) => (s.clubIds as readonly string[]).includes(shields[s.id])),
  shieldDefs.map((s) => `${s.id}:${shields[s.id]}`).join(" "),
);
check("history records the league", u.history[0]?.league === "urc");

// --- Inbox hygiene: weekly auto-archive keeps the pile shallow ---
const mailAge = (it: InboxItem) =>
  (u.seasonIndex - it.season) * 23 + (u.season.week - it.week);
check("inbox stays shallow at season end", u.inbox.length <= 30, `${u.inbox.length} items`);
check(
  "no stale unpinned mail survives the season",
  u.inbox.every((it) => isPinned(it) || mailAge(it) <= ARCHIVE_AFTER_WEEKS),
);
// Direct archive semantics: old info mail goes, old open decisions stay.
const oldInfo: InboxItem = {
  id: "test:oldinfo", season: u.seasonIndex, week: Math.max(0, u.season.week - 10),
  kind: "news", from: "Test", subject: "Old news", body: "x",
};
const oldPinned: InboxItem = {
  id: "test:oldpinned", season: u.seasonIndex, week: Math.max(0, u.season.week - 10),
  kind: "offer", from: "Test", subject: "Open offer", body: "x",
  decision: { kind: "offer", offer: { playerId: "nobody", fromClub: "leinster", fee: 100, expiresWeek: 99 } },
};
u.inbox.push(oldInfo, oldPinned);
archiveOldMail(u);
check("archive drops old informational mail", !u.inbox.some((it) => it.id === "test:oldinfo"));
check("archive never drops an open decision", u.inbox.some((it) => it.id === "test:oldpinned"));
u.inbox = u.inbox.filter((it) => it.id !== "test:oldpinned");

// A Munster-history career: if we won a shield, the mail landed.
if (Object.values(shields).includes("munster")) {
  check("shield win mail arrived", u.inbox.some((it) => it.subject.includes("Shield winners")));
}

// Cross-league job move: sacked URC managers see Prem offers (over seeds).
// (A mid-stature club — sacked Zebre managers rightly get no Prem calls.)
let sawCross = false;
for (let i = 0; i < 12 && !sawCross; i++) {
  const offers = jobOffers("edinburgh", "smoke-x-" + i);
  sawCross = offers.some((id) => leagueOf(id) === "prem");
}
check("sacked URC manager can get Prem offers", sawCross);

// And takeJob across leagues actually moves the career.
takeJob(u, "harlequins");
check("cross-league job move works", u.clubId === "harlequins" && leagueOf(u.clubId) === "prem" && !u.unemployed);
startNextSeason(u);
check("next season starts in the Prem", userSeason(u).league === "prem" && u.season.phase === "preseason");

// URC wage ceilings are stature-seeded (Leinster > Zebre), Prem cap is flat.
check("URC caps scale with stature", wageCapFor("leinster") > wageCapFor("zebre"));
check("Prem cap is uniform", wageCapFor("bath") === wageCapFor("newcastle"));

console.log(failures ? `\n${failures} FAILURES` : "\nall good");
process.exit(failures ? 1 : 0);
