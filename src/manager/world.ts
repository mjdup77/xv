// Static club identity + world-building helpers. The *living* world (players,
// contracts, budgets) lives inside the career save (types.ts); this module
// owns what never changes mid-career: club names, colours, grounds, stature,
// and which league each club belongs to.

import {
  ALL_CLUBS,
  CLUB_BY_ID,
  COMPETITIONS,
  PREM_CLUBS,
  URC_CLUBS,
  clubsOf,
  leagueOf,
} from "../data/manager";
import type { Career, ClubId, LeagueId, MPlayer, PlayerRec } from "./types";
import { effectiveOvr } from "./engine/tactics";
import type { Attr } from "../types";

export { ALL_CLUBS, CLUB_BY_ID, COMPETITIONS, PREM_CLUBS, URC_CLUBS, clubsOf, leagueOf };

/**
 * Club stature (average of the top-23 researched ratings) — drives budgets,
 * board expectations, transfer pull and job offers. Computed once from the
 * data files so both leagues sit on the same scale automatically.
 */
const STATURE: Record<ClubId, number> = Object.fromEntries(
  ALL_CLUBS.map((c) => {
    const top = [...c.players].sort((a, b) => b.ovr - a.ovr).slice(0, 23);
    return [c.id, Math.round((top.reduce((s, p) => s + p.ovr, 0) / Math.max(1, top.length)) * 10) / 10];
  }),
) as Record<ClubId, number>;

export function stature(id: ClubId): number {
  return STATURE[id];
}

/** Clubs ranked by stature WITHIN their own league, strongest first. */
export function statureRank(id: ClubId): number {
  const sorted = [...clubsOf(leagueOf(id))].sort((a, b) => stature(b.id) - stature(a.id));
  return sorted.findIndex((c) => c.id === id) + 1;
}

export function clubName(id: ClubId): string {
  return CLUB_BY_ID[id].name;
}

export function clubShort(id: ClubId): string {
  return CLUB_BY_ID[id].shortName;
}

/** The league the user's club plays in ("prem" while unemployed from a Prem
 *  club — the career keeps pointing at the last club until a job is taken). */
export function userLeague(career: Career): LeagueId {
  return leagueOf(career.clubId);
}

/** The club a player turns out for this season (loans override ownership). */
export function playingClub(p: PlayerRec): ClubId | null {
  return p.loan?.toId ?? p.clubId;
}

/** A club's current playing roster (owned, minus loaned-out, plus loaned-in). */
export function rosterOf(career: Career, clubId: ClubId): PlayerRec[] {
  return Object.values(career.players).filter((p) => playingClub(p) === clubId);
}

/**
 * Engine-compatible view of a player with form/fatigue/morale applied to ovr
 * (signature overrides shift by the same delta). Feeds computeFacets directly.
 */
export function toEngine(p: PlayerRec, year: number): MPlayer {
  const eff = Math.round(effectiveOvr(p.ovr, p.form, p.fatigue, p.morale));
  const delta = eff - p.ovr;
  let overrides = p.overrides;
  if (overrides && delta !== 0) {
    overrides = Object.fromEntries(
      Object.entries(overrides).map(([k, v]) => [
        k,
        Math.max(1, Math.min(99, (v as number) + delta)),
      ]),
    ) as Partial<Record<Attr, number>>;
  }
  return {
    id: p.id,
    name: p.name,
    nation: p.nation,
    year,
    role: p.role,
    alt: p.alt,
    ovr: eff,
    overrides,
    age: p.age,
    clubId: (playingClub(p) ?? "bath") as ClubId,
  };
}
