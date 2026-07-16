# XV Manager — real-world squad data (Gallagher PREM)

Researched squad database for the English Premiership ("Gallagher PREM"),
used by manager mode. One file per club under `clubs/`, registered in
`index.ts`, typed against the contract in `src/manager/types.ts`
(`ClubData` / `PlayerDef`).

## Season snapshot

- **Season:** 2025-26 (the game world's year `2025`).
- **Snapshot date:** 2 July 2026 — just after the 2025-26 Premiership final
  (20 June 2026, Allianz Stadium, Twickenham).
- **Clubs (10):** Bath, Bristol Bears, Exeter Chiefs, Gloucester, Harlequins,
  Leicester Tigers, Newcastle Red Bulls (rebranded from Newcastle Falcons
  after the Red Bull takeover), Northampton Saints, Sale Sharks, Saracens.
- Players are the 2025-26 first-team squads. Where a player moved mid-window,
  the club he actually played 2025-26 for wins (e.g. Josh Hodge is listed at
  Exeter; his Newcastle move is 2026-27). Short-term loans that saw real
  minutes are included (e.g. Hamish Watson at Leicester). Announced 2026-27
  transfers are **not** applied.
- `age` is the player's age at the start of the 2025-26 season (Sep 2025).
  Ages of front-line players are accurate; deep-squad/academy ages may be
  ±1 year.

## League structure (verified for 2025-26)

Encoded in `index.ts` (`PREM`):

- 10 clubs, double round robin — **18 rounds**, 90 regular-season matches.
- League points: **4 win / 2 draw / 0 loss**, plus **1 bonus point for
  scoring 4+ tries** and **1 bonus point for losing by 7 or fewer**.
- **Top-4 playoffs:** semi-finals 1v4 and 2v3 at the higher seed's ground;
  final at Allianz Stadium, Twickenham.
- **No relegation.** The planned play-off vs the Champ winner was cancelled
  mid-season when PREM Rugby moved to a franchise model (RFU Council vote,
  27 Feb 2026). Promotion/relegation is abolished from 2026-27 in favour of
  criteria-based expansion (target: 12 clubs by 2029-30).

## Sources

- Wikipedia: *2025–26 Premiership Rugby* (final table, format, playoff
  structure, relegation cancellation) and each club's current-squad table
  (which cites official club squad announcements); squads that had already
  rolled over to 2026-27 (Northampton, Saracens) were reverse-adjusted using
  *List of 2026–27 Premiership Rugby transfers*.
- Official club sites (squad pages / signing announcements) and BBC Sport /
  Sky Sports / RugbyPass transfer reporting for cross-checks on notable moves
  (Owen Farrell back to Saracens, Henry Arundell to Bath, Louis Rees-Zammit
  to Bristol, Hamish Watson loan, etc.).
- Ratings are **editorial judgment** (see below), informed by the 2025-26
  season: final table, international selection, and player-of-the-month /
  award reporting. They are not sourced numbers.

## Rating calibration

FIFA-style 1-99 `ovr`, same scale as `src/data/squads.ts`. The facet engine
(`src/engine/ratings.ts`) derives a full attribute sheet from `ovr` +
per-role profile deltas; 0-4 absolute `overrides` mark a star's signature
traits only.

| Band | Who | Examples (2025-26) |
|---|---|---|
| 85-91 | Current front-line international stars | Finn Russell 91, Maro Itoje 90, Tommy Freeman 88, Marcus Smith 88, Tom Curry 88 |
| 80-85 | Solid current internationals / elite PREM players | Fin Smith 87, Alex Mitchell 87, Ben Earl 87, Ellis Genge 86, Henry Slade 84 |
| 74-80 | Established Premiership starters | most clubs' first-choice XV sits here |
| 68-74 | Squad / rotation players | benches and second-choice depth |
| 60-68 | Academy prospects and third-choice depth | teenagers; low now, high growth (age-curve) |

Cross-club sanity rules applied:

- Squad quality tracks the real 2025-26 table: Northampton (1st, 74 pts) and
  Bath (2nd, reigning champions) carry the strongest rosters; Newcastle
  (10th, 12 pts, −535 PD) is clearly the weakest — no Newcastle player rates
  above 77.
- Within a club, the depth chart ordering matches who actually started big
  2025-26 matches.
- No invented players: every entry is a real, named 2025-26 squad member.
  Squad sizes are 33-44; where a club's public squad was thin at a position
  the file stays honest rather than padded.

## Annual refresh process

The CEO has committed to refreshing squads every real season. To refresh for
season N+1:

1. **Re-verify the league** first: club list (expansion to 12 is planned for
   2029-30), rebrands, format/bonus-point changes, playoff venue.
2. Pull each club's official squad announcement (usually published in
   August) — Wikipedia's per-club "Current squad" tables and the
   *List of <season> Premiership Rugby transfers* page are the fastest
   aggregators.
3. Update each `clubs/<id>.ts` in place. **Never change a player's `id`** —
   saves reference ids; a player changing clubs keeps his id and simply moves
   files. New players get new unique slugs (suffix a club abbreviation on
   collision, e.g. `john-stewart-lei`).
4. Increment ages by one; re-rate on the bands above (breakouts up, 33+
   decliners down); update club metadata (stadium sponsor names change).
5. Update the snapshot date in this README and in each file header, then
   `npm run build`.

Club ids (`ClubId` in `src/manager/types.ts`) and player ids are the stable
spine of the save format — everything else is a display-layer detail that a
refresh may freely change.
