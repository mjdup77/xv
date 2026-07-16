# XV Manager — Technical Scoping

**Audience:** engineering · **Companion docs:** [PRD.md](./PRD.md) · [DESIGN-tactics.md](./DESIGN-tactics.md) · **Date:** July 2026

> **Decisions update (July 2026):** all six open product decisions are resolved — see the Decisions log in [PRD §8](./PRD.md). The scoping-relevant ones: **real club/league/player names** (data is researched real squads, not procedural generation; saves keep stable IDs so renames stay possible), brand is **XV Manager on this site/repo**, **no monetization work** (local-first only; export format doubles as a future sync payload), internationals stay release 3, tactics gains the **squad-fit + continuity** mechanics specced in DESIGN-tactics.md (both are flat power modifiers inside `simFixture` — no `src/engine/` changes), and an **annual world refresh** each real season (a data-file drop, enabled by stable IDs).

---

## 1. Audit: what's reusable from the xv codebase

Verdict up front: **the hard, risky part — a fun, fast, deterministic match sim — already exists and is genuinely reusable.** What doesn't exist is everything *around* a match: leagues, calendars, persistent players, money. That's a lot of new code, but it's ordinary CRUD-and-state code, not game-feel code.

### `src/engine/sim.ts` (769 lines) — the core asset

Two sim entry points, with very different reuse value:

- **`simulate(lineup, seed)`** — the World Cup gauntlet. **Not reusable for league play.** The opponent is not a team; it's a scalar (`rating` + `swing`) drawn from a hardcoded 7-round `ROUNDS` table, and the narrative layer (verdicts, "Perfect 35", advice) is World-Cup-specific. Leave it alone; it keeps powering the existing game.
- **`simH2H(homeLineup, awayLineup, labels, seed)`** — two real lineups, symmetric, facet-driven. **This is the manager game's match engine, ~80% of the way there.** It already produces: try counts from attack-vs-defence differentials, kicking percentages from a `goalKick` facet, penalty counts from discipline, drop goals, a minute-by-minute timeline with named try-scorers and kickers, MOTM, and a headline. It resolves in microseconds — simming a full 51-club, 4-league season of ~600 fixtures is trivially fast, so "sim the whole round while the player watches their own report" costs nothing.

What `simH2H` needs for league play (all additive, none structural):

| Need | Change | Size |
|---|---|---|
| Home advantage | A flat bump to the home side's effective facets (rugby home advantage is large and real; ~+2 facet points reproduces realistic home-win rates). One parameter. | Trivial |
| Draws | `simH2H` currently forces golden-point resolution (line ~620). League matches must be allowed to draw; make sudden-death a flag (leagues off, knockouts on). | Trivial |
| Form | A per-club rolling modifier (e.g. ±3 facet points from last 5 results) applied before `powers()`. | Small |
| Fatigue / rotation | Per-player fatigue accumulates with minutes, reduces effective `ovr` fed into `computeFacets`. This is what makes squad depth and rotation *matter* — it's a player-level input, so no sim changes at all, just a pre-processing step on the lineup. | Small |
| League match points | `matchPoints()` (4/2/1/losing-BP/try-BP) already implements rugby league scoring — currently buried in the WC path; export it. | Trivial |
| Bench / 23s | The sim consumes a 15-slot `Lineup`. MVP answer: bench quality contributes a small late-game swing term rather than modelling substitutions. Honest and cheap. | Small |

**Recommendation:** don't fork `simH2H` — extract its guts into a parameterised `simFixture(home, away, opts)` in a new `src/manager/engine/` module, calling the same `computeFacets`/`powers` math. The existing game keeps its wrappers untouched (important given the uncommitted changes in the repo).

### `src/engine/ratings.ts` — reusable as-is

`getAttrs` (per-role attribute shapes + per-player overrides) and `computeFacets` (position-weighted set-piece/breakdown/defence/attack/control facets from a 15-slot lineup) are exactly the right model for club rugby too. No changes needed; club players get researched `ovr` + `overrides` in the same shape as the hand-curated WC ones. This file is why the data burden in the PRD is tractable: one number per player plus optional signature overrides yields a full attribute sheet.

### `src/engine/rng.ts` — reusable as-is

Seeded mulberry32 with normal/pick/shuffle. Deterministic sims from a seed means replayable matches, cheap save files (store seeds, not timelines), and testable season sims. Use everywhere.

### `src/engine/autodraft.ts` + `draft.ts` — reusable with minor generalisation

The most-constrained-slot-first lineup filler is precisely what's needed to (a) pick every AI club's matchday XV each round and (b) power the player-facing "Suggest XV" button. It currently reads from the global WC `SQUADS` pool; generalise it to take a player pool as an argument. `eligibleSlots` / `moveTargets` / `applyMove` transfer directly to the manager's team-sheet screen.

### `src/career.ts` — pattern reusable, content not

A 100-line localStorage stat counter for the draft game. The *pattern* (first-party, no-account, local trophy cabinet with "chips" for the home screen) is exactly the PRD's trophy cabinet, but manager careers need structured storage (see §2). Treat it as a design reference, not shared code.

### Components — adaptable

`MatchPlayback.tsx` / `SimPlayback.tsx` / `MatchReport.tsx` render an `H2HResult` timeline as an animated score reel with report card. The manager game's post-sim report is the same artifact with league context (table movement, bonus points) added. Budget for a rework rather than a drop-in — they're coupled to the draft game's phase state in `App.tsx` — but the animation and layout logic carries over. `Pitch.tsx` (slot layout) and `StrengthPanel.tsx` (facet display) are directly reusable for team selection.

### `src/analytics.ts` — reusable as-is

Vendor-neutral event pipeline (localStorage mirror + `/api/track` → Postgres). New event names, zero new infrastructure. All PRD metrics are implementable on day one.

### `src/data/` — format reusable, content not

The `squad()` authoring helper and `PDef` shape (name/role/ovr/alt/overrides) is the right authoring format for club squads too. WC squad *content* stays with the old game. New (per the real-names decision): researched real squad data files under `src/data/manager/` — ~1,800 real players across four leagues at full scope, one `ovr` plus optional signature overrides each, refreshed annually.

### Not reusable / must be built new

League scheduler (double round-robin + playoff brackets), league table, season calendar, persistent world state (players age, contracts tick), transfer market AI, finances, job market, and the entire manager UI shell. This is the bulk of the work — but it's deterministic, testable, plain-TypeScript domain logic.

## 2. Proposed architecture

### Persistence: local-first IndexedDB. No backend for MVP.

- A full world save (1,800 players, 51 clubs, fixtures, history) serialises to roughly 1–2 MB of JSON. localStorage's ~5 MB budget technically fits one save but leaves no headroom for multiple careers or season history. **Use IndexedDB** (via the tiny `idb` wrapper, ~1 kB) with one object store for save slots and one for the cross-save trophy cabinet. Keep localStorage only for the trophy-cabinet *summary* so the home screen renders instantly.
- Auto-save after every committed decision (lineup confirmed, transfer signed, matchday simmed). Saves are versioned (`saveVersion` field + migration functions) from day one — multi-season games punish you brutally for skipping this.
- Export/import save as a JSON file download — free cloud-save substitute, free bug-report attachment, free device migration.
- **`@vercel/postgres` stays analytics-only.** No accounts, no server game state in MVP. If cloud saves come later (a monetization decision per the PRD), the export format becomes the sync payload — the local-first design doesn't paint us into a corner.

### Routing

The existing game is a phase state machine inside a 1,300-line `App.tsx` with no router. Do not extend that. The manager mode needs URL-addressable screens (mobile back-button behaviour, refresh-safety, deep links to a match report). **Add `react-router` with a `/manager/*` route subtree**; the existing game stays mounted at `/` untouched. Screens: `/manager` (career home / cabinet), `/manager/squad`, `/manager/matchday`, `/manager/table`, `/manager/transfers`, `/manager/report/:fixtureId`.

### State management

**Zustand** (small, no boilerplate, plays well with React 19) with two stores:

- `worldStore` — the loaded save: world state + derived selectors (table, next fixture, squad). All mutations go through named actions (`simMatchday()`, `signPlayer()`) that also fire analytics and trigger the IndexedDB write.
- `uiStore` — ephemeral screen state, never persisted.

Critically, the **domain logic lives in plain TypeScript modules** (`src/manager/engine/`, `src/manager/world/`), pure functions of `(state, action, seed) → state`. Zustand is just the binding layer. This keeps the season simulation unit-testable without React and leaves the door open to running "sim to end of season" in a web worker if it ever feels slow (it won't at MVP scale).

## 3. Data model sketch

```ts
// Static-ish world data (regenerated each "world refresh", referenced by id)
interface Competition {
  id: string;                       // "prem", "urc", "top14", "srp", later "eu-champ"
  name: string;
  format: LeagueFormat;             // teams, rounds, playoff structure, BP rules
  clubIds: string[];
}

interface Club {
  id: string;
  name: string; shortName: string; city: string;
  colors: [string, string];
  competitionId: string;
  budget: number;                   // single wage-budget number (PRD §3)
  prestige: number;                 // 1–100; drives job offers & AI transfer pull
}

interface Player {
  id: string;
  name: string;                     // display name — editable layer, ids are stable
  nation: string;
  age: number;
  role: Role; alt?: Role[];         // reuses existing Role from src/types.ts
  ovr: number;
  potential: number;                // ceiling for the age curve
  overrides?: Partial<Record<Attr, number>>;
  clubId: string | null;
  form: number;                     // rolling, -5..+5
  fatigue: number;                  // 0..100
  injury?: { weeksRemaining: number };
}

interface Contract {
  playerId: string; clubId: string;
  wage: number;                     // per-season, counts against Club.budget
  seasonsRemaining: number;
}

// Per-season state
interface Season {
  id: string;                       // "2026-prem"
  competitionId: string;
  year: number;
  fixtures: Fixture[];
  table: TableRow[];                // derived, but cached per round
  phase: "preseason" | "regular" | "playoffs" | "complete";
}

interface Fixture {
  id: string;
  round: number;
  homeClubId: string; awayClubId: string;
  seed: string;                     // determinism: report replayable from seed
  result?: FixtureResult;           // scoreline, BPs, scorers, motm (subset of H2HResult)
}

interface TrophyCabinet {           // cross-save, survives careers
  entries: { trophyId: string; competitionId: string; clubId: string; year: number }[];
  milestones: { id: string; achievedAt: string }[];  // "100 wins", "unbeaten season"
}

interface ManagerCareer {           // one save slot
  saveVersion: number;
  managerName: string;
  currentClubId: string;
  boardConfidence: number;          // 0..100; sack threshold + job-offer trigger
  history: { year: number; clubId: string; leaguePos: number; trophies: string[] }[];
  world: { players; clubs; contracts; seasons; year };   // the full mutable world
  rngSeed: string;                  // master seed; per-fixture seeds derive from it
}
```

Notes: contracts are separate from players so free agency falls out naturally; fixtures store seeds so match reports replay without storing timelines; every name is display-only over a stable id — with real names (PRD §8 decision 1) this is the escape valve that keeps a forced or voluntary rename a data-file change rather than a save-breaking migration, and it powers the annual world refresh. Tactics state (game plan, per-match emphasis) and per-player continuity tracking (`recentStarts` window) live alongside this model — see DESIGN-tactics.md.

## 4. Same repo or separate app?

**Recommendation: this repo, as a new mode.** Reasoning:

- The shared assets are the point — sim math, ratings, RNG, autodraft, analytics, the visual language. A separate repo means extracting a shared package now, which is premature process for a team this size.
- One deploy, one domain: the existing draft game is the acquisition funnel for the manager game (PRD §8.2), and cross-linking is trivial when they're one app.
- Vite code-splitting on the `/manager` route keeps the existing game's bundle unaffected.

Two hard rules to make cohabitation safe: **(1)** all new code lives under `src/manager/` — the only touch to existing files is adding the router and a home-screen link, done as its own small change once the current uncommitted work lands; **(2)** the manager engine imports from `src/engine/` but never modifies it — where behaviour must differ (draws, home advantage), the manager module wraps or re-implements, it does not edit. Revisit extraction to a package only if a native/mobile wrapper ever becomes real.

## 5. Phased delivery plan

Estimates assume ~1 experienced full-stack engineer full-time (add ~30% if part-time context-switching). "Week" = focused engineer-week.

### Phase 1 — Playable vertical slice (4–5 weeks)
Pick any real Premiership club → sim a full home/away season with table, bonus points, playoffs → win or lose the title → trophy in the cabinet → start season 2 (same squad, no transfers, players age).
- Real 2025-26 Premiership world (10 clubs, ~350 real players, researched ratings) as data files under `src/data/manager/`
- `simFixture` extraction (home advantage, draws, form, fatigue), scheduler, table
- Game plan + per-match emphasis with the **squad-fit and continuity mechanics** (DESIGN-tactics.md) wired into `simFixture`
- Matchday flow: team sheet (matchday 23, reusing autodraft logic) → sim → report (reworked MatchReport)
- Local-first saves (localStorage is sufficient at single-league scale; move to IndexedDB when the four-league world lands), router shell, trophy cabinet v0, analytics events
- **Exit test:** a rugby fan plays a full season on a phone and immediately starts season 2.

### Phase 2 — Transfers, contracts, squads that matter (4–6 weeks) — **SHIPPED early, expanded (PRD §8 decision 7)**
- Contracts, wages, one budget number + league wage cap; two transfer windows; AI club transfer behaviour (including AI-to-AI trades) ✓
- Fatigue + injuries + rotation pressure; player development age curve **+ potential ceilings, minutes-driven growth**; retirements + youth intake ✓
- Board confidence, sackings, end-of-season job offers (within the league) ✓
- **Beyond the original Phase 2 scope,** pulled in by the CEO's rejection of the slice: week-by-week calendar with an inbox (news/emails/decisions), loans, player morale/unhappiness, difficulty recalibration, and a distinct FIFA-manager-mode visual identity. Save format is v2 (whole world persisted in the career); slice saves discarded. Design: [DESIGN-management.md](./DESIGN-management.md). Verification harness: `scripts/mgr-sim.ts` (difficulty / drift / week-trace modes) + `scripts/mgr-smoke.ts` (transfer/loan/sack/rollover flows).
- **Exit test:** season 3 squad looks meaningfully different from season 1 because of *your* decisions. ✓ (verified via 5-season drift sim)

### Phase 3 — Four leagues + cross-league careers + scouting (5–6 weeks) — **URC HALF SHIPPED EARLY (July 2026)**
- ~~URC~~ ✓ **URC is IN the current build**: 16 real clubs / 665 researched players wired into the unified type layer (`ClubId = PremClubId | URCClubId`, data-driven `CompetitionDef` per league — rounds, bonus rules, playoff shape, final hosting, shields). Real format: 18 rounds (double round-robin derbies + cross-pool), top-8 playoffs at the higher seed throughout, four regional Shields as cabinet honours. Top 14 and Super Rugby Pacific remain here (~800 more researched players); each is now a new `CompetitionDef` entry + data files, not new engine code.
- ~~Cross-league job market and transfers~~ ✓ shipped with the URC: both leagues sim concurrently at full player level each week, one cross-league transfer market (AI cross-league moves rarer than intra-league), sackings/job offers/poach approaches move managers between leagues. Career records and the trophy cabinet are per-competition. Save v3; v1/v2 saves discarded behind a clean prompt (pre-release).
- **Visual system shipped alongside:** the July 2026 rebrand (PRD §8 decision 9) — "midnight broadcast" base palette (charcoal + iris-violet brand accent, explicitly NOT the draft game's green/gold) with a **competition-theme map** (`src/manager/ui/theme.ts` `COMP_THEMES` + `[data-comp]` CSS layer): Prem = floodlit crimson, URC = aurora teal, applied to matchday/report/table/playoff/trophy surfaces. Future competitions are one map entry.
- Still here: attribute masking outside your league + scouting v1 (PRD's first post-MVP feature folds in here if MVP ships as Phases 1–2)
- **This is the MVP release** if Phases 1–2 haven't already shipped publicly.
- Verification: `scripts/mgr-smoke.ts` covers the URC career (format shape, shields, cross-league bid + job move); `scripts/mgr-sim.ts difficulty-urc` covers passive-player URC difficulty (Leinster does not walk the league; Zebre is a struggle).

### Phase 4 — European nights + coaches (3–4 weeks)
- Champions Cup / Challenge Cup cross-league scheduling + knockout brackets; Super Rugby invitational equivalent
- Coach hiring (facet buffs + development modifiers)

### Phase 5 — The international arc (6–8 weeks)
- National-team job offers gated on club success; squad selection from the club world
- Six Nations / Rugby Championship annual cycles; World Cup every 4th season (the old game's tournament structure finally gets reused here)
- Trophy cabinet endgame: the World Cup

**Total to MVP (Phases 1–3): ~13–17 engineer-weeks.** The biggest schedule risks are squad-rating believability (real players whose ratings produce realistic tables — budget real tuning time in Phase 1, made cheaper by the deterministic seeded sim) and transfer-AI sanity in Phase 2 (AI clubs doing stupid things is the fastest way to break immersion).
