# XV Manager — Tactics Design: Game Plans, Squad Fit & Continuity

**Audience:** design + engineering · **Companion docs:** [PRD.md](./PRD.md) · [SCOPING.md](./SCOPING.md) · **Status:** Approved spec (CEO decision 5) · **Date:** July 2026

This document is the concrete spec for the two CEO-mandated tactics mechanics:

- **(a) Game-plan / squad fit** — a game plan is only effective if the squad's relevant ratings support it.
- **(b) Continuity** — an XV that has played together recently earns a cohesion bonus; heavy rotation and new signings temporarily reduce it.

Both mechanics resolve to **flat modifiers on the two "power" numbers** (attack power, defence power) that the existing facet-based sim already uses to generate try counts. Nothing in `src/engine/` changes; the manager's `simFixture` computes facets with the shared `computeFacets`, then applies the modifiers below before rolling the match.

---

## 0. How the sim consumes all of this (pipeline)

For each side in a fixture:

1. **Effective players.** Each selected player's `ovr` is adjusted for form and fatigue (see §4), producing an effective lineup.
2. **Facets.** `computeFacets(lineup)` (shared engine, unchanged) → `setPiece, breakdown, defence, attack, control, goalKick, discipline, overall`.
3. **Powers.** The game plan's facet *blend* (§1) converts facets into `attackPower` and `defencePower`.
4. **Flat modifiers**, all summed onto both powers unless stated:
   | Modifier | Range | Source |
   |---|---|---|
   | Squad fit | **−3.0 … +2.0** | §2 |
   | Cohesion | **−2.5 … +2.5** | §3 |
   | Match emphasis | ±(1.0–1.5), asymmetric | §5 |
   | Home advantage | **+2.0** (home side only) | scoping §1 |
   | Bench quality | −1.0 … +1.0 | §6 |
5. **Match roll.** Expected tries per side = `2.6 + (attackPower_A − defencePower_B) × 0.2 + styleTryDelta + N(0, 1.25)`, clamped 0–9 — the same curve as the existing `simH2H`. Kicking, penalties, drop goals, timeline, and MOTM reuse the existing math. League matches may draw; knockout matches use golden point.

For calibration: **1 power point ≈ 0.2 tries ≈ ~1.4 points per match**. A ±5 swing (the worst-case tactics gap) is roughly equal to a 5-point squad `ovr` gap — tactics matter as much as one tier of squad quality, never more.

---

## 1. Game plans (the persistent team identity)

One choice, set in pre-season and changeable between matches: **Forwards First · Balanced · Expansive**. Each plan re-weights how facets convert to powers — this is the *inherent* half of squad fit (a plan leans on the facets it emphasises), and each plan carries a small style signature so matches *feel* different, not just score different.

| Plan | Attack power blend | Defence power blend | Style signature |
|---|---|---|---|
| **Forwards First** (`forward`) | `attack×0.30 + setPiece×0.40 + control×0.30` | `defence×0.50 + breakdown×0.30 + setPiece×0.20` | +0.4 expected penalty-goal chances won per match (scrum/maul pressure); −0.2 expected tries for *and* against (tighter, slower game) |
| **Balanced** (`balanced`) | `attack×0.55 + control×0.25 + setPiece×0.20` *(engine default)* | `defence×0.60 + breakdown×0.25 + setPiece×0.15` *(engine default)* | none |
| **Expansive** (`expansive`) | `attack×0.70 + control×0.20 + setPiece×0.10` | `defence×0.65 + breakdown×0.25 + setPiece×0.10` | +0.3 expected tries for *and* against (open, high-tempo game) |

(The `+4` / `+3` flat constants from the engine's `powers()` are preserved in all blends.)

## 2. Squad fit (CEO mechanic a)

Each non-balanced plan names its **key facets** — the units that must be good for the plan to work:

| Plan | Key-facet score `K` |
|---|---|
| Forwards First | `setPiece×0.6 + breakdown×0.4` |
| Expansive | `attack×0.7 + control×0.3` |
| Balanced | — (fit is always 0) |

**Formula:**

```
fitDelta = K − overall − baseline(plan)   // is the key unit better or worse than the team's average level?
fitMod   = clamp(−3.0, +2.0, 0.6 × fitDelta)
```

`fitMod` is added flat to **both** powers. `baseline(plan)` is a per-plan calibration constant — the mean `K − overall` across the league's best XVs (measured per world refresh; currently forward +0.1, expansive +0.85). Without it, facets that structurally run high relative to `overall` (control does, in this engine) would make one plan a league-wide free lunch; with it, an *average* squad fits every plan at ~0 and only genuine squad strengths move the needle.

- **Asymmetric cap (−3 / +2) is deliberate:** a mismatched plan hurts more than a perfectly-fitted plan helps. A plan is "only effective if the squad supports it" — it is never a free lunch.
- **Worked example (the CEO's case):** a squad with team overall 78 but a pack averaging ~70 has `setPiece/breakdown` facets ≈ 70 → `fitDelta ≈ −8` → `fitMod = −3.0` (clamped). Forwards First costs that team ~0.6 tries/match versus Balanced — it will visibly underperform over a season (~2–3 table places). The same squad with an elite back line gets `fitDelta ≈ +4` on Expansive → `+2.0` — the right plan for the right squad beats Balanced.
- **Balanced is the safe floor**, never the ceiling: fit 0 by definition.

**UX:** the game-plan screen shows a live **Fit badge per plan** (Strong / Decent / Poor, computed from the *current* selected XV), so the mechanic is legible before the player commits. No hidden math punishing the player.

## 3. Continuity / cohesion (CEO mechanic b)

Rewards consistent selection; punishes wholesale rotation and unbedded signings — while fatigue (§4) pulls the other way. That tension *is* the squad-management game.

**Tracking:** every player carries `recentStarts` — a rolling window of their starts in the club's **last 5 matches** (a 5-slot boolean window, shifted after every fixture; bench appearances count half). New signings arrive with an empty window.

**Formulas:**

```
familiarity(p) = min(1, startsInLast5(p) / 4)      // 4 of the last 5 = fully bedded in
teamCohesion C = mean(familiarity(p) for p in starting XV)   // 0..1
cohesionMod    = clamp(−2.5, +2.5, (C − 0.5) × 5)
```

`cohesionMod` is added flat to **both** powers.

- **Season start:** pre-season seeds every squad player with 2 virtual starts (`familiarity = 0.5`, mod = 0) — openers are neutral, continuity builds from round 1.
- **A settled XV** (everyone started 4+ of the last 5) reaches `C = 1.0` → **+2.5**, the full bonus.
- **Rotating ~half the side** in one week → `C ≈ 0.7` → +1.0: rotation is a real but survivable cost, so resting players for fatigue stays viable.
- **Wholesale changes / many new signings** → `C ≈ 0.25–0.4` → −0.5 to −1.3, recovering over 3–4 weeks as the new XV beds in. (Phase 2 transfers plug in with zero extra work: a signing simply starts with an empty window.)
- AI clubs run the identical mechanic (their auto-selection rotates on fatigue), so the player is never uniquely taxed.

**UX:** the team-sheet screen shows a **cohesion meter** for the currently selected XV with a one-line delta ("3 changes from last week — cohesion −0.8"), updating live as the player swaps names.

## 4. Form & fatigue (player-level inputs, feed everything above)

All condition inputs adjust a player's **effective `ovr`** before facets are computed (signature attribute overrides shift by the same delta). *Retuned in the management rework — see [DESIGN-management.md](./DESIGN-management.md) §6:*

```
fatiguePenalty(p) = 0.10 × max(0, fatigue − 15)     // 0 at fresh, −8.5 at fatigue 100
moraleDelta(p)    = clamp(−4, +2.4, (morale − 65) / 15)
effectiveOvr(p)   = clamp(40, 99, ovr + form − fatiguePenalty + moraleDelta)
```

- **Fatigue** (0–100): +26 per start, +13 per bench appearance; −12/week baseline recovery, a further −35 when left out of the 23. Steeper penalty than the slice's 0.07 — an unrotated XV is genuinely leggy by week 5–6, and fatigue also raises injury risk (management §5).
- **Form** (−3 … +3, integer): random walk after each matchday — biased up on a win (and for the MOTM), down on a loss. Shown as an arrow badge on every player row.
- **Morale** (0–100, added by the management rework): driven by game time, transfer listing, rejected moves, contract treatment. A sulking star plays up to −4 below his rating.

On top of player condition, each side gets **day-form noise** per match (`DAY_FORM_SD = 2.2` power-point sd on both powers) — the difficulty lever that keeps strong squads from turning fixtures into formalities.

## 5. Per-match emphasis (the one matchday dial)

One tap on the matchday screen, resets to Balanced each week:

| Emphasis | Attack power | Defence power |
|---|---|---|
| **All-out attack** ("chase the bonus point") | +1.5 | −1.0 |
| **Balanced** | 0 | 0 |
| **Tight defence** ("shut the gate") | −1.0 | +1.5 |

Small on purpose: emphasis is a nudge for a specific fixture (need 4 tries? protecting a lead in the run-in?), not a second game plan.

## 6. Bench (matchday 23)

Per scoping §1, no substitution modelling in MVP. The 8-player bench contributes a late-game quality swing:

```
benchMod = clamp(−1.0, +1.0, (benchAvgEffectiveOvr − 76) × 0.06)
```

added to both powers. A stacked bench is worth up to +1; an empty/weak one costs up to −1 — enough to make the full 23 a real decision without new sim machinery.

## 7. Caps & interaction summary

Worst-case total tactical swing between two identical squads: `(fit −3 vs +2) + (cohesion −2.5 vs +2.5) + (emphasis mismatch ~±1)` ≈ 11 power points — but reaching it requires one side to run a badly mismatched plan with a scratch XV. In normal play the gap is 2–4 points: decisive at the margin, never overwhelming squad quality. Home advantage (+2) and form stay inside the same band, so no single lever dominates.

All constants live in `src/manager/engine/tactics.ts` as named exports — tuning is one-file work, and the deterministic seeded sim makes before/after season distributions cheap to compare.
