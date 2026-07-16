// XV Manager visual identity v3 (July 2026 rebrand):
//
// Three layers, in order:
//   1. BASE — "midnight broadcast": near-black charcoal surfaces with an
//      iris-violet brand accent (--m-brand). Deliberately NOT the draft
//      game's green/gold; only #/manager uses it.
//   2. COMPETITION — every competition gets its own accent + background
//      treatment (COMP_THEMES below → CSS vars --c-accent/--c-soft/--c-glow
//      + a data-comp attribute on the shell). Matchday, report, table,
//      playoff and trophy surfaces read the competition layer, so moving
//      between the Prem and the URC feels like a change of occasion.
//      Future competitions (Champions Cup, Top 14, internationals) are one
//      new entry in COMP_THEMES.
//   3. CLUB — the career club's colours still drive --m-accent for squad /
//      nav / CTA chrome (accentFor below, unchanged behaviour).

import { CLUB_BY_ID, COMPETITIONS } from "../../data/manager";
import type { ClubId, LeagueId } from "../types";

// ---------------------------------------------------------------- Base brand

/** Iris-violet — the XV Manager brand accent (logo, landing, neutral UI). */
export const BRAND_ACCENT = "#8b7bff";
export const BRAND_ACCENT_SOFT = "rgba(139, 123, 255, 0.14)";

// ---------------------------------------------------------- Competition layer

export interface CompTheme {
  /** Sharp accent for kickers, scorelines, playoff lines, trophies. */
  accent: string;
  /** Translucent accent for fills/washes. */
  soft: string;
  /** Radial glow colour for scene backgrounds. */
  glow: string;
  /** Deep base tint the scene gradient settles into. */
  deep: string;
}

/**
 * The competition-theme map. Keyed by LeagueId today; a future Champions Cup
 * or Top 14 entry slots in without touching any screen code.
 */
export const COMP_THEMES: Record<LeagueId, CompTheme> = {
  // Premiership: floodlit crimson-claret — big-night English club rugby.
  prem: {
    accent: "#ff5063",
    soft: "rgba(255, 80, 99, 0.13)",
    glow: "rgba(214, 40, 70, 0.20)",
    deep: "#171015",
  },
  // URC: aurora teal on deep sea-slate — four nations under lights.
  urc: {
    accent: "#2cd9b6",
    soft: "rgba(44, 217, 182, 0.13)",
    glow: "rgba(20, 170, 150, 0.17)",
    deep: "#0d1717",
  },
};

/** CSS custom properties for a competition context. */
export function compVars(league: LeagueId): Record<string, string> {
  const t = COMP_THEMES[league];
  return {
    "--c-accent": t.accent,
    "--c-soft": t.soft,
    "--c-glow": t.glow,
    "--c-deep": t.deep,
  };
}

// ---------------------------------------------------------------- Trophies

export function trophyMeta(trophyId: string): { icon: string; name: string; league: LeagueId } {
  const league: LeagueId = trophyId.startsWith("urc") ? "urc" : "prem";
  const comp = COMPETITIONS[league];
  if (trophyId.endsWith("-title")) return { icon: "🏆", name: comp.trophyName, league };
  if (trophyId.endsWith("-leader"))
    return { icon: "🛡️", name: comp.leaderTrophy ?? "League Leaders", league };
  const shield = comp.shields?.find((s) => trophyId === `${league}-shield-${s.id}`);
  if (shield) return { icon: "🏅", name: shield.label, league };
  return { icon: "🏅", name: trophyId, league };
}

// ---------------------------------------------------------------- Club layer

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function luminance([r, g, b]: [number, number, number]): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** Pick a usable accent from a club's two hex colours (near-black club
 *  colours get lightened so text/borders read on the dark UI). */
export function accentFor(clubId: ClubId): { accent: string; accentSoft: string } {
  const [c1, c2] = CLUB_BY_ID[clubId].colors.map(rgb) as [
    [number, number, number],
    [number, number, number],
  ];
  let best = luminance(c1) >= luminance(c2) ? c1 : c2;
  let lum = luminance(best);
  // Whites are as useless as blacks on this UI; fall back to the other colour.
  if (lum > 0.92) {
    best = best === c1 ? c2 : c1;
    lum = luminance(best);
  }
  const accent = lum < 0.25 ? mix(best, [235, 240, 250], 0.55) : lum < 0.4 ? mix(best, [235, 240, 250], 0.3) : mix(best, [255, 255, 255], 0.05);
  return { accent, accentSoft: accent.replace("rgb(", "rgba(").replace(")", ", 0.14)") };
}
