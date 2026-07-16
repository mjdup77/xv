// Transfer market: windows, user-side deals (bid/haggle, sell, release,
// loans, renewals) and the AI-club market that keeps BOTH leagues alive.
// All functions mutate the career they're given — the store clones first.
// Spec: docs/manager/DESIGN-management.md §4.
//
// Multi-league (July 2026): the market spans the Premiership and the URC —
// any club can buy from any other, but AI cross-league moves are deliberately
// rarer than intra-league ones (CROSS_LEAGUE_CHANCE gates each AI move; the
// user faces no such gate).

import { Rng } from "../../engine/rng";
import type { Career, ClubId, OfferPayload, PlayerRec } from "../types";
import { ALL_CLUBS, clubShort, clubsOf, leagueOf, playingClub, rosterOf, stature } from "../world";
import { askingPrice, renewalDemand, valuation, wageBill, wageCapFor, wageFor } from "./finance";
import { departureBlock } from "./selection";

/** Odds an AI move (or an incoming AI bid) shops in the other league. */
export const CROSS_LEAGUE_CHANCE = 0.22;

// ---- Windows ----

/** Mid-season window: after round 8 through round 12's build-up. */
export const MID_WINDOW: [number, number] = [9, 12];

/** Off-season calendar week (mirrors season.ts OFFSEASON_WEEK). */
const OFFSEASON = 22;

export function windowOpen(week: number): boolean {
  return week === 0 || week >= OFFSEASON || (week >= MID_WINDOW[0] && week <= MID_WINDOW[1]);
}

export function windowLabel(week: number): string {
  if (week === 0) return "Pre-season window";
  if (week >= OFFSEASON) return "Off-season window";
  return "Mid-season window";
}

// ---- Depth helpers ----

/** Is this player fringe at his club (not in the notional best XV+bench)? */
export function isFringe(career: Career, p: PlayerRec): boolean {
  const club = playingClub(p);
  if (!club) return true;
  const mates = rosterOf(career, club).filter(
    (m) => m.role === p.role || (m.alt ?? []).includes(p.role),
  );
  const better = mates.filter((m) => m.id !== p.id && m.ovr >= p.ovr).length;
  const firstChoiceDepth = p.role === "prop" || p.role === "lock" || p.role === "centre" || p.role === "wing" || p.role === "flanker" ? 2 : 1;
  return better >= firstChoiceDepth + 1;
}

// ---- User → AI deals (buying) ----

export type BidOutcome =
  | { ok: true; kind: "accepted"; fee: number; wage: number }
  | { ok: false; kind: "counter"; counter: number; note: string }
  | { ok: false; kind: "rejected"; note: string };

/**
 * Bid `fee` (£k) for an AI club's player. Deterministic haggle band:
 * ≥ ask → accepted · ≥ 80% of ask → counter close to ask · below → rejected.
 * The selling club never sells if it would gut its squad legality.
 */
export function evaluateBid(career: Career, playerId: string, fee: number): BidOutcome {
  const p = career.players[playerId];
  const seller = p.clubId!;
  const block = departureBlock(rosterOf(career, seller), playerId);
  if (block) return { ok: false, kind: "rejected", note: `${sellerName(seller)} won't sell — ${block}.` };
  const ask = askingPrice(p, isFringe(career, p));
  const wage = wageFor(p.ovr, p.age, p.pot);
  if (fee >= ask) return { ok: true, kind: "accepted", fee, wage };
  if (fee >= ask * 0.8) {
    const counter = Math.round(ask * 0.95);
    return { ok: false, kind: "counter", counter, note: `They want ${counter} — final answer.` };
  }
  return { ok: false, kind: "rejected", note: `Laughed out of the room. They value him around ${ask}.` };
}

function sellerName(id: ClubId): string {
  return clubShort(id);
}

/** Execute a completed purchase by the user (fee already agreed). */
export function completePurchase(career: Career, playerId: string, fee: number, wage: number): void {
  const p = career.players[playerId];
  const seller = p.clubId!;
  career.clubs[seller].cash += fee;
  career.clubs[career.clubId].cash -= fee;
  movePlayer(career, p, career.clubId, wage);
}

/** Sign a free agent (no fee; wage only). */
export function signFreeAgent(career: Career, playerId: string): void {
  const p = career.players[playerId];
  movePlayer(career, p, career.clubId, wageFor(p.ovr, p.age, p.pot));
}

function movePlayer(career: Career, p: PlayerRec, to: ClubId, wage: number): void {
  p.clubId = to;
  delete p.loan;
  p.wage = wage;
  p.expiry = career.season.year + (p.age >= 31 ? 1 : 2);
  p.listed = false;
  p.window = []; // new signing beds in (cohesion cost — DESIGN-tactics §3)
  p.morale = Math.min(100, p.morale + 15);
  delete p.promise;
}

/** Loan in a player from an AI club (wage share 50%, until season end). */
export function loanIn(career: Career, playerId: string): void {
  const p = career.players[playerId];
  p.loan = { toId: career.clubId };
  p.window = [];
  p.morale = Math.min(100, p.morale + 8);
}

/** Loan a fringe youngster out — he plays (and grows) elsewhere this season. */
export function loanOut(career: Career, playerId: string, toId: ClubId): void {
  const p = career.players[playerId];
  p.loan = { toId };
  p.window = [];
  p.morale = Math.min(100, p.morale + 6); // wanted: game time
}

/** Clubs that would take a loanee (weaker same-league clubs happy to develop
 *  him — loans stay domestic; permanent deals cross leagues). */
export function loanDestinations(career: Career): ClubId[] {
  return clubsOf(leagueOf(career.clubId))
    .map((c) => c.id)
    .filter((id) => id !== career.clubId)
    .filter((id) => stature(id) <= stature(career.clubId) + 2)
    .slice(0, 6);
}

/** Sell to the offering club (fee lands in the kitty). */
export function acceptOffer(career: Career, offer: OfferPayload): void {
  const p = career.players[offer.playerId];
  if (offer.loan) {
    p.loan = { toId: offer.fromClub };
    p.window = [];
    return;
  }
  career.clubs[career.clubId].cash += offer.fee;
  career.clubs[offer.fromClub].cash -= offer.fee;
  movePlayer(career, p, offer.fromClub, wageFor(p.ovr, p.age, p.pot));
}

export function releasePlayer(career: Career, playerId: string): void {
  const p = career.players[playerId];
  p.clubId = null;
  delete p.loan;
  p.listed = false;
  p.wage = 0;
}

export function toggleListed(career: Career, playerId: string): void {
  const p = career.players[playerId];
  p.listed = !p.listed;
  if (p.listed) p.morale = Math.max(0, p.morale - 18);
  else p.morale = Math.min(100, p.morale + 6);
}

export function renewContract(career: Career, playerId: string): void {
  const p = career.players[playerId];
  const d = renewalDemand(p);
  p.wage = d.wage;
  p.expiry = career.season.year + d.years;
  p.morale = Math.min(100, p.morale + 12);
}

/** Head-room under the club's wage ceiling after adding `wage`.
 *  Negative = over the ceiling (Prem: league cap · URC: stature budget). */
export function capRoom(career: Career, clubId: ClubId, addWage = 0): number {
  return wageCapFor(clubId) - wageBill(career, clubId) - addWage;
}

// ---- AI offers for the user's players ----

/**
 * Roll 0-1 incoming offers for the user's players this window week.
 * Stars attract bids; listed and unhappy players attract more.
 */
export function rollIncomingOffer(career: Career, seed: string): OfferPayload | null {
  const rng = new Rng(seed + ":inOffer");
  const roster = rosterOf(career, career.clubId).filter((p) => p.clubId === career.clubId);
  const cands = roster
    .map((p) => {
      let w = 0;
      if (p.listed) w += 3;
      if (p.morale < 40) w += 1.5;
      if (p.ovr >= 84) w += 2;
      else if (p.ovr >= 80) w += 0.8;
      if (p.age >= 33) w *= 0.3;
      return { p, w };
    })
    .filter((c) => c.w > 0);
  if (!cands.length) return null;
  const total = cands.reduce((s, c) => s + c.w, 0);
  // ~45% of window weeks produce an offer if there's anything worth bidding on.
  if (rng.next() > Math.min(0.65, 0.25 + total * 0.05)) return null;
  let roll = rng.next() * total;
  let chosen = cands[0];
  for (const c of cands) {
    roll -= c.w;
    if (roll <= 0) {
      chosen = c;
      break;
    }
  }
  const p = chosen.p;
  // Buyer: a club with stature pull, not the user's. Usually the user's own
  // league; sometimes the other league comes shopping.
  const userLg = leagueOf(career.clubId);
  const buyerLeague =
    rng.next() < CROSS_LEAGUE_CHANCE ? (userLg === "prem" ? "urc" : "prem") : userLg;
  const buyers = clubsOf(buyerLeague)
    .map((c) => c.id)
    .filter((id) => id !== career.clubId);
  const buyer = buyers[Math.floor(rng.next() * buyers.length)];
  const loan = !p.listed && p.ovr < 76 && p.age <= 24 && rng.next() < 0.4;
  const fee = loan
    ? 0
    : Math.round(valuation(p) * (p.listed ? 0.9 : 0.75 + rng.next() * 0.35));
  return { playerId: p.id, fromClub: buyer, fee, loan, expiresWeek: career.season.week + 2 };
}

/** User countered: buyer improves to ~valuation+10%, or walks (null). */
export function counterOffer(career: Career, offer: OfferPayload, seed: string): OfferPayload | null {
  const rng = new Rng(seed + ":counter");
  const p = career.players[offer.playerId];
  if (offer.loan) return null;
  const ceiling = valuation(p) * 1.12;
  if (offer.fee >= ceiling || rng.next() < 0.3) return null; // they walk
  return { ...offer, fee: Math.round(Math.min(ceiling, offer.fee * (1.12 + rng.next() * 0.1))), countered: true };
}

// ---- AI ↔ AI market (the league lives) ----

export interface AiMove {
  playerName: string;
  from: ClubId;
  to: ClubId;
  fee: number; // £k, 0 = free/loan
  loan?: boolean;
}

/**
 * One window-week tick of AI-club business: 0-3 believable moves between AI
 * clubs across both leagues (buying need positions, respecting kitty +
 * wage ceiling + squad legality). Cross-league moves are gated to be rarer.
 */
export function aiMarketTick(career: Career, seed: string): AiMove[] {
  const rng = new Rng(seed + ":aiMkt");
  const moves: AiMove[] = [];
  // Two leagues' worth of business: slightly more volume than single-league.
  const nMoves = rng.next() < 0.5 ? 2 : rng.next() < 0.6 ? 1 : rng.next() < 0.5 ? 3 : 0;

  const aiClubs = ALL_CLUBS.map((c) => c.id).filter((id) => id !== career.clubId);
  for (let i = 0; i < nMoves; i++) {
    // Buyer: weighted by available cash; must have cap room to add anyone.
    const buyers = aiClubs
      .map((id) => ({ id, cash: career.clubs[id].cash }))
      .filter((b) => b.cash > 150 && capRoom(career, b.id, 60) > 0);
    if (!buyers.length) break;
    const totalCash = buyers.reduce((s, b) => s + b.cash, 0);
    let roll = rng.next() * totalCash;
    let buyer = buyers[0].id;
    for (const b of buyers) {
      roll -= b.cash;
      if (roll <= 0) {
        buyer = b.id;
        break;
      }
    }

    // Shop at home unless the cross-league gate opens this move.
    const crossOk = rng.next() < CROSS_LEAGUE_CHANCE;
    const buyerLeague = leagueOf(buyer);

    // Target: an affordable upgrade from another club (prefer listed/fringe).
    const budget = career.clubs[buyer].cash;
    const targets = Object.values(career.players).filter((p) => {
      const club = playingClub(p);
      if (!club || club === buyer || club === career.clubId) return false;
      if (!crossOk && leagueOf(club) !== buyerLeague) return false;
      if (p.loan) return false;
      if (p.age > 31) return false;
      const price = askingPrice(p, isFringe(career, p));
      if (price > budget) return false;
      if (capRoom(career, buyer, wageFor(p.ovr, p.age, p.pot)) < 0) return false;
      if (departureBlock(rosterOf(career, club), p.id)) return false;
      // Believability: only move for players who'd plausibly improve the buyer.
      const buyerAvg = avgTop23(career, buyer);
      return p.ovr >= buyerAvg - 4;
    });
    if (!targets.length) continue;
    // Prefer listed players and better ratings.
    targets.sort((a, b) => Number(b.listed ?? false) - Number(a.listed ?? false) || b.ovr - a.ovr);
    const pick = targets[Math.floor(rng.next() * Math.min(6, targets.length))];
    const from = pick.clubId!;
    const fee = askingPrice(pick, isFringe(career, pick));
    career.clubs[buyer].cash -= fee;
    career.clubs[from].cash += fee;
    const wage = wageFor(pick.ovr, pick.age, pick.pot);
    pick.clubId = buyer;
    pick.wage = wage;
    pick.expiry = career.season.year + 2;
    pick.listed = false;
    pick.window = [];
    moves.push({ playerName: pick.name, from, to: buyer, fee });
  }
  return moves;
}

function avgTop23(career: Career, clubId: ClubId): number {
  const top = rosterOf(career, clubId)
    .map((p) => p.ovr)
    .sort((a, b) => b - a)
    .slice(0, 23);
  return top.length ? top.reduce((s, v) => s + v, 0) / top.length : 70;
}

// ---- Rollover-time contract housekeeping for AI clubs ----

/**
 * AI clubs renew who they can and let the rest go; expired user players walk
 * (the inbox warned about them all season). Called during season rollover
 * BEFORE year++ (so expiry === current year means "expiring now").
 */
export function runContractExpiry(career: Career, seed: string): { userLosses: PlayerRec[] } {
  const rng = new Rng(seed + ":expiry");
  const year = career.season.year;
  const userLosses: PlayerRec[] = [];
  for (const p of Object.values(career.players)) {
    if (!p.clubId || p.expiry > year) continue;
    if (p.clubId === career.clubId) {
      // User ignored the warnings — free agency.
      userLosses.push(p);
      p.clubId = null;
      p.wage = 0;
      p.listed = false;
      delete p.loan;
    } else {
      // AI: renew the useful, release the rest.
      const keep = p.ovr >= 72 || p.age <= 27 || rng.next() < 0.5;
      if (keep) {
        const d = renewalDemand(p);
        p.wage = d.wage;
        p.expiry = year + d.years;
      } else {
        p.clubId = null;
        p.wage = 0;
        delete p.loan;
      }
    }
  }
  // Free agents get picked up by clubs with cap room (one pass, cheap) —
  // free transfers cross leagues freely.
  const agents = Object.values(career.players).filter((p) => !p.clubId && p.ovr >= 68);
  for (const p of agents) {
    const takers = ALL_CLUBS.map((c) => c.id).filter(
      (id) => id !== career.clubId && capRoom(career, id, wageFor(p.ovr, p.age, p.pot)) > 0,
    );
    if (takers.length && rng.next() < 0.7) {
      const to = takers[Math.floor(rng.next() * takers.length)];
      p.clubId = to;
      p.wage = wageFor(p.ovr, p.age, p.pot);
      p.expiry = year + 1 + (p.age >= 31 ? 0 : 1);
      p.window = [];
    }
  }
  // Whoever is still unsigned mostly leaves the league (Championship, France,
  // Japan, retirement) — keeps the world from bloating with ghost players.
  for (const p of Object.values(career.players)) {
    if (p.clubId) continue;
    const leaveChance = p.age >= 30 || p.ovr < 66 ? 0.9 : 0.55;
    if (rng.next() < leaveChance) delete career.players[p.id];
  }
  return { userLosses };
}
