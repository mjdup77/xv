// Blind Rank — deterministic daily puzzle, scoring, and result storage.
//
// Everyone gets the SAME puzzle on the same calendar day: we seed an Rng from
// the UTC date string, pick the day's theme, then draw 8 players from that
// theme's candidate pool. The "true" order is those 8 sorted by their peak
// rating (desc), ties broken by name — so it's identical for every player.

import type { Player } from "../types";
import { Rng } from "../engine/rng";
import { buildUniverse, themePool, THEMES, type Theme, type UniPlayer } from "./themes";

const EPOCH = "2024-01-01"; // Blind Rank #1 lands the day after.
const DAY_MS = 86_400_000;
const SET_SIZE = 8;

// Bundle marker + selection tuning. Bumping this string is a grep-able signal
// that the elite-biased selection is the deployed build.
export const SELECTION_VERSION = "blindrank-elite-v5";

// Draw the day's 8 only from the top slice of the theme's rating distribution,
// so every puzzle is star-studded. Weighted toward the very top (so the genuine
// #1 shows up often) but not identical day-to-day.
const TOP_TIER = 16; // consider at most the top-16 rated (prime) players
const RANK_WEIGHT_EXP = 1.6; // higher → stronger bias to the top of the tier

export function todayDayStr(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

// Puzzle number = days since the epoch (first puzzle is #1).
export function puzzleNumber(day: string = todayDayStr()): number {
  const t = Date.parse(day + "T00:00:00Z");
  const e = Date.parse(EPOCH + "T00:00:00Z");
  return Math.max(1, Math.round((t - e) / DAY_MS));
}

export interface DailyPuzzle {
  puzzle: number;
  day: string;
  theme: Theme;
  players: Player[]; // the 8 players in REVEAL order (unrelated to rating)
  trueOrder: Player[]; // best → worst
}

// Sort the 8 into their canonical best→worst order. Deterministic tie-break so
// two equal ratings never flip between loads.
function toTrueOrder(players: Player[]): Player[] {
  return [...players].sort(
    (a, b) => b.ovr - a.ovr || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

// Surname used for display + clash detection (drops the first token, keeps
// lowercase particles like "van der"). Matches the pitch labels.
export function surnameOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : name;
}

// Elite-biased, deterministic pick of `n` unique players from a theme pool.
//   1. rank the pool by PRIME rating (desc), stable tie-break;
//   2. keep only the top tier (so mid-tier filler never surfaces);
//   3. weighted-sample without replacement, biased to the very top;
//   4. avoid a second player whose surname is already used, while the tier
//      still offers an un-clashing candidate (prevents confusing twin labels).
function elitePick(pool: UniPlayer[], rng: Rng, n: number): UniPlayer[] {
  const ranked = [...pool].sort(
    (a, b) =>
      b.player.ovr - a.player.ovr ||
      a.player.name.localeCompare(b.player.name) ||
      a.player.id.localeCompare(b.player.id),
  );
  const tierSize = Math.min(ranked.length, Math.max(n, TOP_TIER));
  const tier = ranked.slice(0, tierSize);
  // Rank-based weights: index 0 (best) heaviest. Ties in rating don't matter —
  // the weight is by position, so the ceiling of the tier is always favoured.
  const weights = tier.map((_, i) => Math.pow(tierSize - i, RANK_WEIGHT_EXP));

  const remaining = tier.map((_, i) => i);
  const usedSurnames = new Set<string>();
  const chosen: UniPlayer[] = [];

  while (chosen.length < n && remaining.length > 0) {
    let total = 0;
    for (const i of remaining) total += weights[i];
    let r = rng.next() * total;
    let pickPos = remaining.length - 1;
    for (let k = 0; k < remaining.length; k++) {
      r -= weights[remaining[k]];
      if (r <= 0) {
        pickPos = k;
        break;
      }
    }
    const idx = remaining[pickPos];
    remaining.splice(pickPos, 1);
    const cand = tier[idx];
    const sname = surnameOf(cand.player.name).toLowerCase();
    if (usedSurnames.has(sname)) {
      // Only skip if another still-available candidate has a fresh surname;
      // otherwise accept the clash (display layer disambiguates as a fallback).
      const hasAlt = remaining.some(
        (j) => !usedSurnames.has(surnameOf(tier[j].player.name).toLowerCase()),
      );
      if (hasAlt) continue;
    }
    usedSurnames.add(sname);
    chosen.push(cand);
  }
  return chosen;
}

const PUZZLE_CACHE = new Map<string, DailyPuzzle>();

export function puzzleForDay(day: string = todayDayStr()): DailyPuzzle {
  const cached = PUZZLE_CACHE.get(day);
  if (cached) return cached;
  const universe = buildUniverse();
  const rng = new Rng("blindrank-" + day);
  // 1) the day's theme, 2) an elite-biased set of 8 from its pool, 3) a reveal
  // order that's independent of rating (so ordering leaks no hints). The RNG
  // draw sequence is fixed, so the result is byte-for-byte reproducible.
  const theme = THEMES[rng.int(0, THEMES.length - 1)];
  const pool = themePool(theme, universe);
  const selected = elitePick(pool, rng, SET_SIZE);
  const players = rng.shuffle(selected).map((u) => u.player);
  const puzzle: DailyPuzzle = {
    puzzle: puzzleNumber(day),
    day,
    theme,
    players,
    trueOrder: toTrueOrder(players),
  };
  PUZZLE_CACHE.set(day, puzzle);
  return puzzle;
}

// ---- Scoring ----
// The player fills 8 ranked slots (slot 0 = best). We compare each placement to
// the true rank via summed absolute rank distance, normalised to 0–100. A full
// reversal of 8 items sums to 32, so that's our zero point.
const MAX_DIST = 32;

export type Tile = "🟩" | "🟨" | "⬜";

export interface Score {
  score: number; // 0–100
  dist: number; // raw summed rank distance
  grid: Tile[]; // per-slot: 🟩 exact, 🟨 within 1, ⬜ otherwise
  exact: number; // count of perfectly placed slots
}

// `placements[slot]` = the player the user put in that slot (slot 0 = rank 1).
export function scorePlacements(placements: Player[], trueOrder: Player[]): Score {
  const rank = new Map<string, number>();
  trueOrder.forEach((p, i) => rank.set(p.id, i));
  let dist = 0;
  let exact = 0;
  const grid: Tile[] = [];
  placements.forEach((p, slot) => {
    const t = rank.get(p.id) ?? slot;
    const d = Math.abs(slot - t);
    dist += d;
    if (d === 0) {
      grid.push("🟩");
      exact += 1;
    } else if (d === 1) {
      grid.push("🟨");
    } else {
      grid.push("⬜");
    }
  });
  const score = Math.max(0, Math.min(100, Math.round(100 * (1 - dist / MAX_DIST))));
  return { score, dist, grid, exact };
}

// ---- Once-per-day storage ----
const STORE_PREFIX = "xv_blindrank_";

export interface StoredResult {
  puzzle: number;
  day: string;
  theme: string; // theme title, for display + analytics
  score: number;
  grid: Tile[];
  placed: string[]; // player ids in slot order (rank 1 → 8)
}

export function loadResult(day: string = todayDayStr()): StoredResult | null {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + day);
    if (!raw) return null;
    const r = JSON.parse(raw) as StoredResult;
    if (typeof r.score === "number" && Array.isArray(r.placed)) return r;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveResult(r: StoredResult): void {
  try {
    localStorage.setItem(STORE_PREFIX + r.day, JSON.stringify(r));
  } catch {
    /* storage unavailable */
  }
}

// ---- Share (Wordle-style) ----
const BASE = "https://xv-7-0.vercel.app/";

export function shareLink(): string {
  return `${BASE}?utm_source=share&utm_medium=blindrank`;
}

export function shareText(r: { puzzle: number; score: number; grid: Tile[] }): string {
  return `XV Blind Rank #${r.puzzle} — ${r.score}/100\n${r.grid.join("")}`;
}
