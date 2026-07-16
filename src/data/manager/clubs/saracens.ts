// Saracens — researched 2025-26 Gallagher PREM squad.
// Source: Wikipedia squad table (2026-27) reverse-adjusted with the official
// 2026-27 transfer list (Tom Willis, Lozowski, van Zyl, Riccioni, McFarland
// et al. restored; 2026-27 arrivals G. Martin / T. Williams / Barbeary /
// T. James / Weilbach removed). Snapshot: 2025-26 season (5th).
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "saracens",
  name: "Saracens",
  shortName: "Saracens",
  abbr: "SAR",
  city: "London",
  stadium: "StoneX Stadium",
  colors: ["#000000", "#d31145"],
  players: [
    // Props
    { id: "rhys-carre", name: "Rhys Carré", role: "prop", age: 27, nation: "Wales", ovr: 77, overrides: { setPiece: 80 } },
    { id: "marco-riccioni", name: "Marco Riccioni", role: "prop", age: 27, nation: "Italy", ovr: 78, overrides: { setPiece: 82 } },
    { id: "eroni-mawi", name: "Eroni Mawi", role: "prop", age: 29, nation: "Fiji", ovr: 76 },
    { id: "alec-clarey", name: "Alec Clarey", role: "prop", age: 32, nation: "England", ovr: 74 },
    { id: "marcus-street", name: "Marcus Street", role: "prop", age: 26, nation: "England", ovr: 74 },
    { id: "harry-wilson-sar", name: "Harry Wilson", role: "prop", age: 28, nation: "England", ovr: 72 },
    { id: "phil-brantingham", name: "Phil Brantingham", role: "prop", age: 24, nation: "England", ovr: 68 },
    { id: "tietie-tuimauga", name: "Tietie Tuimauga", role: "prop", age: 26, nation: "Samoa", ovr: 68 },
    { id: "harvey-beaton", name: "Harvey Beaton", role: "prop", age: 23, nation: "England", ovr: 67 },
    // Hookers
    { id: "jamie-george", name: "Jamie George", role: "hooker", age: 34, nation: "England", ovr: 83, overrides: { setPiece: 85 } },
    { id: "theo-dan", name: "Theo Dan", role: "hooker", age: 24, nation: "England", ovr: 80, overrides: { pace: 76, carry: 80 } },
    { id: "samson-adejimi", name: "Samson Adejimi", role: "hooker", age: 22, nation: "England", ovr: 68 },
    { id: "james-hadfield", name: "James Hadfield", role: "hooker", age: 23, nation: "England", ovr: 66 },
    // Locks
    { id: "maro-itoje", name: "Maro Itoje", role: "lock", age: 30, nation: "England", ovr: 90, overrides: { setPiece: 90, defence: 91, breakdown: 87 } },
    { id: "nick-isiekwe", name: "Nick Isiekwe", role: "lock", age: 27, nation: "England", alt: ["flanker"], ovr: 80, overrides: { setPiece: 82 } },
    { id: "hugh-tizard", name: "Hugh Tizard", role: "lock", age: 26, nation: "England", ovr: 76 },
    { id: "theo-mcfarland", name: "Theo McFarland", role: "lock", age: 29, nation: "Samoa", alt: ["flanker"], ovr: 78, overrides: { handling: 78, carry: 80 } },
    { id: "olamide-sodeke", name: "Olamide Sodeke", role: "lock", age: 22, nation: "England", ovr: 71 },
    // Back row
    { id: "ben-earl", name: "Ben Earl", role: "flanker", age: 27, nation: "England", alt: ["number8"], ovr: 87, overrides: { carry: 89, pace: 85, breakdown: 85 } },
    { id: "juan-martin-gonzalez", name: "Juan Martín González", role: "flanker", age: 24, nation: "Argentina", alt: ["number8"], ovr: 82, overrides: { carry: 83, pace: 82 } },
    { id: "andy-onyeama-christie", name: "Andy Onyeama-Christie", role: "flanker", age: 26, nation: "Scotland", ovr: 77 },
    { id: "nathan-michelow", name: "Nathan Michelow", role: "flanker", age: 23, nation: "England", ovr: 74 },
    { id: "toby-knight", name: "Toby Knight", role: "flanker", age: 24, nation: "England", ovr: 73 },
    { id: "tom-willis", name: "Tom Willis", role: "number8", age: 26, nation: "England", ovr: 84, overrides: { carry: 88, breakdown: 83 } },
    // Scrum-halves
    { id: "ivan-van-zyl", name: "Ivan van Zyl", role: "scrumhalf", age: 30, nation: "South Africa", ovr: 78, overrides: { handling: 81 } },
    { id: "gareth-simpson", name: "Gareth Simpson", role: "scrumhalf", age: 25, nation: "Wales", ovr: 72 },
    { id: "charlie-bracken", name: "Charlie Bracken", role: "scrumhalf", age: 22, nation: "England", ovr: 70 },
    // Fly-halves
    { id: "owen-farrell", name: "Owen Farrell", role: "flyhalf", age: 33, nation: "England", alt: ["centre"], ovr: 85, overrides: { goalKick: 91, gameManage: 90, defence: 86, kick: 87 } },
    { id: "fergus-burke", name: "Fergus Burke", role: "flyhalf", age: 26, nation: "Scotland", alt: ["fullback"], ovr: 80, overrides: { goalKick: 84 } },
    { id: "louie-johnson", name: "Louie Johnson", role: "flyhalf", age: 21, nation: "England", ovr: 69 },
    // Centres
    { id: "nick-tompkins", name: "Nick Tompkins", role: "centre", age: 30, nation: "Wales", ovr: 80, overrides: { defence: 83, handling: 82 } },
    { id: "lucio-cinti", name: "Lucio Cinti", role: "centre", age: 25, nation: "Argentina", alt: ["wing"], ovr: 78 },
    { id: "alex-lozowski", name: "Alex Lozowski", role: "centre", age: 32, nation: "England", alt: ["flyhalf"], ovr: 78, overrides: { kick: 80 } },
    { id: "olly-hartley", name: "Olly Hartley", role: "centre", age: 22, nation: "England", ovr: 73 },
    { id: "angus-hall", name: "Angus Hall", role: "centre", age: 22, nation: "England", ovr: 71 },
    // Wings
    { id: "rotimi-segun", name: "Rotimi Segun", role: "wing", age: 28, nation: "England", ovr: 77, overrides: { pace: 87 } },
    { id: "tobias-elliott", name: "Tobias Elliott", role: "wing", age: 23, nation: "England", ovr: 75, overrides: { pace: 86 } },
    { id: "noah-caluori", name: "Noah Caluori", role: "wing", age: 19, nation: "England", ovr: 75, overrides: { pace: 89 } },
    { id: "jack-bracken", name: "Jack Bracken", role: "wing", age: 20, nation: "England", alt: ["fullback"], ovr: 72 },
    // Fullbacks
    { id: "elliot-daly", name: "Elliot Daly", role: "fullback", age: 32, nation: "England", alt: ["wing", "centre"], ovr: 82, overrides: { kick: 85, pace: 83, goalKick: 82 } },
    { id: "max-malins", name: "Max Malins", role: "fullback", age: 28, nation: "England", alt: ["wing", "flyhalf"], ovr: 80, overrides: { handling: 84 } },
  ],
};
