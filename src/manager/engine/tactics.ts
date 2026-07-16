// Game plans, squad fit, continuity/cohesion, emphasis, and every tuning
// constant for the manager sim. Spec: docs/manager/DESIGN-tactics.md.
// All modifiers resolve to flat bumps on attack/defence "power" — nothing in
// src/engine/ changes.

import type { Facets } from "../../engine/ratings";
import type { EmphasisId, GamePlanId } from "../types";

const clamp = (lo: number, hi: number, v: number) => Math.max(lo, Math.min(hi, v));

export interface GamePlanDef {
  id: GamePlanId;
  label: string;
  blurb: string;
  attackPower: (f: Facets) => number;
  defencePower: (f: Facets) => number;
  /** Key-facet score K; undefined = balanced (fit always 0). */
  keyScore?: (f: Facets) => number;
  /**
   * Calibration: K − overall for the league-average squad. Subtracted before
   * the fit slope so an average squad fits every plan at ~0 and only genuine
   * strengths/weaknesses move the needle. Re-measure on each world refresh
   * (scripts: sim every club's best XV, take the mean delta per plan).
   */
  fitBaseline: number;
  keyUnits: string; // UI copy: what the plan leans on
  /** Expected tries added to BOTH sides of this team's matches (style). */
  styleTryDelta: number;
  /** Extra expected penalty-goal chances won per match. */
  penChanceBonus: number;
}

// The +4 / +3 flat constants preserve the engine's calibrated difficulty curve.
export const GAME_PLANS: Record<GamePlanId, GamePlanDef> = {
  forward: {
    id: "forward",
    label: "Forwards First",
    blurb: "Scrum, maul, squeeze. Slow, tight rugby that turns pack dominance into points.",
    attackPower: (f) => f.attack * 0.3 + f.setPiece * 0.4 + f.control * 0.3 + 4,
    defencePower: (f) => f.defence * 0.5 + f.breakdown * 0.3 + f.setPiece * 0.2 + 3,
    keyScore: (f) => f.setPiece * 0.6 + f.breakdown * 0.4,
    fitBaseline: 0.1,
    keyUnits: "set-piece & breakdown",
    styleTryDelta: -0.2,
    penChanceBonus: 0.4,
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    blurb: "Play what's in front of you. No lean, no exposure — the safe floor.",
    attackPower: (f) => f.attack * 0.55 + f.control * 0.25 + f.setPiece * 0.2 + 4,
    defencePower: (f) => f.defence * 0.6 + f.breakdown * 0.25 + f.setPiece * 0.15 + 3,
    fitBaseline: 0,
    keyUnits: "everything equally",
    styleTryDelta: 0,
    penChanceBonus: 0,
  },
  expansive: {
    id: "expansive",
    label: "Expansive",
    blurb: "Width, tempo, offloads. Needs a back line that can finish what it starts.",
    attackPower: (f) => f.attack * 0.7 + f.control * 0.2 + f.setPiece * 0.1 + 4,
    defencePower: (f) => f.defence * 0.65 + f.breakdown * 0.25 + f.setPiece * 0.1 + 3,
    keyScore: (f) => f.attack * 0.7 + f.control * 0.3,
    fitBaseline: 0.85,
    keyUnits: "attack & control",
    styleTryDelta: 0.3,
    penChanceBonus: 0,
  },
};

// ---- Squad fit (DESIGN-tactics §2) ----
// Asymmetric cap: a mismatched plan hurts (−3) more than a fitted one helps (+2).
export const FIT_SLOPE = 0.6;
export const FIT_MIN = -3.0;
export const FIT_MAX = 2.0;

export function fitMod(plan: GamePlanId, f: Facets): number {
  const def = GAME_PLANS[plan];
  if (!def.keyScore) return 0;
  return clamp(
    FIT_MIN,
    FIT_MAX,
    FIT_SLOPE * (def.keyScore(f) - f.overall - def.fitBaseline),
  );
}

export function fitLabel(mod: number): { label: string; tone: "good" | "ok" | "bad" } {
  if (mod >= 1.0) return { label: "Strong fit", tone: "good" };
  if (mod >= -0.75) return { label: "Decent fit", tone: "ok" };
  return { label: "Poor fit", tone: "bad" };
}

// ---- Continuity / cohesion (DESIGN-tactics §3) ----
export const COHESION_SPAN = 5; // rolling window of the club's last 5 matches
export const COHESION_FULL_AT = 4; // 4 starts in the window = fully bedded in
export const COHESION_SLOPE = 5;
export const COHESION_CAP = 2.5;

/** familiarity 0..1 from a player's appearance window (1 start, 0.5 bench). */
export function familiarity(window: number[]): number {
  const sum = window.slice(0, COHESION_SPAN).reduce((s, v) => s + v, 0);
  return Math.min(1, sum / COHESION_FULL_AT);
}

/** Team cohesion C (0..1) = mean familiarity of the starting XV. */
export function teamCohesion(windows: number[][]): number {
  if (windows.length === 0) return 0.5;
  return windows.reduce((s, w) => s + familiarity(w), 0) / windows.length;
}

export function cohesionMod(c: number): number {
  return clamp(-COHESION_CAP, COHESION_CAP, (c - 0.5) * COHESION_SLOPE);
}

// ---- Per-match emphasis (DESIGN-tactics §5) ----
export const EMPHASES: Record<
  EmphasisId,
  { label: string; blurb: string; attack: number; defence: number }
> = {
  attack: { label: "All-out attack", blurb: "Chase tries (and the bonus point) — leave space behind.", attack: 1.5, defence: -1.0 },
  balanced: { label: "Balanced", blurb: "No special instructions.", attack: 0, defence: 0 },
  defence: { label: "Tight defence", blurb: "Shut the gate — concede less, create less.", attack: -1.0, defence: 1.5 },
};

// ---- Other match modifiers ----
export const HOME_ADVANTAGE = 2.0; // scoping §1; not applied at neutral venues

/**
 * Per-side, per-match "day form" noise (sd in power points), applied to both
 * powers. This is the difficulty lever that keeps a strong squad from turning
 * every fixture into a coin-weighted formality: any side can have an off day.
 * DESIGN-management.md §6.
 */
export const DAY_FORM_SD = 2.2;

export function benchMod(benchAvgEffOvr: number): number {
  return clamp(-1.0, 1.0, (benchAvgEffOvr - 76) * 0.06);
}

// ---- Player condition (DESIGN-tactics §4, retuned in DESIGN-management §6) ----
export const FATIGUE_START = 26;
export const FATIGUE_BENCH = 13;
/** Baseline weekly recovery for everyone (played or not). */
export const FATIGUE_RECOVERY = -12;
/** Additional recovery when left out of the 23 entirely. */
export const FATIGUE_REST = -35;
export const FORM_CAP = 3;

/** Steeper than the slice's 0.07: an unrotated XV is genuinely leggy by
 *  week 5-6 (max penalty −8.5 at fatigue 100), so depth and rotation matter. */
export function fatiguePenalty(fatigue: number): number {
  return 0.1 * Math.max(0, fatigue - 15);
}

/** Morale swings effective rating by roughly −4..+2.3 around the 65 norm. */
export function moraleDelta(morale: number): number {
  return clamp(-4, 2.4, (morale - 65) / 15);
}

export function effectiveOvr(
  ovr: number,
  form: number,
  fatigue: number,
  morale = 65,
): number {
  return clamp(40, 99, ovr + form - fatiguePenalty(fatigue) + moraleDelta(morale));
}
