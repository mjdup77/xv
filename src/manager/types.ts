// XV Manager — domain types for manager mode.
//
// Manager mode reuses the existing engine's Role / Attr / SlotId / Lineup and
// the facet math in src/engine/ratings.ts. Everything here is additive; no
// file in src/engine/ or src/types.ts changes.
//
// Save v3 ("multi-league" integration, July 2026): the career world now spans
// BOTH the Premiership and the URC — 26 clubs simming concurrently, one
// LeagueSeason per league, a cross-league transfer market and job market, and
// a data-driven CompetitionDef per league (rounds, playoff format, final
// venue rules, bonus points, shields). v1/v2 saves are discarded (pre-release,
// CEO testing only) — the store warns cleanly instead of migrating.

import type { Attr, Player as EnginePlayer, Role, SlotId } from "../types";

// ===========================================================================
// DATA FILE CONTRACT — read this if you are authoring squad data files.
// ===========================================================================
//
// Real 2025-26 squad data lives under src/data/manager/clubs/ (Premiership)
// and src/data/manager/urc/clubs/ (URC),
// ONE FILE PER CLUB, named `<clubId>.ts`, each exporting:
//
//     export const CLUB: ClubData = { ... };
//
// and registered in src/data/manager/index.ts (replace the placeholder entry
// for that club id — see the CLUBS list there).
//
// Expected shape, exactly:
//
//     export const CLUB: ClubData = {
//       id: "bath",                        // stable ClubId from the list below — NEVER renamed
//       name: "Bath Rugby",                // full display name
//       shortName: "Bath",                 // table display, <= 12 chars
//       abbr: "BAT",                       // 3-letter code
//       city: "Bath",
//       stadium: "The Recreation Ground",
//       colors: ["#003c71", "#000000"],    // [primary, secondary] hex
//       players: [
//         {
//           id: "finn-russell",            // stable slug, unique ACROSS THE LEAGUE
//                                          // (players move clubs; ids never change)
//           name: "Finn Russell",
//           role: "flyhalf",               // Role from src/types.ts
//           alt: ["centre"],               // optional secondary positions
//           age: 33,                       // age at the start of the 2025-26 season
//           nation: "Scotland",
//           ovr: 91,                       // 1-99, same scale as src/data/squads.ts
//                                          // (Premiership range is roughly 62-92;
//                                          //  league average starter ~76-78)
//           overrides: { goalKick: 90, handling: 93 }, // optional signature
//                                          // attributes, ABSOLUTE values 1-99,
//                                          // keys from Attr in src/types.ts
//         },
//         // ... ~35 players. The squad MUST be able to fill a legal matchday
//         // 23: at least 3 props, 2 hookers, 3 locks, 4 flankers/number8s,
//         // 2 scrumhalves, 2 flyhalves, 3 centres, 4 back-three (wing/fullback).
//       ],
//     };
//
// Ratings feed src/engine/ratings.ts unchanged: a player's attribute sheet is
// `ovr` + per-role profile deltas, with `overrides` taking precedence. Rate
// conservatively — one number per player plus 0-4 signature overrides for the
// stars is the intended fidelity.
// ===========================================================================

// ===========================================================================
// Leagues & competitions (data-driven — new leagues slot in here)
// ===========================================================================

export const LEAGUE_IDS = ["prem", "urc"] as const;
export type LeagueId = (typeof LEAGUE_IDS)[number];

/** The ten 2025-26 Premiership clubs. Stable ids — saves reference these. */
export const PREM_CLUB_IDS = [
  "bath",
  "bristol",
  "exeter",
  "gloucester",
  "harlequins",
  "leicester",
  "newcastle",
  "northampton",
  "sale",
  "saracens",
] as const;
export type PremClubId = (typeof PREM_CLUB_IDS)[number];

/** The sixteen 2025-26 URC clubs. Stable ids — saves reference these. */
export const URC_CLUB_IDS = [
  // Ireland
  "leinster",
  "munster",
  "ulster",
  "connacht",
  // Wales
  "cardiff",
  "ospreys",
  "scarlets",
  "dragons",
  // Scotland
  "edinburgh",
  "glasgow",
  // Italy
  "benetton",
  "zebre",
  // South Africa
  "bulls",
  "sharks",
  "stormers",
  "lions",
] as const;
export type URCClubId = (typeof URC_CLUB_IDS)[number];

/** Any club in the game world. Player ids are unique ACROSS leagues. */
export type ClubId = PremClubId | URCClubId;

/** A season-end regional honour decided on pool games only (URC Shields). */
export interface ShieldDef {
  id: string; // "irish" | "welsh" | "scotit" | "sa" | future
  label: string; // "Irish Shield"
  clubIds: readonly ClubId[];
}

/**
 * Everything format-specific about a competition, as data. The engine never
 * hardcodes rounds, playoff shapes, bonus rules or venues — future leagues
 * (Top 14, Champions Cup, internationals) are new entries, not new code.
 */
export interface CompetitionDef {
  id: LeagueId;
  name: string; // full broadcast name: "Gallagher PREM"
  shortName: string; // "Premiership"
  trophyName: string; // "Premiership Champions"
  clubIds: readonly ClubId[];
  /** Regular-season rounds (both launch leagues: 18). */
  rounds: number;
  /** Top-N playoff: 4 = semis+final, 8 = quarters+semis+final. */
  playoffTeams: 4 | 8;
  /** "neutral" = fixed venue (name below); "highest-seed" = hosts throughout. */
  finalHosting: "neutral" | "highest-seed";
  finalVenueName?: string;
  /** League points: 4/2/0 plus these two bonuses. */
  bonus: { tryBonusAt: number; losingBonusWithin: number };
  startYear: number;
  /** Regional shields (URC): pool-game-only season honours. */
  shields?: readonly ShieldDef[];
  /** Does the regular-season winner lift silverware ("League Leaders")? */
  leaderTrophy?: string;
}

export interface PlayerDef {
  id: string;
  name: string;
  role: Role;
  alt?: Role[];
  age: number;
  nation: string;
  ovr: number;
  overrides?: Partial<Record<Attr, number>>;
}

export interface ClubData {
  id: ClubId;
  name: string;
  shortName: string;
  abbr: string;
  city: string;
  stadium: string;
  colors: [string, string];
  players: PlayerDef[];
}

// ===========================================================================
// Persistent world (lives inside the career save)
// ===========================================================================

export interface InjuryState {
  /** Weeks until available again (decrements on every calendar week). */
  weeks: number;
  label: string; // "hamstring strain", "HIA protocol", ...
}

/**
 * A persistent world player. Created once at career start (from the data
 * files) or by youth intake; ages, grows, moves clubs, retires.
 */
export interface PlayerRec {
  id: string;
  name: string;
  nation: string;
  role: Role;
  alt?: Role[];
  age: number;
  ovr: number;
  overrides?: Partial<Record<Attr, number>>;
  /** Hidden true potential ceiling (>= ovr while young; ovr once peaked). */
  pot: number;
  /** Owning club; null = free agent. */
  clubId: ClubId | null;
  /** Active loan: playing for `toId` this season, still owned by clubId. */
  loan?: { toId: ClubId };
  // Contract
  wage: number; // £k per season
  expiry: number; // final season year covered (expiry === season.year → final year)
  /** Transfer-listed by the owning club. */
  listed?: boolean;
  // Condition
  form: number; // -3..+3
  fatigue: number; // 0..100
  /** Rolling appearance window, newest first: 1 start, 0.5 bench, 0 rested. */
  window: number[];
  morale: number; // 0..100
  injury?: InjuryState;
  /** Game-time promise: must start >=2 of the next `until - week` matches. */
  promise?: { madeWeek: number };
  // This-season stats
  starts: number;
  benchApps: number;
  minutes: number;
  tries: number;
  /** True for youth-intake regens (excluded from real-name disclaimers etc.). */
  youth?: boolean;
}

/** Engine-compatible view of a PlayerRec (what lineups/facets consume). */
export interface MPlayer extends EnginePlayer {
  age: number;
  clubId: ClubId;
}

export type GamePlanId = "forward" | "balanced" | "expansive";
export type EmphasisId = "attack" | "balanced" | "defence";

export interface Selection {
  starters: Partial<Record<SlotId, string>>; // playerId per slot
  bench: string[]; // 8 playerIds
}

export interface ClubState {
  /** Transfer kitty, £k. Fees in/out; board top-up each season. */
  cash: number;
  /** Persistent matchday selection (AI clubs keep continuity like the user). */
  selection: Selection;
  plan: GamePlanId;
}

// ===========================================================================
// Season / fixtures
// ===========================================================================

/** Compact stored result — full reports are kept only for the user's last match. */
export interface StoredResult {
  homePts: number;
  awayPts: number;
  homeTries: number;
  awayTries: number;
}

export interface Fixture {
  id: string;
  league: LeagueId;
  /**
   * 1..rounds regular; above that, knockout rounds in playing order
   * (Prem: 19 semi, 20 final · URC: 19 quarter, 20 semi, 21 final).
   */
  round: number;
  homeId: ClubId;
  awayId: ClubId;
  seed: string;
  result?: StoredResult;
}

export type LeaguePhase = "regular" | "quarters" | "semis" | "final" | "done";

/** One league's season within the shared calendar. Both leagues sim weekly. */
export interface LeagueSeason {
  league: LeagueId;
  phase: LeaguePhase;
  /** Next regular round to play (1..rounds). */
  round: number;
  fixtures: Fixture[];
  quarters?: Fixture[];
  semis?: Fixture[];
  final?: Fixture;
  leaderId?: ClubId;
  championId?: ClubId;
  /** Shield id → winning club, decided when the regular season ends (URC). */
  shieldWinners?: Record<string, ClubId>;
}

export type SeasonPhase = "preseason" | "playing" | "offseason";

export interface SeasonState {
  year: number; // 2025 = the 2025-26 season
  phase: SeasonPhase;
  /**
   * Shared calendar week for inbox dating: 0 = pre-season, 1..18 = rounds,
   * 19 = Prem semis + URC quarters, 20 = Prem final + URC semis,
   * 21 = URC Grand Final, 22 = off-season.
   */
  week: number;
  leagues: Record<LeagueId, LeagueSeason>;
}

export interface TableRow {
  clubId: ClubId;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pf: number;
  pa: number;
  triesFor: number;
  tryBonus: number;
  loseBonus: number;
  points: number;
}

// ===========================================================================
// Inbox
// ===========================================================================

export type InboxKind =
  | "preview" // matchday preview with opposition analysis
  | "injury" // physio room report
  | "offer" // transfer/loan offer for one of YOUR players (decision)
  | "contract" // contract expiry warning (decision: open renewal)
  | "unhappy" // player wants game time / requests transfer (decision)
  | "board" // objective, warnings, praise, budget top-ups
  | "news" // league news digest: results, table movement, transfers elsewhere
  | "scout" // scout note: a target worth watching
  | "window" // transfer window open/close reminders
  | "progression" // end-of-season development report
  | "job"; // job offer from another club (decision)

/** An offer from an AI club for one of the user's players. */
export interface OfferPayload {
  playerId: string;
  fromClub: ClubId;
  fee: number; // £k (0 for loans)
  loan?: boolean;
  /** Set once the user has countered — the improved fee (accept/reject only). */
  countered?: boolean;
  /** Week the offer lapses if untouched. */
  expiresWeek: number;
}

export interface ContractPayload {
  playerId: string;
  demandWage: number; // £k per season
  years: number;
}

export interface UnhappyPayload {
  playerId: string;
  reason: "gametime" | "listed";
}

export interface JobPayload {
  clubId: ClubId;
}

export type InboxDecision =
  | { kind: "offer"; offer: OfferPayload }
  | { kind: "contract"; contract: ContractPayload }
  | { kind: "unhappy"; unhappy: UnhappyPayload }
  | { kind: "job"; job: JobPayload };

export interface InboxItem {
  id: string;
  season: number; // seasonIndex
  week: number;
  kind: InboxKind;
  from: string; // sender line: "Physio room", "The board", ...
  subject: string;
  body: string; // \n-separated paragraphs
  read?: boolean;
  decision?: InboxDecision;
  /** Set when a decision was taken (label of the chosen action). */
  resolved?: string;
}

// ===========================================================================
// Board / career
// ===========================================================================

export interface BoardState {
  confidence: number; // 0..100
  /** League position the board demands (1 = win the title). */
  objective: number;
  objectiveLabel: string;
  /** One-shot flags so praise/warning mails fire once per season. */
  warned?: boolean;
  praised?: boolean;
}

// ---- Match report (user's matches only) ----

export interface ReportMoment {
  minute: number;
  side: "home" | "away";
  kind: "try" | "pen" | "drop";
  text: string;
  points: number;
}

export interface ReportTeam {
  clubId: ClubId;
  label: string;
  points: number;
  tries: number;
  cons: number;
  pens: number;
  drops: number;
  tryScorers: string[];
  /** Tactics transparency: what the sim actually applied. */
  tactics: {
    plan: GamePlanId;
    emphasis: EmphasisId;
    fitMod: number;
    cohesionMod: number;
    cohesion: number; // 0..1
  };
}

export interface MatchReport {
  fixtureId: string;
  roundLabel: string;
  home: ReportTeam;
  away: ReportTeam;
  draw: boolean;
  homeWon: boolean;
  motm: { name: string; team: string };
  timeline: ReportMoment[];
  headline: string;
  /** League points banked by the user's club in this match (regular season). */
  userLeaguePoints?: number;
  bonuses?: string[]; // e.g. ["Try bonus (4+ tries)"]
  /** Injuries to the user's players sustained in this match. */
  injuries?: { name: string; label: string; weeks: number }[];
}

// ---- Career save ----

export interface SeasonRecord {
  year: number;
  clubId: ClubId;
  league: LeagueId;
  position: number;
  champion: boolean;
  leader: boolean;
  /** Shield ids won this season (URC careers). */
  shields?: string[];
  wins: number;
  losses: number;
  sacked?: boolean;
}

/** End-of-season development report (kept for the review screen). */
export interface ProgressionEntry {
  playerId: string;
  name: string;
  age: number;
  from: number;
  to: number;
  minutes: number;
}

export interface ProgressionReport {
  year: number;
  grew: ProgressionEntry[];
  declined: ProgressionEntry[];
  retired: { name: string; age: number; ovr: number }[];
  youth: { name: string; age: number; ovr: number; role: Role }[];
}

export interface Career {
  v: 3; // save version — v1/v2 saves are discarded (fresh-career prompt)
  clubId: ClubId;
  /** Set when sacked/resigned: pick a new job before play continues. */
  unemployed?: boolean;
  jobOffers?: ClubId[];
  seasonIndex: number; // 0 = 2025-26
  seed: string;
  gamePlan: GamePlanId;
  emphasis: EmphasisId; // per-match, reset to "balanced" after each matchday
  /** The whole living world: every player, keyed by id. */
  players: Record<string, PlayerRec>;
  /** Per-club persistent state (cash, AI selections, plans). */
  clubs: Record<ClubId, ClubState>;
  board: BoardState;
  season: SeasonState;
  inbox: InboxItem[];
  history: SeasonRecord[];
  lastReport?: MatchReport;
  progression?: ProgressionReport;
  /** Star-sale grudges etc. — squad-wide morale events already applied. */
  soldStarsThisSeason: number;
}

// ---- Cross-career trophy cabinet (survives careers; localStorage) ----

export interface TrophyEntry {
  /**
   * "prem-title" | "prem-leader" | "urc-title" | "urc-leader" |
   * "urc-shield-<shieldId>" — the cabinet distinguishes competitions.
   */
  trophyId: string;
  clubId: ClubId;
  year: number;
}

export interface Cabinet {
  trophies: TrophyEntry[];
  seasonsCompleted: number;
  matchesWon: number;
  matchesPlayed: number;
}
