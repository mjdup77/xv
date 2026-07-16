// Edinburgh Rugby — researched 2025-26 BKT URC squad (12th).
// Source: Wikipedia current-squad table reverse-adjusted to 2025-26 using the
// List of 2026-27 URC transfers (Venter/Healy/Lang/Shiel/Skinner/McCann
// restored; 2026-27 arrivals R.Higgins/Gwynn/Chapman/Hepburn/Grayson etc.
// excluded; Hector Patterson kept — he debuted during 2025-26). Hamish Watson
// is listed at Leicester (Prem data) per his 2025-26 loan with real minutes.
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "edinburgh",
  name: "Edinburgh Rugby",
  shortName: "Edinburgh",
  abbr: "EDI",
  city: "Edinburgh",
  stadium: "Edinburgh Rugby Stadium",
  colors: ["#000000", "#c8102e"],
  players: [
    // Props
    { id: "pierre-schoeman", name: "Pierre Schoeman", role: "prop", age: 31, nation: "Scotland", ovr: 84, overrides: { setPiece: 85, carry: 83 } },
    { id: "boan-venter", name: "Boan Venter", role: "prop", age: 28, nation: "South Africa", ovr: 79, overrides: { setPiece: 81 } },
    { id: "darcy-rae", name: "D'Arcy Rae", role: "prop", age: 30, nation: "Scotland", ovr: 74 },
    { id: "paul-hill-edi", name: "Paul Hill", role: "prop", age: 30, nation: "England", ovr: 74 },
    { id: "james-whitcombe", name: "James Whitcombe", role: "prop", age: 24, nation: "Scotland", ovr: 71 },
    { id: "rhys-litterick", name: "Rhys Litterick", role: "prop", age: 25, nation: "Scotland", ovr: 70 },
    { id: "ollie-blyth-lafferty", name: "Ollie Blyth-Lafferty", role: "prop", age: 22, nation: "Scotland", ovr: 67 },
    // Hookers
    { id: "ewan-ashman", name: "Ewan Ashman", role: "hooker", age: 25, nation: "Scotland", ovr: 81, overrides: { carry: 81 } },
    { id: "patrick-harrison", name: "Patrick Harrison", role: "hooker", age: 23, nation: "Scotland", ovr: 75 },
    { id: "dylan-richardson", name: "Dylan Richardson", role: "hooker", age: 26, nation: "Scotland", alt: ["flanker"], ovr: 73 },
    { id: "harri-morris", name: "Harri Morris", role: "hooker", age: 22, nation: "Scotland", ovr: 68 },
    // Locks
    { id: "grant-gilchrist", name: "Grant Gilchrist", role: "lock", age: 35, nation: "Scotland", ovr: 78, overrides: { setPiece: 81 } },
    { id: "sam-skinner", name: "Sam Skinner", role: "lock", age: 30, nation: "Scotland", alt: ["flanker"], ovr: 77 },
    { id: "marshall-sykes", name: "Marshall Sykes", role: "lock", age: 24, nation: "Scotland", ovr: 74 },
    { id: "glen-young", name: "Glen Young", role: "lock", age: 31, nation: "Scotland", ovr: 73 },
    { id: "callum-hunter-hill", name: "Callum Hunter-Hill", role: "lock", age: 28, nation: "Scotland", ovr: 72 },
    { id: "rob-carmichael", name: "Rob Carmichael", role: "lock", age: 23, nation: "Scotland", ovr: 69 },
    // Back row
    { id: "magnus-bradbury", name: "Magnus Bradbury", role: "number8", age: 30, nation: "Scotland", alt: ["flanker"], ovr: 80, overrides: { carry: 82 } },
    { id: "luke-crosbie", name: "Luke Crosbie", role: "flanker", age: 28, nation: "Scotland", ovr: 79, overrides: { defence: 82 } },
    { id: "freddy-douglas", name: "Freddy Douglas", role: "flanker", age: 20, nation: "Scotland", ovr: 76, overrides: { breakdown: 81 } },
    { id: "ben-muncaster", name: "Ben Muncaster", role: "number8", age: 24, nation: "Scotland", ovr: 74 },
    { id: "tom-currie-edi", name: "Tom Currie", role: "flanker", age: 24, nation: "Scotland", alt: ["number8"], ovr: 74 },
    { id: "connor-boyle", name: "Connor Boyle", role: "flanker", age: 25, nation: "Scotland", ovr: 72 },
    { id: "tom-dodd", name: "Tom Dodd", role: "flanker", age: 27, nation: "England", ovr: 72 },
    { id: "liam-mcconnell", name: "Liam McConnell", role: "flanker", age: 22, nation: "Scotland", ovr: 71 },
    // Scrum-halves
    { id: "ben-vellacott", name: "Ben Vellacott", role: "scrumhalf", age: 30, nation: "Scotland", ovr: 78, overrides: { pace: 82 } },
    { id: "charlie-shiel", name: "Charlie Shiel", role: "scrumhalf", age: 28, nation: "Scotland", ovr: 71 },
    { id: "hector-patterson", name: "Hector Patterson", role: "scrumhalf", age: 21, nation: "Scotland", ovr: 70 },
    { id: "conor-mcalpine", name: "Conor McAlpine", role: "scrumhalf", age: 23, nation: "Scotland", ovr: 67 },
    // Fly-halves
    // Ben Healy is listed at Newcastle (Prem data) — he kicked for Edinburgh
    // in the early 2025-26 rounds but the Prem file owns his id.
    { id: "ross-thompson", name: "Ross Thompson", role: "flyhalf", age: 26, nation: "Scotland", ovr: 74, overrides: { goalKick: 79 } },
    { id: "cammy-scott", name: "Cammy Scott", role: "flyhalf", age: 22, nation: "Scotland", ovr: 71 },
    // Centres
    { id: "mosese-tuipulotu", name: "Mosese Tuipulotu", role: "centre", age: 24, nation: "Scotland", ovr: 77, overrides: { carry: 79 } },
    { id: "matt-currie", name: "Matt Currie", role: "centre", age: 24, nation: "Scotland", ovr: 76 },
    { id: "james-lang", name: "James Lang", role: "centre", age: 30, nation: "Scotland", alt: ["flyhalf"], ovr: 73 },
    { id: "piers-oconor", name: "Piers O'Conor", role: "centre", age: 29, nation: "England", alt: ["fullback"], ovr: 73 },
    { id: "charlie-mccaig", name: "Charlie McCaig", role: "centre", age: 21, nation: "Scotland", ovr: 66 },
    // Back three
    { id: "duhan-van-der-merwe", name: "Duhan van der Merwe", role: "wing", age: 30, nation: "Scotland", ovr: 86, overrides: { pace: 91, carry: 89 } },
    { id: "darcy-graham", name: "Darcy Graham", role: "wing", age: 28, nation: "Scotland", ovr: 85, overrides: { pace: 90, handling: 83 } },
    { id: "wes-goosen", name: "Wes Goosen", role: "wing", age: 29, nation: "New Zealand", ovr: 76 },
    { id: "malelili-satala", name: "Malelili Satala", role: "wing", age: 24, nation: "Fiji", ovr: 73, overrides: { carry: 78 } },
    { id: "ross-mccann", name: "Ross McCann", role: "wing", age: 25, nation: "Scotland", ovr: 70 },
    { id: "harry-paterson", name: "Harry Paterson", role: "fullback", age: 24, nation: "Scotland", alt: ["wing", "centre"], ovr: 76 },
  ],
};
