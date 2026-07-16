// XV Manager — 2025-26 United Rugby Championship world data.
//
// Fully wired into the game (multi-league integration, July 2026): the club
// files are typed against the unified ClubData contract in src/manager/types.ts
// and the competition constants below feed the data-driven CompetitionDef in
// src/data/manager/index.ts.

import type { ClubData, ShieldDef, URCClubId } from "../../../manager/types";
import { URC_CLUB_IDS } from "../../../manager/types";
import { CLUB as LEINSTER } from "./clubs/leinster";
import { CLUB as MUNSTER } from "./clubs/munster";
import { CLUB as ULSTER } from "./clubs/ulster";
import { CLUB as CONNACHT } from "./clubs/connacht";
import { CLUB as CARDIFF } from "./clubs/cardiff";
import { CLUB as OSPREYS } from "./clubs/ospreys";
import { CLUB as SCARLETS } from "./clubs/scarlets";
import { CLUB as DRAGONS } from "./clubs/dragons";
import { CLUB as EDINBURGH } from "./clubs/edinburgh";
import { CLUB as GLASGOW } from "./clubs/glasgow";
import { CLUB as BENETTON } from "./clubs/benetton";
import { CLUB as ZEBRE } from "./clubs/zebre";
import { CLUB as BULLS } from "./clubs/bulls";
import { CLUB as SHARKS } from "./clubs/sharks";
import { CLUB as STORMERS } from "./clubs/stormers";
import { CLUB as LIONS } from "./clubs/lions";

export { URC_CLUB_IDS };

/** All sixteen 2025-26 URC clubs, fully researched (no placeholders). */
export const URC_CLUBS: ClubData[] = [
  LEINSTER,
  MUNSTER,
  ULSTER,
  CONNACHT,
  CARDIFF,
  OSPREYS,
  SCARLETS,
  DRAGONS,
  EDINBURGH,
  GLASGOW,
  BENETTON,
  ZEBRE,
  BULLS,
  SHARKS,
  STORMERS,
  LIONS,
];

/**
 * The four regional pools / Shields. Each club plays its three pool rivals
 * home and away (6 derby games) plus a single round robin of the twelve clubs
 * from the other pools (6 home / 6 away, alternating each year) = 18 rounds.
 * The pool winner (on points from pool games only) lifts a Regional Shield;
 * shields have no bearing on playoff qualification.
 */
export const URC_SHIELDS: readonly ShieldDef[] = [
  { id: "irish", label: "Irish Shield", clubIds: ["leinster", "munster", "ulster", "connacht"] },
  { id: "welsh", label: "Welsh Shield", clubIds: ["cardiff", "ospreys", "scarlets", "dragons"] },
  { id: "scotit", label: "Scottish-Italian Shield", clubIds: ["edinburgh", "glasgow", "benetton", "zebre"] },
  { id: "sa", label: "South African Shield", clubIds: ["bulls", "sharks", "stormers", "lions"] },
] as const;

/** Pool lookup for the scheduler. */
export const URC_POOLS: readonly (readonly URCClubId[])[] = URC_SHIELDS.map(
  (s) => s.clubIds as readonly URCClubId[],
);
