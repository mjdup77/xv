// Core domain types for XV — the Rugby World Cup draft game.

export type Role =
  | "prop"
  | "hooker"
  | "lock"
  | "flanker"
  | "number8"
  | "scrumhalf"
  | "flyhalf"
  | "centre"
  | "wing"
  | "fullback";

export type Attr =
  | "setPiece"
  | "breakdown"
  | "carry"
  | "defence"
  | "handling"
  | "kick"
  | "goalKick"
  | "pace"
  | "gameManage"
  | "discipline";

// The 15 position-locked slots of a starting XV.
export type SlotId =
  | "LH" // 1 loosehead prop
  | "HK" // 2 hooker
  | "TH" // 3 tighthead prop
  | "L4" // 4 lock
  | "L5" // 5 lock
  | "F6" // 6 blindside flanker
  | "F7" // 7 openside flanker
  | "N8" // 8 number eight
  | "SH" // 9 scrum-half
  | "FH" // 10 fly-half
  | "IC" // 12 inside centre
  | "OC" // 13 outside centre
  | "LW" // 11 left wing
  | "RW" // 14 right wing
  | "FB"; // 15 fullback

export interface Slot {
  id: SlotId;
  number: number;
  label: string;
  accepts: Role[];
  // Layout coordinates on the pitch (0..100, 0..100).
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  nation: string;
  year: number;
  role: Role;
  alt?: Role[];
  ovr: number;
  overrides?: Partial<Record<Attr, number>>;
}

export interface Squad {
  id: string;
  nation: string;
  year: number;
  flag: string;
  players: Player[];
}

export type Lineup = Partial<Record<SlotId, Player>>;

export interface MatchResult {
  round: string;
  opponent: string;
  oppFlag: string;
  pf: number; // points for
  pa: number; // points against
  tries: number; // tries scored
  triesAg: number; // tries conceded
  won: boolean;
  draw: boolean;
  bonusPoint: boolean; // try-scoring bonus (4+ tries) on a win
  motm: string; // man of the match
}

export interface TournamentResult {
  matches: MatchResult[];
  advancedFromPool: boolean;
  champion: boolean;
  perfect35: boolean; // bonus-point win in all 7
  perfectScore: number; // sum of game points (5 per BP win, 4 per win, etc.)
  facets: Record<string, number>;
  chemistry: number;
  overall: number;
  verdict: string;
  identity: string;
  triesFor: number;
  triesAgainst: number;
  stalwarts: { name: string; awards: number; ovr: number }[];
  advice: string[];
  // Fun, narrative tournament stats.
  topScorer: { name: string; points: number; goalPct: number };
  topTryScorer: { name: string; tries: number; note: string };
  funFacts: string[];
  review: { wentWell: string[]; lessons: string[] };
}
