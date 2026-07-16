// XV Manager — world data: both 2025-26 leagues (Premiership + URC) and the
// data-driven competition registry.
//
// FOR SQUAD-DATA AGENTS: one file per club under ./clubs/ (Premiership) or
// ./urc/clubs/ (URC), exporting `export const CLUB: ClubData` — contract in
// src/manager/types.ts. Any Premiership club missing from REAL_CLUBS falls
// back to a generated placeholder squad; the URC set is complete.
//
// FUTURE LEAGUES (Top 14, Champions Cup, internationals): add the club data,
// then register a new CompetitionDef in COMPETITIONS below — rounds, playoff
// shape, hosting rules, bonus points and shields are all data, not code.

import type { ClubData, ClubId, CompetitionDef, LeagueId } from "../../manager/types";
import { PREM_CLUB_IDS, URC_CLUB_IDS } from "../../manager/types";
import { placeholderClub } from "./placeholders";
import { URC_CLUBS, URC_SHIELDS } from "./urc";
import { CLUB as BATH } from "./clubs/bath";
import { CLUB as BRISTOL } from "./clubs/bristol";
import { CLUB as EXETER } from "./clubs/exeter";
import { CLUB as GLOUCESTER } from "./clubs/gloucester";
import { CLUB as HARLEQUINS } from "./clubs/harlequins";
import { CLUB as LEICESTER } from "./clubs/leicester";
import { CLUB as NEWCASTLE } from "./clubs/newcastle";
import { CLUB as NORTHAMPTON } from "./clubs/northampton";
import { CLUB as SALE } from "./clubs/sale";
import { CLUB as SARACENS } from "./clubs/saracens";

const REAL_CLUBS: Partial<Record<ClubId, ClubData>> = {
  bath: BATH,
  bristol: BRISTOL,
  exeter: EXETER,
  gloucester: GLOUCESTER,
  harlequins: HARLEQUINS,
  leicester: LEICESTER,
  newcastle: NEWCASTLE,
  northampton: NORTHAMPTON,
  sale: SALE,
  saracens: SARACENS,
};

/** All 10 Premiership clubs, real data where available. */
export const PREM_CLUBS: ClubData[] = PREM_CLUB_IDS.map(
  (id) => REAL_CLUBS[id] ?? placeholderClub(id),
);

export { URC_CLUBS };

/** Every club in the world, both leagues (26). */
export const ALL_CLUBS: ClubData[] = [...PREM_CLUBS, ...URC_CLUBS];

export const CLUB_BY_ID: Record<ClubId, ClubData> = Object.fromEntries(
  ALL_CLUBS.map((c) => [c.id, c]),
) as Record<ClubId, ClubData>;

// ---------------------------------------------------------------- Competitions

/** Real 2025-26 formats, verified. The engine reads format from here only. */
export const COMPETITIONS: Record<LeagueId, CompetitionDef> = {
  prem: {
    id: "prem",
    name: "Gallagher PREM",
    shortName: "Premiership",
    trophyName: "Premiership Champions",
    clubIds: PREM_CLUB_IDS,
    rounds: 18, // 10 clubs, double round robin
    playoffTeams: 4, // 1v4, 2v3 semis at the higher seed
    finalHosting: "neutral",
    finalVenueName: "Allianz Stadium, Twickenham",
    bonus: { tryBonusAt: 4, losingBonusWithin: 7 },
    startYear: 2025,
    leaderTrophy: "League Leaders",
  },
  urc: {
    id: "urc",
    name: "BKT United Rugby Championship",
    shortName: "URC",
    trophyName: "URC Champions",
    clubIds: URC_CLUB_IDS,
    /** 16 clubs: 6 pool derby rounds + 12 cross-pool rounds each. */
    rounds: 18,
    /**
     * Top 8 → seeded quarter-finals (1v8, 2v7, 3v6, 4v5); QFs, SFs AND the
     * Grand Final are hosted by the highest surviving seed — no neutral venue
     * (2026: 2nd-seed Leinster hosted the Bulls at Croke Park after top seeds
     * Glasgow lost their semi).
     */
    playoffTeams: 8,
    finalHosting: "highest-seed",
    bonus: { tryBonusAt: 4, losingBonusWithin: 7 },
    startYear: 2025,
    shields: URC_SHIELDS,
  },
};

const LEAGUE_OF: Record<ClubId, LeagueId> = Object.fromEntries([
  ...PREM_CLUB_IDS.map((id) => [id, "prem"]),
  ...URC_CLUB_IDS.map((id) => [id, "urc"]),
]) as Record<ClubId, LeagueId>;

/** Which league a club plays in (clubs never change league mid-world). */
export function leagueOf(clubId: ClubId): LeagueId {
  return LEAGUE_OF[clubId];
}

export function clubsOf(league: LeagueId): ClubData[] {
  return league === "prem" ? PREM_CLUBS : URC_CLUBS;
}

/** Kept as a named export — lots of code reads Prem constants directly. */
export const PREM = COMPETITIONS.prem;
export const URC = COMPETITIONS.urc;

export function seasonLabel(year: number): string {
  return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
}
