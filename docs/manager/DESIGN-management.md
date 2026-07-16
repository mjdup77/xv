# XV Manager — Management Layer Design

**Companion docs:** [PRD.md](./PRD.md) · [SCOPING.md](./SCOPING.md) · [DESIGN-tactics.md](./DESIGN-tactics.md) · **Date:** July 2026

This documents the management rework shipped after the CEO rejected the Phase 1
vertical slice ("way too easy, no management feel, nothing happening between
games" — PRD §8 decision 7). It covers the week-by-week calendar and inbox,
player growth, money and transfers, injuries, and the board/difficulty layer.
Code: `src/manager/engine/` — each system is one module; section numbers below
are referenced from the code headers.

## 1. The week-by-week calendar

The season is no longer "tap sim 18 times". Time is a 22-week calendar
(`SeasonState.week`) the player advances one week at a time:

- **Week 0** — pre-season: board objective arrives, pre-season transfer window
  opens, squad review.
- **Weeks 1–18** — one league round per week. A week with a fixture shows
  **Matchday** as the primary action; playing it advances to the next week.
  A week without a decision pending shows **Continue**.
- **Weeks 9–12** — the mid-season transfer window overlaps rounds 9–12.
- **Weeks 19–21** — semi-finals, final, then off-season (progression report,
  contract expiries, rollover).

`advanceWeek` (in `engine/season.ts`) is the single tick: injuries heal one
week, fatigue recovers, morale drifts, AI clubs trade (in windows), incoming
offers roll, inbox items generate. `playMatchday` sims the full round, applies
fatigue/form/injuries to every club, updates board confidence, and runs the
sack check. All of it is deterministic from the career seed.

## 2. The inbox

Everything that happens between fixtures lands in an inbox
(`engine/inbox.ts`, `InboxItem` in `types.ts`). Kinds: `preview` (opposition
analysis before your fixture), `injury` (physio report), `news` (league
round-up: results elsewhere, table movement, AI transfers, milestones),
`offer` (a club bids for your player — **decision**), `contract`
(expiry warning — **decision**: renew/ignore), `unhappy` (game-time or
listing complaints — **decision**), `board` (objective, warnings, praise),
`scout` (signing suggestions targeting your weakest unit), `window`
(window open/close), `job` (offers while unemployed — **decision**).

Decision items carry a `decision` payload and stay pinned until resolved;
resolving them mutates the world through store actions (`resolveOffer`,
`resolveContract`, …). Volume is tuned to **2–5 items between matches**
(verified by the `week` mode of `scripts/mgr-sim.ts`; a full season generates
~55–65 items). Duplicate suppression: scout notes don't repeat within 5 weeks;
news digests are one item per round, not one per result.

**Lifecycle (added after the CEO's week-4 playtest, July 2026).** The inbox
self-cleans instead of accumulating all season:

- **Dismiss** — any non-decision item can be deleted: swipe it away (mobile)
  or tap the × control. Store action `dismissMail`.
- **Clear read** — one tap in the inbox header deletes every read item.
  Store action `clearReadMail`.
- **Auto-archive** — the weekly tick (`archiveOldMail`, `engine/inbox.ts`)
  deletes informational and resolved mail older than 4 weeks
  (`ARCHIVE_AFTER_WEEKS`), so a mid-season inbox sits at ~10–15 rows instead
  of the ~60 it previously reached (audit: `mgr-sim.ts inbox-size`).
- **Pinned decisions** — an item with an unresolved decision can never be
  dismissed, cleared, or archived (`isPinned`). Offers still lapse on their
  own expiry timer; nothing else disappears until the player deals with it.

## 3. Player growth (`engine/growth.ts`)

Every player has a hidden **potential** ceiling, seeded deterministically from
age + current ovr with editorial variance; ~1 in 12 under-23s gets a +6..+10
"gem" bump. The UI shows scout-style ranges (e.g. 78–84) whose spread shrinks
with age (±4 at ≤20, exact from 27, since potential = current for peaked
players).

End-of-season progression per player: `delta = ageCurve(age) ×
minutesFactor(minutes) + noise`, capped by potential. The age curve grows
players hard to 23, gently to 29, and declines from 30 (−3/season at 34+).
Minutes matter: a bench-warming youngster grows at 45% speed; ~900 minutes
(11 full games) gives full effect — loaning out fringe kids is the counter.
Rollover also runs **retirements** (probabilistic from 32, near-certain by 37)
and **youth intake** (3 academy graduates per club, ages 18–20, ovr 56–66,
real headroom). The user gets a season progression report (who grew, who
declined, who retired, who came through).

Verified drift (5 simmed seasons, `mgr-sim.ts drift`): league top-23 average
stays flat (78.4 → 77.9) while the total pool average drifts down slightly
because intake adds raw youngsters — intended. Unsigned free agents mostly
leave the league at rollover so the world doesn't bloat.

## 4. Money (`engine/finance.ts`)

One transfer kitty per club per season (PRD §3), seeded by stature
(£0.4m–£2.4m), plus a league-wide **wage cap** of £6.4m mirroring the real
Premiership. At career start every club's bill is normalised to 76–88% of the
cap (stronger squads run closer), so everyone can do some business. Valuation
is a convex function of ovr with age and potential multipliers — peak-age
stars cost millions, veterans go cheap, listed players go at a discount,
first-choice players cost a 30% premium.

## 5. Transfers, contracts & loans (`engine/transfers.ts`)

- **Windows:** pre-season (weeks 0) and mid-season (weeks 9–12).
- **Buying:** search/filter the whole league in the Market tab; bids are
  evaluated against asking price with a haggle band (a near-miss gets a
  counter-offer); fees come out of the kitty, wages must fit the cap.
- **Selling:** AI clubs roll believable offers for your players (stars attract
  bids). Accepting a first-choice player's sale dents board confidence and
  morale of his mates; rejecting may unsettle the player (unhappy mail).
- **Loans:** loan out fringe under-24s for a season of minutes (they grow at
  the host club); loan in with a 50% wage share.
- **Contracts:** expiry warnings arrive in the inbox from mid-season; ignored
  expiries walk for free at rollover. Renewal demands are fair wage bumped by
  leverage.
- **AI-to-AI trade:** during windows AI clubs buy squad upgrades from each
  other (cash-weighted buyers with cap room, sellers protected from gutting a
  position). Moves are reported in league news. Smoke-tested at ~0.7
  moves/club-week in windows.

## 6. Board, sackings & difficulty (`engine/board.ts`, tuning in `tactics.ts` / `simFixture.ts`)

Objectives scale with stature: title challenge (top-2 clubs) down to "stay
competitive" (bottom club). Confidence (0–100, start 55) updates weekly:
slow pressure from table position vs objective, fast pressure from results;
graded gently before round 6. Confidence ≤5 after round 6 = sacked mid-season;
badly missed objective + low confidence = sacked at season's end. Sacked
managers get 2–3 offers from lesser clubs and an unemployment state.

Difficulty diagnosis of the old slice: passive play with the best squad won
the title 72% of the time (84% win rate) because match outcomes were nearly
deterministic in squad strength and nothing punished non-management. Fixes:

- **Day-form noise** (`DAY_FORM_SD = 2.2` ovr points per side per match) in
  `simFixture` — the biggest single lever; creates upsets and compresses gaps.
- **Steeper fatigue penalty** + match injuries: depth and rotation now decide
  runs of games, and the AI rotates too (persistent weekly selections, tired
  players rested) so it no longer bleeds cohesion the player kept for free.

Post-rework passive baselines (150 seasons/club, `mgr-sim.ts difficulty`):

| Club (squad rank) | avg pos | top-4 | title | win rate | sacked |
|---|---|---|---|---|---|
| Bath (1) | 2.3 | 87% | 30% | 71% | 5% |
| Sale (~4) | 5.4 | 41% | 3% | 48% | 2% |
| Gloucester (~8) | 8.4 | 3% | 0% | 27% | 1% |
| Newcastle (10) | 10.0 | 0% | 0% | 5% | 0% |

Passive win rate now tracks squad rank; a mid-table top-4 finish is a real
achievement (41% passive → skill in rotation, tactics fit, and market moves
is the difference). The pre-rework numbers are preserved in
`scripts/mgr-baseline.ts`.

**Injury tuning (CEO playtest, July 2026).** Audited with
`scripts/mgr-sim.ts injuries` (20 two-league seasons, ~9,800 club-matches).
Before: 0.74 new injuries per club per match, P(2+ in one match) 16.5%, mean
layoff 2.9 weeks — matches read like casualty lists while the treatment room
stayed shallow. Retuned to *fewer but longer* (`engine/injuries.ts`: base
rates 0.032/0.014 → 0.022/0.010 per starter/bench player, severity bands
stretched to 1–10 weeks): now **0.50 per club per match**, P(0) 60% / P(1)
31% / **P(2+) 9.1%**, mean layoff 4.6 weeks, mid-season squads carrying 1.8
injured on average (2+ for just over half of squads). Week 1 is the *safest*
week (0.38 vs ~0.55 mid-season) because everyone starts fresh — risk rises
with fatigue, so rotation keeps its teeth. The CEO's two injuries in game 1
was plain bad luck (~7% chance per match at week-1 rates).

## 7. Save format & UI identity

Saves are **v2**: the whole world (every player's contract, potential, morale,
injury, stats; every club's cash, plan, and persistent selection) lives inside
the career object. Old slice saves are discarded (pre-release, CEO-only
testing). The UI drops the draft game's look for a dark, card-based,
FIFA-manager-mode identity: club-colour accenting from club hex colours,
bottom tab navigation with unread badges, primary action fixed in the thumb
zone, all CSS (no new dependencies), scoped under `.mgr` so the draft game is
untouched.

**The Home hub (CEO playtest, July 2026).** The default in-game screen is a
FIFA-style **Home** tab (`ui/HubScreen.tsx`), not the inbox — "what do I do
next" is always one glance away. It surfaces: the next fixture on a
competition-themed card with the primary action (Matchday / Continue) in the
thumb zone, the per-match emphasis dial on matchdays, league position + last
result in the club banner, pending decisions as amber cards that deep-link
into the opened mail (`inbox?open=<id>`), unread mail count, a treatment-room
summary, the transfer window while open, and a Club & board row. In-game tab
bar: **Home / Inbox / Squad / Tactics / Season** — Club moved off the bar
(reachable from Home), and the Season tab keeps the detail: fixtures &
results round by round plus the full standings and shield races. Every
post-match / post-decision flow (report, team sheet, new season, new job)
lands back on Home.
