// Connacht Rugby — researched 2025-26 BKT URC squad (8th, first playoffs
// under Stuart Lancaster). Source: Wikipedia current-squad table
// reverse-adjusted to 2025-26 using the List of 2026-27 URC transfers
// (Joyce/Devine/Carty/Dowling/Hawkshaw/Aungier/Mullins restored; 2026-27
// arrivals Frawley/Connors/van Wyk/Cahir/Connolly excluded; Naughton kept —
// he was Connacht's first-choice kicker during 2025-26).
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "connacht",
  name: "Connacht Rugby",
  shortName: "Connacht",
  abbr: "CON",
  city: "Galway",
  stadium: "The Sportsground",
  colors: ["#00843d", "#000000"],
  players: [
    // Props
    { id: "finlay-bealham", name: "Finlay Bealham", role: "prop", age: 33, nation: "Ireland", ovr: 80, overrides: { setPiece: 83 } },
    { id: "jack-aungier", name: "Jack Aungier", role: "prop", age: 27, nation: "Ireland", ovr: 75 },
    { id: "denis-buckley", name: "Denis Buckley", role: "prop", age: 35, nation: "Ireland", ovr: 73 },
    { id: "peter-dooley", name: "Peter Dooley", role: "prop", age: 30, nation: "Ireland", ovr: 73 },
    { id: "sam-illo", name: "Sam Illo", role: "prop", age: 25, nation: "Ireland", ovr: 73 },
    { id: "jordan-duggan", name: "Jordan Duggan", role: "prop", age: 26, nation: "Ireland", ovr: 71 },
    { id: "temi-lasisi", name: "Temi Lasisi", role: "prop", age: 24, nation: "Ireland", ovr: 70 },
    { id: "fiachna-barrett", name: "Fiachna Barrett", role: "prop", age: 22, nation: "Ireland", ovr: 68 },
    // Hookers
    { id: "dave-heffernan", name: "Dave Heffernan", role: "hooker", age: 34, nation: "Ireland", ovr: 76 },
    { id: "dylan-tierney-martin", name: "Dylan Tierney-Martin", role: "hooker", age: 25, nation: "Ireland", ovr: 76 },
    { id: "eoin-de-buitlear", name: "Eoin de Buitléar", role: "hooker", age: 24, nation: "Ireland", ovr: 72 },
    // Locks
    { id: "darragh-murray", name: "Darragh Murray", role: "lock", age: 24, nation: "Ireland", ovr: 80, overrides: { setPiece: 81 } },
    { id: "josh-murphy-con", name: "Josh Murphy", role: "lock", age: 30, nation: "Ireland", alt: ["flanker"], ovr: 75 },
    { id: "niall-murray", name: "Niall Murray", role: "lock", age: 26, nation: "Ireland", ovr: 75 },
    { id: "joe-joyce", name: "Joe Joyce", role: "lock", age: 29, nation: "Ireland", ovr: 74 },
    { id: "david-oconnor-con", name: "David O'Connor", role: "lock", age: 27, nation: "Ireland", ovr: 72 },
    { id: "oisin-dowling", name: "Oisín Dowling", role: "lock", age: 28, nation: "Ireland", ovr: 71 },
    // Back row
    { id: "cian-prendergast", name: "Cian Prendergast", role: "flanker", age: 25, nation: "Ireland", alt: ["number8"], ovr: 84, overrides: { breakdown: 85, carry: 84 } },
    { id: "sean-jansen", name: "Sean Jansen", role: "number8", age: 26, nation: "Ireland", ovr: 80, overrides: { carry: 84 } },
    { id: "shamus-hurley-langton", name: "Shamus Hurley-Langton", role: "flanker", age: 26, nation: "New Zealand", ovr: 80, overrides: { breakdown: 82 } },
    { id: "paul-boyle", name: "Paul Boyle", role: "number8", age: 28, nation: "Ireland", ovr: 77 },
    { id: "sean-obrien-con", name: "Seán O'Brien", role: "flanker", age: 25, nation: "Ireland", ovr: 73 },
    { id: "oisin-mccormack", name: "Oisín McCormack", role: "flanker", age: 23, nation: "Ireland", ovr: 71 },
    // Scrum-halves
    { id: "caolin-blade", name: "Caolin Blade", role: "scrumhalf", age: 31, nation: "Ireland", ovr: 78 },
    { id: "ben-murphy-con", name: "Ben Murphy", role: "scrumhalf", age: 24, nation: "Ireland", ovr: 76 },
    { id: "matthew-devine", name: "Matthew Devine", role: "scrumhalf", age: 23, nation: "Ireland", ovr: 75, overrides: { pace: 80 } },
    { id: "colm-reilly", name: "Colm Reilly", role: "scrumhalf", age: 26, nation: "Ireland", ovr: 71 },
    // Fly-halves
    { id: "josh-ioane", name: "Josh Ioane", role: "flyhalf", age: 30, nation: "New Zealand", ovr: 78 },
    { id: "sean-naughton", name: "Seán Naughton", role: "flyhalf", age: 22, nation: "Ireland", ovr: 76, overrides: { goalKick: 82 } },
    { id: "jack-carty", name: "Jack Carty", role: "flyhalf", age: 33, nation: "Ireland", ovr: 76, overrides: { goalKick: 82, gameManage: 80 } },
    { id: "david-hawkshaw", name: "David Hawkshaw", role: "flyhalf", age: 26, nation: "Ireland", alt: ["centre"], ovr: 71 },
    // Centres
    { id: "bundee-aki", name: "Bundee Aki", role: "centre", age: 35, nation: "Ireland", ovr: 84, overrides: { carry: 88, defence: 84 } },
    { id: "cathal-forde", name: "Cathal Forde", role: "centre", age: 24, nation: "Ireland", alt: ["flyhalf"], ovr: 77 },
    { id: "hugh-gavin", name: "Hugh Gavin", role: "centre", age: 21, nation: "Ireland", ovr: 74 },
    { id: "john-devine", name: "John Devine", role: "centre", age: 24, nation: "Ireland", ovr: 74 },
    // Back three
    { id: "mack-hansen", name: "Mack Hansen", role: "wing", age: 27, nation: "Ireland", alt: ["fullback"], ovr: 85, overrides: { handling: 87, pace: 86 } },
    { id: "shayne-bolton", name: "Shayne Bolton", role: "wing", age: 25, nation: "Ireland", ovr: 76, overrides: { pace: 85 } },
    { id: "finn-treacy", name: "Finn Treacy", role: "wing", age: 21, nation: "Ireland", ovr: 74 },
    { id: "byron-ralston", name: "Byron Ralston", role: "wing", age: 24, nation: "Australia", ovr: 73 },
    { id: "shane-jennings-con", name: "Shane Jennings", role: "wing", age: 24, nation: "Ireland", ovr: 71 },
    { id: "sam-gilbert", name: "Sam Gilbert", role: "fullback", age: 26, nation: "New Zealand", alt: ["flyhalf", "centre"], ovr: 80, overrides: { goalKick: 84 } },
    { id: "harry-west", name: "Harry West", role: "fullback", age: 22, nation: "Ireland", ovr: 71 },
  ],
};
