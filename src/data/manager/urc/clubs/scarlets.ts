// Scarlets — researched 2025-26 BKT URC squad (14th).
// Source: Wikipedia current-squad table reverse-adjusted to 2025-26 using the
// List of 2026-27 URC transfers (van der Merwe/Rogers/Hepburn/Ball/Douglas/
// Taylor restored; 2026-27 arrivals Domachowski/Cuckson/McKee/G.Roberts/
// Groves/Grace excluded). Snapshot: 2 July 2026.
// Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "scarlets",
  name: "Scarlets",
  shortName: "Scarlets",
  abbr: "SCA",
  city: "Llanelli",
  stadium: "Parc y Scarlets",
  colors: ["#b3001e", "#ffffff"],
  players: [
    // Props
    { id: "henry-thomas-sca", name: "Henry Thomas", role: "prop", age: 34, nation: "Wales", ovr: 75, overrides: { setPiece: 79 } },
    { id: "alec-hepburn", name: "Alec Hepburn", role: "prop", age: 32, nation: "Wales", ovr: 74 },
    { id: "kemsley-mathias", name: "Kemsley Mathias", role: "prop", age: 26, nation: "Wales", ovr: 73 },
    { id: "harri-oconnor-sca", name: "Harri O'Connor", role: "prop", age: 24, nation: "Wales", ovr: 71 },
    { id: "archer-holz", name: "Archer Holz", role: "prop", age: 24, nation: "Australia", ovr: 70 },
    { id: "sam-oconnor-sca", name: "Sam O'Connor", role: "prop", age: 22, nation: "Wales", ovr: 66 },
    // Hookers
    { id: "ryan-elias", name: "Ryan Elias", role: "hooker", age: 30, nation: "Wales", ovr: 78, overrides: { setPiece: 80 } },
    { id: "marnus-van-der-merwe", name: "Marnus van der Merwe", role: "hooker", age: 26, nation: "South Africa", ovr: 76 },
    { id: "isaac-young-sca", name: "Isaac Young", role: "hooker", age: 21, nation: "Wales", ovr: 65 },
    // Locks
    { id: "sam-lousi", name: "Sam Lousi", role: "lock", age: 34, nation: "Tonga", ovr: 76, overrides: { carry: 79 } },
    { id: "jac-price", name: "Jac Price", role: "lock", age: 24, nation: "Wales", ovr: 73 },
    { id: "max-douglas-sca", name: "Max Douglas", role: "lock", age: 24, nation: "Wales", ovr: 71 },
    { id: "jake-ball", name: "Jake Ball", role: "lock", age: 34, nation: "Wales", ovr: 71, overrides: { setPiece: 76 } },
    // Back row
    { id: "josh-macleod", name: "Josh Macleod", role: "flanker", age: 29, nation: "Wales", ovr: 77, overrides: { breakdown: 81 } },
    { id: "taine-plumtree", name: "Taine Plumtree", role: "number8", age: 25, nation: "Wales", alt: ["flanker", "lock"], ovr: 77, overrides: { carry: 79 } },
    { id: "dan-davis-sca", name: "Dan Davis", role: "flanker", age: 26, nation: "Wales", ovr: 74 },
    { id: "fletcher-anderson", name: "Fletcher Anderson", role: "flanker", age: 23, nation: "New Zealand", ovr: 72 },
    { id: "jarrod-taylor", name: "Jarrod Taylor", role: "flanker", age: 27, nation: "Wales", alt: ["number8"], ovr: 72 },
    { id: "tristan-davies-sca", name: "Tristan Davies", role: "number8", age: 21, nation: "Wales", ovr: 66 },
    // Scrum-halves
    { id: "gareth-davies-sca", name: "Gareth Davies", role: "scrumhalf", age: 35, nation: "Wales", ovr: 75, overrides: { pace: 80 } },
    { id: "archie-hughes", name: "Archie Hughes", role: "scrumhalf", age: 23, nation: "Wales", ovr: 73 },
    { id: "dane-blacker", name: "Dane Blacker", role: "scrumhalf", age: 26, nation: "Wales", ovr: 72 },
    // Fly-halves
    { id: "sam-costelow", name: "Sam Costelow", role: "flyhalf", age: 24, nation: "Wales", ovr: 79, overrides: { goalKick: 82, handling: 80 } },
    { id: "carwyn-leggatt-jones", name: "Carwyn Leggatt-Jones", role: "flyhalf", age: 21, nation: "Wales", ovr: 71 },
    // Centres
    { id: "joe-roberts-sca", name: "Joe Roberts", role: "centre", age: 25, nation: "Wales", ovr: 78 },
    { id: "johnny-williams", name: "Johnny Williams", role: "centre", age: 29, nation: "Wales", ovr: 77, overrides: { carry: 80 } },
    { id: "eddie-james", name: "Eddie James", role: "centre", age: 23, nation: "Wales", ovr: 75 },
    { id: "joe-hawkins", name: "Joe Hawkins", role: "centre", age: 23, nation: "Wales", alt: ["flyhalf"], ovr: 75, overrides: { goalKick: 79 } },
    { id: "macs-page", name: "Macs Page", role: "centre", age: 21, nation: "Wales", alt: ["wing"], ovr: 73 },
    // Back three
    { id: "tom-rogers-sca", name: "Tom Rogers", role: "wing", age: 27, nation: "Wales", alt: ["fullback"], ovr: 78, overrides: { pace: 84 } },
    { id: "ellis-mee", name: "Ellis Mee", role: "wing", age: 26, nation: "Wales", ovr: 76, overrides: { pace: 83 } },
    { id: "tomi-lewis", name: "Tomi Lewis", role: "wing", age: 26, nation: "Wales", ovr: 72 },
    { id: "blair-murray", name: "Blair Murray", role: "fullback", age: 24, nation: "Wales", alt: ["wing"], ovr: 79, overrides: { pace: 86, handling: 80 } },
    { id: "ioan-nicholas", name: "Ioan Nicholas", role: "fullback", age: 27, nation: "Wales", alt: ["wing", "centre"], ovr: 72 },
    { id: "jac-davies-sca", name: "Jac Davies", role: "fullback", age: 20, nation: "Wales", ovr: 65 },
  ],
};
