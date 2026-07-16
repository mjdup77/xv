// Cardiff Rugby — researched 2025-26 BKT URC squad (6th, first playoffs).
// Source: Wikipedia current-squad table (2025-26 snapshot) reverse-adjusted
// via the List of 2026-27 URC transfers (Donnell/Domachowski/Halfpenny/
// Byrne/Jennings restored; 2026-27 arrivals Malan/Sio/Paea excluded).
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "cardiff",
  name: "Cardiff Rugby",
  shortName: "Cardiff",
  abbr: "CAR",
  city: "Cardiff",
  stadium: "Cardiff Arms Park",
  colors: ["#0072ce", "#000000"],
  players: [
    // Props
    { id: "corey-domachowski", name: "Corey Domachowski", role: "prop", age: 28, nation: "Wales", ovr: 77, overrides: { setPiece: 79 } },
    { id: "keiron-assiratti", name: "Keiron Assiratti", role: "prop", age: 28, nation: "Wales", ovr: 76, overrides: { setPiece: 79 } },
    { id: "javan-sebastian", name: "Javan Sebastian", role: "prop", age: 30, nation: "Wales", ovr: 75 },
    { id: "danny-southworth", name: "Danny Southworth", role: "prop", age: 25, nation: "Wales", ovr: 73 },
    { id: "ed-byrne", name: "Ed Byrne", role: "prop", age: 32, nation: "Ireland", ovr: 73 },
    { id: "rhys-barratt", name: "Rhys Barratt", role: "prop", age: 22, nation: "Wales", ovr: 69 },
    { id: "sam-wainwright-car", name: "Sam Wainwright", role: "prop", age: 27, nation: "Wales", ovr: 72 },
    // Hookers
    { id: "liam-belcher", name: "Liam Belcher", role: "hooker", age: 29, nation: "Wales", ovr: 76 },
    { id: "evan-lloyd", name: "Evan Lloyd", role: "hooker", age: 24, nation: "Wales", ovr: 72 },
    { id: "dafydd-hughes-car", name: "Dafydd Hughes", role: "hooker", age: 26, nation: "Wales", ovr: 71 },
    // Locks
    { id: "teddy-williams", name: "Teddy Williams", role: "lock", age: 26, nation: "Wales", ovr: 78 },
    { id: "josh-mcnally", name: "Josh McNally", role: "lock", age: 35, nation: "England", ovr: 75 },
    { id: "rory-thornton", name: "Rory Thornton", role: "lock", age: 30, nation: "Wales", ovr: 74 },
    { id: "george-nott", name: "George Nott", role: "lock", age: 29, nation: "England", ovr: 73 },
    // Back row
    { id: "taulupe-faletau", name: "Taulupe Faletau", role: "number8", age: 34, nation: "Wales", ovr: 82, overrides: { carry: 85, handling: 84 } },
    { id: "taine-basham", name: "Taine Basham", role: "flanker", age: 25, nation: "Wales", ovr: 79, overrides: { breakdown: 81, carry: 80 } },
    { id: "alex-mann", name: "Alex Mann", role: "flanker", age: 23, nation: "Wales", ovr: 78 },
    { id: "james-botham", name: "James Botham", role: "flanker", age: 27, nation: "Wales", ovr: 78, overrides: { defence: 81 } },
    { id: "dan-thomas-car", name: "Dan Thomas", role: "flanker", age: 29, nation: "Wales", ovr: 74 },
    { id: "alun-lawrence", name: "Alun Lawrence", role: "flanker", age: 24, nation: "Wales", alt: ["number8"], ovr: 72 },
    { id: "lucas-de-la-rua", name: "Lucas de la Rua", role: "number8", age: 22, nation: "Wales", ovr: 69 },
    // Scrum-halves
    { id: "johan-mulder", name: "Johan Mulder", role: "scrumhalf", age: 25, nation: "South Africa", ovr: 76 },
    { id: "aled-davies", name: "Aled Davies", role: "scrumhalf", age: 33, nation: "Wales", ovr: 74 },
    { id: "ellis-bevan", name: "Ellis Bevan", role: "scrumhalf", age: 25, nation: "Wales", ovr: 73 },
    // Fly-halves
    { id: "callum-sheedy", name: "Callum Sheedy", role: "flyhalf", age: 30, nation: "Wales", ovr: 79, overrides: { goalKick: 84, gameManage: 80 } },
    { id: "ioan-lloyd", name: "Ioan Lloyd", role: "flyhalf", age: 24, nation: "Wales", alt: ["fullback"], ovr: 77, overrides: { pace: 82 } },
    { id: "harri-wilde", name: "Harri Wilde", role: "flyhalf", age: 21, nation: "Wales", ovr: 68 },
    // Centres
    { id: "ben-thomas-car", name: "Ben Thomas", role: "centre", age: 26, nation: "Wales", alt: ["flyhalf"], ovr: 80, overrides: { handling: 82 } },
    { id: "mason-grady", name: "Mason Grady", role: "centre", age: 23, nation: "Wales", alt: ["wing"], ovr: 79, overrides: { pace: 86, carry: 82 } },
    { id: "steffan-emanuel", name: "Steffan Emanuel", role: "centre", age: 22, nation: "Wales", ovr: 73 },
    { id: "rory-jennings", name: "Rory Jennings", role: "centre", age: 30, nation: "England", ovr: 71 },
    // Back three
    { id: "josh-adams", name: "Josh Adams", role: "wing", age: 30, nation: "Wales", ovr: 82, overrides: { pace: 86, defence: 80 } },
    { id: "tom-bowen-car", name: "Tom Bowen", role: "wing", age: 22, nation: "Wales", ovr: 79, overrides: { pace: 86 } },
    { id: "theo-cabango", name: "Theo Cabango", role: "wing", age: 23, nation: "Wales", ovr: 76, overrides: { pace: 87 } },
    { id: "harri-millard", name: "Harri Millard", role: "wing", age: 24, nation: "Wales", alt: ["centre"], ovr: 73 },
    { id: "iwan-stephens", name: "Iwan Stephens", role: "wing", age: 24, nation: "Wales", ovr: 71 },
    { id: "cameron-winnett", name: "Cameron Winnett", role: "fullback", age: 23, nation: "Wales", ovr: 78 },
    { id: "jacob-beetham", name: "Jacob Beetham", role: "fullback", age: 24, nation: "Wales", alt: ["wing"], ovr: 77 },
    { id: "leigh-halfpenny", name: "Leigh Halfpenny", role: "fullback", age: 36, nation: "Wales", ovr: 74, overrides: { goalKick: 87, defence: 80 } },
  ],
};
