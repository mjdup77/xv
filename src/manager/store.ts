// Manager-mode state store: one career save slot + the cross-career trophy
// cabinet, both in localStorage (local-first, no accounts). Auto-saves after
// every action. Save v3 (multi-league) — v1/v2 saves are discarded with a
// clean fresh-career prompt (pre-release only; the trophy cabinet survives).
//
// Plain module store + useSyncExternalStore binding — domain logic stays in
// src/manager/engine/, pure and React-free. Mutating engine functions get a
// structuredClone of the career, so React sees fresh references.

import { useSyncExternalStore } from "react";
import { track } from "../analytics";
import { COMPETITIONS } from "../data/manager";
import type { SlotId } from "../types";
import type {
  Cabinet,
  Career,
  ClubId,
  EmphasisId,
  GamePlanId,
  InboxItem,
  Selection,
} from "./types";
import { rosterOf, userLeague } from "./world";
import {
  advanceWeek,
  newCareer,
  pendingFixtures,
  playMatchday,
  startNextSeason,
  takeJob,
} from "./engine/season";
import { isPinned } from "./engine/inbox";
import { weeklySelection } from "./engine/selection";
import {
  acceptOffer,
  completePurchase,
  counterOffer,
  evaluateBid,
  loanIn,
  loanOut,
  releasePlayer,
  renewContract,
  signFreeAgent,
  toggleListed,
  type BidOutcome,
} from "./engine/transfers";
import { clamp } from "./engine/util";

const CAREER_KEY = "xvm_career";
const CABINET_KEY = "xvm_cabinet";

const EMPTY_CABINET: Cabinet = {
  trophies: [],
  seasonsCompleted: 0,
  matchesWon: 0,
  matchesPlayed: 0,
};

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function persist(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the session still plays, it just won't survive */
  }
}

interface StoreState {
  career: Career | null;
  cabinet: Cabinet;
  /** True when an older-version save was found and set aside (pre-release:
   *  old saves are discarded, not migrated — the UI shows a clean prompt). */
  staleSave: boolean;
}

function loadCareer(): { career: Career | null; stale: boolean } {
  const c = load<{ v?: number }>(CAREER_KEY);
  // Save versioning: v1/v2 saves (and unknown versions) are discarded — the
  // multi-league world can't be reconstructed from a single-league save.
  if (c && c.v === 3) return { career: c as Career, stale: false };
  return { career: null, stale: !!c };
}

const loaded = loadCareer();
let state: StoreState = {
  career: loaded.career,
  cabinet: { ...EMPTY_CABINET, ...(load<Partial<Cabinet>>(CABINET_KEY) ?? {}) },
  staleSave: loaded.stale,
};

const listeners = new Set<() => void>();

function emit(): void {
  state = { ...state };
  for (const l of listeners) l();
}

function saveCareer(): void {
  if (state.career) persist(CAREER_KEY, state.career);
  else {
    try {
      localStorage.removeItem(CAREER_KEY);
    } catch {
      /* ignore */
    }
  }
}

function saveCabinet(): void {
  persist(CABINET_KEY, state.cabinet);
}

// ---- React binding ----

export function useManagerStore(): StoreState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state, // server snapshot (headless render harness)
  );
}

/** Clone → mutate → commit helper for engine actions. */
function withCareer(fn: (c: Career) => void): void {
  if (!state.career) return;
  const c = structuredClone(state.career) as Career;
  fn(c);
  state.career = c;
  saveCareer();
  emit();
}

function findItem(c: Career, itemId: string): InboxItem | undefined {
  return c.inbox.find((it) => it.id === itemId);
}

// ---- Actions (every action auto-saves) ----

export const actions = {
  startCareer(clubId: ClubId): void {
    state.career = newCareer(clubId);
    state.staleSave = false;
    saveCareer();
    track("mgr_career_started", { club: clubId });
    emit();
  },

  /** Acknowledge the discarded old-version save (fresh-career prompt). */
  dismissStaleSave(): void {
    state.staleSave = false;
    try {
      localStorage.removeItem(CAREER_KEY);
    } catch {
      /* ignore */
    }
    emit();
  },

  abandonCareer(): void {
    track("mgr_career_abandoned", { club: state.career?.clubId });
    state.career = null;
    saveCareer();
    emit();
  },

  setGamePlan(plan: GamePlanId): void {
    withCareer((c) => {
      c.gamePlan = plan;
      c.clubs[c.clubId].plan = plan;
    });
    track("mgr_gameplan_set", { plan });
  },

  setEmphasis(emphasis: EmphasisId): void {
    withCareer((c) => {
      c.emphasis = emphasis;
    });
  },

  setSelection(selection: Selection): void {
    withCareer((c) => {
      c.clubs[c.clubId].selection = selection;
    });
  },

  setStarter(slot: SlotId, playerId: string): void {
    withCareer((c) => {
      const sel = c.clubs[c.clubId].selection;
      const starters = { ...sel.starters };
      const currentSlot = (Object.entries(starters) as [SlotId, string][]).find(
        ([, pid]) => pid === playerId,
      )?.[0];
      if (currentSlot && currentSlot !== slot) starters[currentSlot] = starters[slot];
      starters[slot] = playerId;
      const bench = sel.bench.filter((pid) => pid !== playerId);
      c.clubs[c.clubId].selection = { starters, bench };
    });
  },

  setBench(index: number, playerId: string): void {
    withCareer((c) => {
      const sel = c.clubs[c.clubId].selection;
      if (Object.values(sel.starters).includes(playerId)) return;
      const bench = [...sel.bench];
      const existing = bench.indexOf(playerId);
      if (existing >= 0) bench[existing] = bench[index] ?? "";
      bench[index] = playerId;
      c.clubs[c.clubId].selection = {
        starters: sel.starters,
        bench: bench.filter(Boolean).slice(0, 8),
      };
    });
  },

  suggestXV(): void {
    withCareer((c) => {
      c.clubs[c.clubId].selection = weeklySelection(
        rosterOf(c, c.clubId),
        c.clubs[c.clubId].selection,
        c.seed + ":suggest:" + c.season.week + ":" + Date.now(),
      );
    });
  },

  // ---- The week loop ----

  playMatchday(): void {
    withCareer((c) => {
      const before = c.season.phase;
      playMatchday(c);

      const cab = { ...state.cabinet, trophies: [...state.cabinet.trophies] };
      const rep = c.lastReport;
      if (rep) {
        cab.matchesPlayed += 1;
        const userIsHome = rep.home.clubId === c.clubId;
        const won = rep.draw ? false : userIsHome ? rep.homeWon : !rep.homeWon;
        if (won) cab.matchesWon += 1;
        track("mgr_matchday_simmed", {
          round: rep.roundLabel,
          won,
          score: `${rep.home.points}-${rep.away.points}`,
        });
      }
      if (before !== "offseason" && c.season.phase === "offseason") {
        cab.seasonsCompleted += 1;
        const lg = userLeague(c);
        const comp = COMPETITIONS[lg];
        const ls = c.season.leagues[lg];
        if (comp.leaderTrophy && ls.leaderId === c.clubId)
          cab.trophies.push({ trophyId: `${lg}-leader`, clubId: c.clubId, year: c.season.year });
        if (ls.championId === c.clubId)
          cab.trophies.push({ trophyId: `${lg}-title`, clubId: c.clubId, year: c.season.year });
        for (const sh of comp.shields ?? []) {
          if (ls.shieldWinners?.[sh.id] === c.clubId)
            cab.trophies.push({ trophyId: `${lg}-shield-${sh.id}`, clubId: c.clubId, year: c.season.year });
        }
        track("mgr_season_completed", {
          league: lg,
          champion: ls.championId === c.clubId,
          position: c.history[c.history.length - 1]?.position,
        });
      }
      state.cabinet = cab;
      saveCabinet();
    });
  },

  continueWeek(): void {
    withCareer((c) => {
      // Unemployed managers watch the world go by: play the round, then move on.
      if (c.unemployed && pendingFixtures(c).length > 0) playMatchday(c);
      advanceWeek(c);
      track("mgr_week_advanced", { week: c.season.week });
    });
  },

  nextSeason(): void {
    withCareer((c) => {
      startNextSeason(c);
      track("mgr_next_season_started", { seasonIndex: c.seasonIndex });
    });
  },

  // ---- Inbox ----

  markRead(itemId: string): void {
    withCareer((c) => {
      const it = findItem(c, itemId);
      if (it) it.read = true;
    });
  },

  markAllRead(): void {
    withCareer((c) => {
      for (const it of c.inbox) it.read = true;
    });
  },

  /** Delete one inbox item. Open decisions are pinned and cannot be deleted. */
  dismissMail(itemId: string): void {
    withCareer((c) => {
      const it = findItem(c, itemId);
      if (!it || isPinned(it)) return;
      c.inbox = c.inbox.filter((x) => x.id !== itemId);
    });
    track("mgr_inbox_dismissed", {});
  },

  /** Delete every read item that isn't an open decision. */
  clearReadMail(): void {
    withCareer((c) => {
      c.inbox = c.inbox.filter((it) => !it.read || isPinned(it));
    });
    track("mgr_inbox_cleared", {});
  },

  /** Accept / reject / counter a transfer or loan offer for your player. */
  resolveOffer(itemId: string, choice: "accept" | "reject" | "counter"): void {
    withCareer((c) => {
      const it = findItem(c, itemId);
      if (!it || it.resolved || it.decision?.kind !== "offer") return;
      const offer = it.decision.offer;
      const p = c.players[offer.playerId];
      it.read = true;

      if (choice === "accept") {
        const star = !offer.loan && p.ovr >= 82 && !p.listed;
        acceptOffer(c, offer);
        it.resolved = offer.loan ? "Loan agreed" : "Sold";
        if (star) {
          // Selling an unlisted star: fans and dressing room turn.
          c.board.confidence = clamp(0, 100, c.board.confidence - 8);
          c.soldStarsThisSeason += 1;
          for (const m of rosterOf(c, c.clubId))
            m.morale = clamp(0, 100, m.morale - 4);
        }
        track("mgr_offer_accepted", { fee: offer.fee, loan: !!offer.loan });
      } else if (choice === "reject") {
        it.resolved = "Rejected";
        // A player who wanted out is unsettled by the rejection.
        if (p.listed || p.morale < 45) p.morale = clamp(0, 100, p.morale - 8);
        track("mgr_offer_rejected", { fee: offer.fee });
      } else {
        const improved = counterOffer(c, offer, c.seed + ":" + itemId);
        if (improved) {
          it.decision = { kind: "offer", offer: improved };
          it.subject = `Improved bid: ${Math.round(improved.fee)} for ${p.name}`;
          it.body = `They came back higher. ${improved.fee} — take it or leave it, no more haggling.`;
        } else {
          it.resolved = "They walked away";
        }
      }
    });
  },

  /** Renew or decline a contract-expiry warning. */
  resolveContract(itemId: string, choice: "renew" | "decline"): void {
    withCareer((c) => {
      const it = findItem(c, itemId);
      if (!it || it.resolved || it.decision?.kind !== "contract") return;
      const d = it.decision.contract;
      const p = c.players[d.playerId];
      it.read = true;
      if (choice === "renew") {
        p.wage = d.demandWage;
        p.expiry = c.season.year + d.years;
        p.morale = clamp(0, 100, p.morale + 12);
        it.resolved = "Renewed";
        track("mgr_contract_renewed", { wage: d.demandWage });
      } else {
        p.morale = clamp(0, 100, p.morale - 6);
        it.resolved = "Let it run down";
      }
    });
  },

  /** Handle an unhappy-player mail. */
  resolveUnhappy(itemId: string, choice: "promise" | "straight" | "unlist" | "keep"): void {
    withCareer((c) => {
      const it = findItem(c, itemId);
      if (!it || it.resolved || it.decision?.kind !== "unhappy") return;
      const p = c.players[it.decision.unhappy.playerId];
      it.read = true;
      if (choice === "promise") {
        p.promise = { madeWeek: c.season.week };
        p.morale = clamp(0, 100, p.morale + 10);
        it.resolved = "Promised starts";
      } else if (choice === "straight") {
        p.morale = clamp(0, 100, p.morale - 8);
        it.resolved = "Told him straight";
      } else if (choice === "unlist") {
        p.listed = false;
        p.morale = clamp(0, 100, p.morale + 8);
        it.resolved = "Taken off the list";
      } else {
        it.resolved = "He stays listed";
      }
    });
  },

  /** Accept or decline a job approach. */
  resolveJob(itemId: string, choice: "accept" | "decline"): void {
    withCareer((c) => {
      const it = findItem(c, itemId);
      if (!it || it.resolved || it.decision?.kind !== "job") return;
      it.read = true;
      if (choice === "accept") {
        takeJob(c, it.decision.job.clubId);
        track("mgr_job_taken", { club: it.decision.job.clubId });
      } else {
        it.resolved = "Declined";
      }
    });
  },

  // ---- Transfer market (user side) ----

  /** Bid for an AI club's player. Returns the outcome for the UI. */
  bidForPlayer(playerId: string, fee: number): BidOutcome | null {
    if (!state.career) return null;
    const c = structuredClone(state.career) as Career;
    const outcome = evaluateBid(c, playerId, fee);
    if (outcome.ok) {
      completePurchase(c, playerId, outcome.fee, outcome.wage);
      track("mgr_player_signed", { fee: outcome.fee });
    }
    state.career = c;
    saveCareer();
    emit();
    return outcome;
  },

  signFreeAgent(playerId: string): void {
    withCareer((c) => {
      signFreeAgent(c, playerId);
      track("mgr_free_agent_signed", {});
    });
  },

  loanInPlayer(playerId: string): void {
    withCareer((c) => loanIn(c, playerId));
  },

  loanOutPlayer(playerId: string, toId: ClubId): void {
    withCareer((c) => loanOut(c, playerId, toId));
  },

  toggleTransferList(playerId: string): void {
    withCareer((c) => toggleListed(c, playerId));
  },

  renewPlayerContract(playerId: string): void {
    withCareer((c) => {
      renewContract(c, playerId);
      // Resolve any open contract mail for this player.
      for (const it of c.inbox) {
        if (
          it.kind === "contract" &&
          !it.resolved &&
          it.decision?.kind === "contract" &&
          it.decision.contract.playerId === playerId
        )
          it.resolved = "Renewed";
      }
    });
  },

  releasePlayerNow(playerId: string): void {
    withCareer((c) => releasePlayer(c, playerId));
  },
};

export function unreadCount(career: Career | null): number {
  if (!career) return 0;
  return career.inbox.filter((it) => !it.read).length;
}

/** Open decisions the user must not miss (badge emphasis). */
export function openDecisions(career: Career | null): number {
  if (!career) return 0;
  return career.inbox.filter((it) => it.decision && !it.resolved).length;
}
