# XV Manager — Product Requirements Document

**Status:** Approved — CEO decisions recorded in §8 · **Owner:** Product · **Date:** July 2026

**Brand (decided):** ships as **XV Manager** on the same site as the existing XV draft game, which acts as the acquisition funnel.

---

## 1. Vision & positioning

A pick-up-and-play rugby management game for the web: choose a real-world club in one of the world's top leagues, build your squad through transfers and scouting, set your game plan, and sim your way through full seasons chasing real trophies — with every match resolved in seconds, never played live. It is *FIFA career mode meets Football Manager, with FIFA manager mode's simplicity*: the depth lives in squad-building and season-long consequences, not in menus. Nobody has built this for rugby. Football Manager owns hardcore football management on desktop; rugby fans have nothing credible on mobile web. We win by being the game a rugby fan can play on the bus — one season in a week of commutes, one decision per screen, and a trophy cabinet that makes them start season two.

## 2. Target player & core loop

**Target player:** the rugby fan aged 18–45 who watches Premiership/URC/Top 14/Super Rugby weekends, has played FIFA career mode or Football Manager at some point, but doesn't have 40 hours for an FM save. Plays on their phone in 5–15 minute sessions. Secondary: lapsed FM players who want the fantasy without the spreadsheet.

**The season loop** (one full cycle ≈ 2–4 hours of play, split across many short sessions):

1. **Pre-season** — accept a job (or continue at your club), review the squad, set your default XV and game plan, get a board objective ("top 4", "avoid relegation", "win the title").
2. **Matchday sims** — for each fixture: see the opponent, tweak your lineup (rotate for fatigue, cover injuries), pick a tactical emphasis, hit **Sim**. Get a match report in ~10 seconds: score, timeline, ratings, man of the match. A matchday is a 2–3 minute session; a run of matchdays is a natural longer session.
3. **Transfer windows** — mid-season and off-season: sign players within budget, sell or release, renew expiring contracts. This is the strategic heart between matchdays.
4. **Season end** — final table, playoff/final if qualified, season review (top scorer, signings verdict, objective met or missed).
5. **Trophies & job offers** — silverware goes into a permanent trophy cabinet; success attracts offers from bigger clubs (and, later, national teams); failure risks the sack. Then the next season rolls around.

The compulsion loop is "one more matchday"; the retention loop is "one more season"; the endgame is climbing from a mid-table URC job to winning the World Cup with your country.

## 3. MVP feature set

Ruthless scoping. MVP is defined as: **a player can pick a club in any of the four launch leagues, play at least three consecutive seasons with transfers between them, and fill a trophy cabinet.**

### IN for MVP

| Feature | MVP shape |
|---|---|
| **League choice** | All four launch leagues (see §4), pick any club. League difficulty is the natural difficulty selector — no separate difficulty setting. |
| **Season sim** | Full home/away fixture list, live league table, rugby bonus points, playoffs/finals per league's real format. |
| **Squad management** | Squad of ~35, matchday 23 (XV + 8 bench), fatigue and light injuries so rotation actually matters, per-player form. |
| **Tactics** | One decision, not twenty: a team game plan (Forwards First / Balanced / Expansive) plus a per-match emphasis. Feeds the existing facet-based sim. No set-piece routines, no sliders. Depth of *consequence* comes from two mechanics (CEO decision 5): **squad fit** — a game plan only performs if the squad's relevant units support it — and **continuity** — a settled XV earns a cohesion bonus, heavy rotation or new signings temporarily reduce it. Full formulas, caps, and sim wiring: [DESIGN-tactics.md](./DESIGN-tactics.md). |
| **Season rhythm & inbox** *(added by decision 7)* | The season is a week-by-week calendar, not a row of sim buttons. Between fixtures, events arrive in an inbox: match previews, injury reports, transfer offers, scout notes, board messages, league news, contract warnings, player unhappiness. Some items demand decisions (accept/reject an offer, renew a contract). 2–5 meaningful items between matches. Design: [DESIGN-management.md](./DESIGN-management.md) §1–2. |
| **Transfers, contracts & loans** | Two windows per season (pre-season + mid-season). Sign, sell, release, **loan in/out** (decision 7 pulled loans forward from post-MVP). Contracts = wage + years, one budget number per club plus a league wage cap. AI clubs make believable moves, including trading among themselves (reported in league news). No agents, no negotiation mini-game — offers are accept/reject with a small haggle range. |
| **Trophy cabinet** | Permanent, cross-save career record: league titles, playoff trophies, promotions survived, personal milestones (100 wins, unbeaten season). This is the home screen's centerpiece. |
| **Job offers & sackings** | Board confidence meter; miss objectives badly and you're sacked; overperform and rival clubs come calling at season end. Movement between clubs *within* the four leagues. |
| **Player development** | Every player has a potential ceiling (shown as a scout-style range for youngsters); growth = age curve × minutes played, decline from 30, end-of-season progression report. Retirements + youth intake at rollover. No training minigame. Design: [DESIGN-management.md](./DESIGN-management.md) §3. |
| **Injuries** | Match-generated, severity 1–8 weeks with rugby flavour (HIA, front-row injuries); fatigue raises risk, injury list on the squad hub, forced selection changes. |
| **Board & difficulty** | Stature-scaled objectives, weekly confidence, mid-season and end-of-season sackings, job offers from lesser clubs, unemployment. Passive-player win rate calibrated to track squad-strength rank. Design: [DESIGN-management.md](./DESIGN-management.md) §6. |
| **Multi-season play** | Squads age, contracts expire, retirements + regen youngsters keep the world alive for 10+ seasons. |

### OUT for MVP (post-MVP, in rough priority order)

1. **Scouting network** — MVP shows full attributes for your own league and fuzzy ranges elsewhere; hiring scouts to sharpen those ranges is the first post-MVP feature (it's the natural money-sink and makes cross-league transfers a skill).
2. **Coach hiring** — assistant/forwards/backs/kicking coaches who buff facets and development. Great flavour (including real-world-inspired names, licensing permitting), not needed to prove the loop.
3. **Cross-league club competitions** — Champions Cup / Challenge Cup (see §4).
4. **International management** — the aspirational endgame job (see §4).
5. **Japan Rugby League One & Major League Rugby** (see §4).
6. Academies/youth *development choices* (automatic intake is in), press conferences, stadium/finances beyond one budget number, editable in-game database editor UI (the data format supports it from day one; the editing UI ships later). ~~Loans~~, ~~board requests~~, ~~player morale~~ — **pulled into scope by decision 7.**

**Rule of thumb applied throughout:** if a feature doesn't change a decision the player makes on a phone in under 30 seconds, it's out of MVP.

## 4. League & competition coverage

**MVP: the four confirmed leagues, domestic play only.**

| Competition | Recommendation | Reasoning |
|---|---|---|
| English Premiership | **MVP — SHIPPED** | Biggest anglophone club audience; 10 teams = smallest data burden; playoff drama. |
| URC | **MVP — SHIPPED (July 2026, current build)** | Four nations of fans in one league; 16 teams; the shield sub-races give extra objectives cheaply. Live with the real format: 18 rounds (derby + cross-pool), top-8 playoffs, home finals at the higher seed, all four regional Shields as cabinet honours. Simulates concurrently with the Premiership in one shared world — cross-league transfers and job moves included (decision 8). |
| Top 14 | **MVP** | The richest league — its big budgets make it the "galactico" destination that powers the transfer fantasy. 14 teams + relegation stakes. |
| Super Rugby Pacific | **MVP** | Southern-hemisphere audience and the All Black/Wallaby star names players expect. 11 teams. |
| Japan Rugby League One | **Post-MVP** | Real and growing, but smaller anglophone audience and a promotion/relegation divisional structure that's extra sim work. Add it as the "big-money late-career move" league in the same release as scouting — that's when a fourth-plus league is strategically interesting rather than just more content. |
| Major League Rugby | **Post-MVP** | Weakest squads and most volatile real-world league (franchises fold). Better as a "start from the bottom" challenge league later than as MVP content we must maintain. |
| Champions Cup / Challenge Cup | **Post-MVP, first major update** | High value — midweek European nights are the best "one more matchday" fuel — but they require cross-league scheduling, qualification rules, and a knockout bracket on top of the domestic calendar. Ship domestic first, prove the loop, then add Europe as the headline of update #1. (Super Rugby sides get an invitational "Champions Series" equivalent so no league is left out.) |
| International layer (Six Nations, Rugby Championship, World Cup) | **Post-MVP, the endgame arc** | This is the game's north star — "win the URC, get the Ireland job, win the World Cup" — and it should be marketed from day one. But it's a second game mode (squad selection from clubs you don't control, tournament cycles, no transfers) and must not delay proving the club loop. Target: the third major release. |

**Squad data burden check:** four leagues ≈ 51 clubs × ~35 players ≈ **1,800 players**. With real names (§5) this is a research-and-curation job — one overall rating plus optional signature overrides per player, refreshed annually (decision 6) — and it's the reason to hold JRLO/MLR: each extra league is another ~400–800 real players to research, rate, and keep current.

## 5. Data & licensing

**Decided (CEO decision 1): the game uses real league names, real club names, and real player names**, clearly branded as a **free, unofficial, fan-made game** (same disclaimer posture as the existing XV draft game). Real names are the launch sizzle: a rugby fan picks *their* club and coaches *those* players from day one.

Two guardrails we keep regardless:

- **If the game ever commercializes, licensing must be revisited before any money changes hands.** Monetizing real names, marks, or likenesses without licenses is not on the table (see §8, decision 3).
- **Saves reference stable IDs, never names.** Every display name lives in one editable data layer over a permanent ID, so a rename — voluntary or compelled — is a data-file change that leaves every save, trophy, and history record intact. This keeps the takedown worst case an inconvenience, not an existential rewrite, and later enables community name/edit packs for free.

Real league *structures* (team counts, bonus points, playoff formats) and an annual **world refresh** each real season (CEO decision 6) keep the world credible year over year.

## 6. Mobile-first UX principles

Mobile-friendly is not a checkbox; it's the product. Principles, in priority order:

1. **One screen per decision.** Pick lineup → screen. Choose emphasis → screen. Sim → report. Never a dashboard with six panels. Desktop gets the same screens, just wider.
2. **Thumb-reachable primary action.** The one button that advances the game (Sim, Confirm XV, Sign) is fixed in the bottom thumb zone on every screen. Destructive/rare actions live at the top.
3. **Session-length targets:** one matchday ≤ 3 minutes; a transfer-window session ≤ 10 minutes; a full season completable in ≈ 2–4 hours total. Every screen must be abandonable mid-flow with zero lost progress (auto-save after every decision).
4. **Sensible defaults everywhere.** Auto-pick XV (reusing the existing autodraft logic), suggested lineup rotation, one-tap "accept suggested". The player who only ever taps Sim still has fun; the player who overrides everything gets rewarded.
5. **Sim speed is sacred.** Match resolution under 1 second of compute; the report animation is skippable. Nothing ever spins.
6. **Portrait-first, offline-tolerant.** Full playability in portrait on a mid-range phone, and — because saves are local-first — playable on the underground with no signal.

## 7. Success metrics

| Stage | Metric | Target |
|---|---|---|
| **Activation** | New player picks a club and sims 3 matchdays in their first session | ≥ 60% |
| **Core engagement** | Matchdays simmed per active player per week | ≥ 10 |
| **Season-1 completion** | Players who start a career and finish season 1 | ≥ 35% |
| **Retention** | D7 retention of activated players | ≥ 25% |
| | Players starting season 2 within 7 days of finishing season 1 | ≥ 60% |
| **Habit** | Sessions per week per retained player | ≥ 4 |
| **Trophy pull** | Retained players with ≥ 1 item in the trophy cabinet by day 14 | ≥ 50% |

The existing first-party analytics pipeline (localStorage mirror + Postgres sink) already supports all of these with new event names; no new analytics infrastructure needed.

## 8. Decisions log (CEO, July 2026)

All six open decisions are resolved. These override anything contrary elsewhere in this document.

1. **Licensing — real names.** Real club names, real league names, real player names; branded as a free fan-made game. If the game commercializes, licensing must be revisited first. Saves reference stable IDs so a rename remains possible at any time (§5).
2. **Brand — "XV Manager", same site.** Ships alongside the existing XV draft game; the draft game is the acquisition funnel.
3. **Monetization — none for now; the game is free.** Future candidates (undecided): cosmetic/content purchases — legends drafts, vintage kits, one-off tournaments — or a one-time unlock. Any monetization of real names would require licensing first. Architecture must not block adding accounts/payments later (local-first saves with an export format that can become a sync payload), but **nothing is built for it now**.
4. **Internationals — confirmed as release 3.** Not squeezed into MVP (§4).
5. **Tactics — simple ceiling approved, with depth of consequence.** One team game plan + per-match emphasis stands, extended with FIFA-manager-mode-style consequences: **game-plan/squad fit** (a plan is only effective if the squad's relevant ratings support it — a forward-dominated plan with a 70-rated pack must underperform Balanced) and **continuity** (a settled XV earns a cohesion bonus; heavy rotation or many new signings temporarily reduce it). Concrete design: [DESIGN-tactics.md](./DESIGN-tactics.md).
6. **Data refresh — annual world refresh confirmed**, shipped each real season as a marketing beat.
7. **Management rework (CEO, after playing the Phase 1 slice).** The slice was rejected as shipped: *"way too easy, has absolutely no management feel to it whatsoever"*; *"no player growth engines (ages, squad hubs, contracts, potential ratings, loans, transfers — nothing)"*; *"doesn't feel like I'm progressing through my season… we need real things happening in between games: news, emails, tactics, injuries, transfer offers"*; and the game must have its own identity, *not* the draft game's design. This **overrides the post-MVP deferrals above where they conflict**: loans, morale/unhappiness, board messaging, injuries, and a week-by-week inbox-driven season all moved into scope immediately; difficulty was recalibrated so a passive player's finish tracks squad-strength rank; the UI was restyled to a distinct FIFA-manager-mode identity (dark, card-based, club-colour accents, bottom tabs). Old slice saves were discarded (pre-release only). Full design: [DESIGN-management.md](./DESIGN-management.md).
8. **URC in the current build + cross-league world (July 2026).** The URC ships now (not in Phase 3): career start is league → club across all 26 clubs, both leagues sim concurrently every week at full player level, the transfer market spans both leagues (AI cross-league moves are deliberately rarer than intra-league), and job offers/sackings move managers between leagues — overperform in the URC and a Prem club comes calling. URC club budgets/wage ceilings are stature-seeded (no single URC cap exists in reality); the Prem keeps its uniform cap. The trophy cabinet and career history distinguish competitions (Prem title vs URC title vs the four Shields). Save format bumped to v3; older saves are discarded behind a clean fresh-career prompt (pre-release only, the cabinet survives).
9. **Rebrand — "midnight broadcast" identity (CEO, July 2026).** The CEO rejected the green-and-gold palette inherited from the draft game: XV Manager must feel like its own product. New base identity: near-black charcoal surfaces with an iris-violet brand accent, dark/premium broadcast feel. Only `#/manager` changes; the draft game keeps its old look. Layered on top: **per-competition theming** (inspired by FIFA manager mode's competition backgrounds) — every competition has its own accent and background treatment (Premiership: floodlit crimson; URC: aurora teal) applied to matchday, report, table, playoff and trophy surfaces, structured as a competition-theme map (`src/manager/ui/theme.ts`) so future competitions (Champions Cup, Top 14, internationals) slot in trivially. Club colours remain a third layer for the player's own club chrome.
10. **IA — the manager landing is the site's home page (CEO, July 2026).** The "← Back to XV, the draft game" link is gone: the manager landing is a self-contained home, and the site root (`/`) now lands on it. The draft game remains fully playable at `#/draft`, reached through a single deliberate affordance — a quiet corner "XV" mark on each product's landing screen that opens an ecosystem menu (Manager / Daily Draft / room to grow). The draft-game footer's "Try XV Manager" link was removed in favour of the same menu, so there is one cross-navigation pattern site-wide. Navigation chrome appears on landing screens only, never on in-game screens (the bottom tab bar keeps its focus). Share/challenge links (`?c` / `?m` / `?mr` / `?x` on the bare root) still open the draft game directly, so no existing link breaks; this supersedes the "draft game as the front-door acquisition funnel" framing in decision 2 — acquisition now flows through the shared home.
11. **In-game IA — the default in-game screen is the Home hub (CEO playtest, week 4 of a URC career, July 2026).** Landing in the Inbox hid "continue to the next game" under the Season tab. The in-game tab bar is now **Home / Inbox / Squad / Tactics / Season**, with a FIFA-manager-mode Home hub as the default screen: next fixture + primary action in the thumb zone, league position and last result, pending decisions as actionable cards, unread mail, treatment room, and window status (Club moved off the bar, reachable from Home; the Season tab keeps table/fixtures detail). From the same playtest: the inbox gained per-item dismiss (swipe or ×), "Clear read", and 4-week auto-archive of informational mail — open decisions stay pinned and cannot be deleted; and match-injury frequency was retuned to fewer-but-longer knocks (~0.5 per club per match, two-plus in one match under 10%, layoffs averaging ~4.5 weeks). Design: [DESIGN-management.md](./DESIGN-management.md) §2, §6, §7.
