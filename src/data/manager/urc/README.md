# XV Manager — real-world squad data (BKT United Rugby Championship)

Researched squad database for the URC, the companion to the Premiership data
in `src/data/manager/` (read that README first — this file only documents the
deltas). One file per club under `clubs/`, registered in `index.ts`.

**Wired into the game** (July 2026 multi-league integration): the local
`types.ts` mirror is gone — club files import `ClubData` straight from
`src/manager/types.ts`, and `index.ts` here feeds the unified registry in
`src/data/manager/index.ts` (`ALL_CLUBS`, `COMPETITIONS.urc`).

## Season snapshot

- **Season:** 2025-26. **Snapshot date:** 2 July 2026 — just after the 2026
  Grand Final (19 June 2026, Croke Park: Leinster 36-7 Bulls).
- **Clubs (16, verified — no change from the expected list):** Leinster,
  Munster, Ulster, Connacht; Cardiff, Ospreys, Scarlets, Dragons; Edinburgh,
  Glasgow Warriors; Benetton, Zebre Parma; Bulls, Sharks, Stormers, Lions.
  The WRU's cut to three Welsh clubs is decided but takes effect ~2028; all
  four Welsh sides played 2025-26 and are contracted through 2027-28.
- Same squad rules as the Prem data: 2025-26 first-team squads; a mid-window
  mover is listed where he actually played 2025-26 (e.g. Wilco Louw at the
  Bulls, Siya Kolisi at the Sharks — both move only for 2026-27; Lukhanyo Am
  kept at the Sharks despite his mid-season Japan move because he started
  early rounds). Announced 2026-27 transfers are **not** applied. Hamish
  Watson is at Leicester (Prem data) per his 2025-26 loan, not at Edinburgh,
  and Ben Healy is at Newcastle (Prem data owns his `ben-healy` id) despite
  kicking for Edinburgh in the early 2025-26 rounds — player ids stay unique
  across both league databases.
- `age` is at the start of the 2025-26 season (Sep 2025); deep-squad ages
  may be ±1 year.

## League structure (verified for 2025-26)

Encoded in `index.ts` (`URC`, `URC_SHIELDS`):

- 16 clubs, **18 rounds**: four regional pools (Irish / Welsh /
  Scottish-Italian / South African) supply 6 home-and-away derby rounds; the
  other 12 rounds are a single round robin of the twelve clubs from the other
  pools (6H/6A, venues alternate yearly; SA trips grouped as mini-tours).
- The pool games double as the four **Regional Shields** (2025-26 winners:
  Leinster, Ospreys, Glasgow, Lions) — shields have no playoff effect.
- League points: **4/2/0 plus 4-try and 7-point losing bonuses** (same as
  the PREM).
- **Top-8 playoffs**, seeded QF/SF/Final; every knockout round including the
  **Grand Final is hosted by the highest surviving seed** — no neutral venue.
  Glasgow topped the table but lost their semi; 2nd seeds Leinster therefore
  hosted (and won) the final at Croke Park.

## Sources

- Wikipedia: *2025–26 United Rugby Championship* (format, final table,
  shields, playoff bracket, awards, Elite XV, top scorers) — the primary
  calibration reference; per-club current-squad tables (citing official club
  squad pages); *List of 2026–27 United Rugby Championship transfers* used to
  reverse-adjust club pages that had already rolled over to 2026-27 (all four
  Irish clubs, Cardiff-page academy, Ospreys, Scarlets, Glasgow, Edinburgh).
- The four South African pages carry explicit "2025-26 URC squad" lists,
  used verbatim (NOT the parallel Currie Cup rosters, which are separate
  entities with heavy player overlap); in-season departure footnotes applied.
- BBC Sport / RugbyPass / Planet Rugby reporting for notable moves
  (Kolisi's Stormers return, Kolbe — 2026-27 only, so excluded).

## Rating calibration

Same 1-99 scale and bands as the Prem README (Finn Russell 91 is the shared
reference point). Cross-league consistency rules applied:

- Front-line Springboks / Ireland stars sit 85-93: Feinberg-Mngomezulu 90
  (URC Players' Player of the Year), Sheehan 90, Gibson-Park 90, Doris 89,
  Etzebeth 88, Pollard 88, Arendse 88, Sione Tuipulotu 88, Beirne 88.
- Squad quality tracks the real 2025-26 table: Leinster and the Bulls carry
  the deepest rosters (their packs out-rate mid-table Prem packs); **Zebre
  (16th, 15 pts, −275 PD) is deliberately the weakest squad in the league** —
  no Zebre player rates above Gesi's 77.
- The URC Elite XV and award winners anchor each club's top band (Papier 86,
  Roos 86, Quan Horn 84, McDowall 82, Kok 79, C. Smith's Golden Boot via a
  goalKick 87 override, etc.).

## Thin-data clubs

- **Lions and Sharks depth**: SA squads rotate heavily with Currie Cup
  sides; bench/depth ratings and a few deep-squad ages there are the least
  certain (front-line XVs verified against 2025-26 match reports).
- **Dragons and Zebre depth**: small public squads; both files stay honest
  rather than padded (Dragons carry only 5 specialist back-rowers with
  lock/No8 cover via `alt`).
- **Glasgow academy debutants** (Stephen, Watson, Duncan) are included
  because they scored/started in 2025-26 rounds; other 2026-27 academy
  promotions are excluded.

## Annual refresh

Follow the Prem README process; additionally re-verify the Welsh club count
(three-club restructure lands ~2028) and the SA URC-vs-Currie-Cup squad
split each season.
