// PLACEHOLDER squad generator — TEMPORARY, until the squad-data agent delivers
// researched club files (see the contract in src/manager/types.ts).
//
// Generates deterministic, plausible-shaped squads for clubs that don't yet
// have a hand-written data file, so the full 10-club season is playable today.
// Club identity (names, colours, grounds) is real; the generated PLAYERS are
// obviously not. Each generated club file the data agent delivers replaces
// one entry here via src/data/manager/index.ts.

import type { Role } from "../../types";
import { Rng } from "../../engine/rng";
import type { ClubData, PlayerDef, PremClubId } from "../../manager/types";

interface ClubMeta {
  name: string;
  shortName: string;
  abbr: string;
  city: string;
  stadium: string;
  colors: [string, string];
  /** Approximate 2025-26 squad strength (average first-choice ovr). */
  base: number;
}

export const CLUB_META: Record<PremClubId, ClubMeta> = {
  bath: { name: "Bath Rugby", shortName: "Bath", abbr: "BAT", city: "Bath", stadium: "The Recreation Ground", colors: ["#003c71", "#8b0d32"], base: 82 },
  bristol: { name: "Bristol Bears", shortName: "Bristol", abbr: "BRI", city: "Bristol", stadium: "Ashton Gate", colors: ["#003057", "#ffb81c"], base: 78 },
  exeter: { name: "Exeter Chiefs", shortName: "Exeter", abbr: "EXE", city: "Exeter", stadium: "Sandy Park", colors: ["#000000", "#e4002b"], base: 75 },
  gloucester: { name: "Gloucester Rugby", shortName: "Gloucester", abbr: "GLO", city: "Gloucester", stadium: "Kingsholm", colors: ["#b30838", "#ffffff"], base: 76 },
  harlequins: { name: "Harlequins", shortName: "Harlequins", abbr: "HAR", city: "London", stadium: "Twickenham Stoop", colors: ["#0c1c47", "#00a887"], base: 77 },
  leicester: { name: "Leicester Tigers", shortName: "Leicester", abbr: "LEI", city: "Leicester", stadium: "Mattioli Woods Welford Road", colors: ["#046a38", "#c8102e"], base: 79 },
  newcastle: { name: "Newcastle Red Bulls", shortName: "Newcastle", abbr: "NEW", city: "Newcastle", stadium: "Kingston Park", colors: ["#1e2a4a", "#d50032"], base: 70 },
  northampton: { name: "Northampton Saints", shortName: "Northampton", abbr: "NOR", city: "Northampton", stadium: "cinch Stadium at Franklin's Gardens", colors: ["#000000", "#00a54f"], base: 79 },
  sale: { name: "Sale Sharks", shortName: "Sale", abbr: "SAL", city: "Salford", stadium: "Salford Community Stadium", colors: ["#001489", "#ffffff"], base: 78 },
  saracens: { name: "Saracens", shortName: "Saracens", abbr: "SAR", city: "London", stadium: "StoneX Stadium", colors: ["#000000", "#d31145"], base: 79 },
};

// Squad shape: role, depth chart position (0 = first choice).
const SQUAD_SHAPE: [Role, number][] = [
  ["prop", 0], ["prop", 0], ["prop", 1], ["prop", 1], ["prop", 2], ["prop", 2],
  ["hooker", 0], ["hooker", 1], ["hooker", 2],
  ["lock", 0], ["lock", 0], ["lock", 1], ["lock", 1], ["lock", 2],
  ["flanker", 0], ["flanker", 0], ["flanker", 1], ["flanker", 1], ["flanker", 2],
  ["number8", 0], ["number8", 1],
  ["scrumhalf", 0], ["scrumhalf", 1], ["scrumhalf", 2],
  ["flyhalf", 0], ["flyhalf", 1], ["flyhalf", 2],
  ["centre", 0], ["centre", 0], ["centre", 1], ["centre", 1],
  ["wing", 0], ["wing", 0], ["wing", 1], ["wing", 1],
  ["fullback", 0], ["fullback", 1],
];

const FIRST = [
  "Tom", "Jack", "Harry", "George", "Ollie", "Ben", "Sam", "Charlie", "Will",
  "Joe", "Freddie", "Alex", "Max", "Luke", "James", "Dan", "Ethan", "Archie",
  "Callum", "Rory", "Finlay", "Owen", "Lewis", "Kyle", "Cameron", "Theo",
];
const LAST = [
  "Ward", "Hughes", "Bennett", "Cooper", "Turner", "Walker", "Wright", "Hall",
  "Green", "Baker", "Carter", "Mason", "Ellis", "Foster", "Gray", "Harrison",
  "Jenkins", "Lambert", "Marsh", "Norton", "Osborne", "Pearce", "Quinn",
  "Rhodes", "Shaw", "Tucker", "Vaughan", "Webb", "Yates", "Douglas",
];
const NATIONS: [string, number][] = [
  ["England", 0.72], ["Wales", 0.06], ["Scotland", 0.05], ["Ireland", 0.04],
  ["South Africa", 0.05], ["New Zealand", 0.03], ["Australia", 0.02],
  ["Fiji", 0.02], ["Argentina", 0.01],
];

function pickNation(rng: Rng): string {
  let roll = rng.next();
  for (const [nation, p] of NATIONS) {
    roll -= p;
    if (roll <= 0) return nation;
  }
  return "England";
}

const ALT_MAP: Partial<Record<Role, Role[]>> = {
  flanker: ["number8"],
  number8: ["flanker"],
  flyhalf: ["centre"],
  wing: ["fullback"],
  fullback: ["wing"],
  centre: ["wing"],
};

export function placeholderClub(id: PremClubId): ClubData {
  const meta = CLUB_META[id];
  const rng = new Rng(`placeholder:${id}`);
  const usedNames = new Set<string>();

  const players: PlayerDef[] = SQUAD_SHAPE.map(([role, depth], i) => {
    let name = `${rng.pick(FIRST)} ${rng.pick(LAST)}`;
    while (usedNames.has(name)) name = `${rng.pick(FIRST)} ${rng.pick(LAST)}`;
    usedNames.add(name);

    const ovr = Math.round(
      Math.max(58, Math.min(92, meta.base + rng.normal(1.5, 2.2) - depth * 4.5)),
    );
    const hasAlt = rng.next() < 0.3 ? ALT_MAP[role] : undefined;
    return {
      id: `${id}-gen-${i}`,
      name,
      role,
      alt: hasAlt,
      age: rng.int(20, 34),
      nation: pickNation(rng),
      ovr,
    };
  });

  return {
    id,
    name: meta.name,
    shortName: meta.shortName,
    abbr: meta.abbr,
    city: meta.city,
    stadium: meta.stadium,
    colors: meta.colors,
    players,
  };
}
