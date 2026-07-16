// Dragons RFC — researched 2025-26 BKT URC squad (15th, much improved on
// 2024-25). Source: Wikipedia current-squad table reverse-adjusted to 2025-26
// using the List of 2026-27 URC transfers (Aaron Wainwright/Rosser/G.Roberts
// restored; 2026-27 arrivals Tuitavuki/Peita/Enari/Parry excluded).
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "dragons",
  name: "Dragons RFC",
  shortName: "Dragons",
  abbr: "DRA",
  city: "Newport",
  stadium: "Rodney Parade",
  colors: ["#9e1b32", "#ffb81c"],
  players: [
    // Props
    { id: "dillon-lewis", name: "Dillon Lewis", role: "prop", age: 29, nation: "Wales", ovr: 77, overrides: { setPiece: 79 } },
    { id: "wyn-jones-dra", name: "Wyn Jones", role: "prop", age: 33, nation: "Wales", ovr: 75, overrides: { setPiece: 79 } },
    { id: "rodrigo-martinez", name: "Rodrigo Martínez", role: "prop", age: 28, nation: "Argentina", ovr: 72 },
    { id: "rhodri-jones-dra", name: "Rhodri Jones", role: "prop", age: 34, nation: "Wales", ovr: 71 },
    { id: "christian-coleman", name: "Christian Coleman", role: "prop", age: 24, nation: "Wales", ovr: 69 },
    { id: "robert-hunt", name: "Robert Hunt", role: "prop", age: 25, nation: "Wales", ovr: 68 },
    { id: "dylan-kelleher-griffiths", name: "Dylan Kelleher-Griffiths", role: "prop", age: 22, nation: "Wales", ovr: 66 },
    // Hookers
    { id: "elliot-dee", name: "Elliot Dee", role: "hooker", age: 31, nation: "Wales", ovr: 76 },
    { id: "brodie-coghlan", name: "Brodie Coghlan", role: "hooker", age: 26, nation: "Wales", ovr: 72 },
    { id: "oli-burrows", name: "Oli Burrows", role: "hooker", age: 22, nation: "Wales", ovr: 70 },
    { id: "sam-scarfe", name: "Sam Scarfe", role: "hooker", age: 21, nation: "Wales", ovr: 66 },
    // Locks
    { id: "ben-carter", name: "Ben Carter", role: "lock", age: 24, nation: "Wales", ovr: 79, overrides: { defence: 84 } },
    { id: "seb-davies", name: "Seb Davies", role: "lock", age: 29, nation: "Wales", alt: ["number8"], ovr: 76 },
    { id: "matthew-screech", name: "Matthew Screech", role: "lock", age: 32, nation: "Wales", ovr: 72 },
    { id: "levi-douglas", name: "Levi Douglas", role: "lock", age: 24, nation: "Wales", ovr: 71 },
    { id: "barny-langton-cryer", name: "Barny Langton-Cryer", role: "lock", age: 22, nation: "Wales", ovr: 68 },
    // Back row
    { id: "aaron-wainwright", name: "Aaron Wainwright", role: "number8", age: 28, nation: "Wales", ovr: 82, overrides: { carry: 84, pace: 82 } },
    { id: "ryan-woodman", name: "Ryan Woodman", role: "flanker", age: 21, nation: "Wales", alt: ["lock"], ovr: 73 },
    { id: "harrison-keddie", name: "Harrison Keddie", role: "number8", age: 27, nation: "Wales", alt: ["flanker"], ovr: 73 },
    { id: "shane-lewis-hughes", name: "Shane Lewis-Hughes", role: "flanker", age: 27, nation: "Wales", ovr: 73 },
    { id: "thomas-young-dra", name: "Thomas Young", role: "flanker", age: 33, nation: "Wales", ovr: 74, overrides: { breakdown: 79 } },
    // Scrum-halves
    { id: "rhodri-williams-dra", name: "Rhodri Williams", role: "scrumhalf", age: 32, nation: "Wales", ovr: 73 },
    { id: "che-hope", name: "Che Hope", role: "scrumhalf", age: 24, nation: "Wales", ovr: 72 },
    { id: "morgan-lloyd-dra", name: "Morgan Lloyd", role: "scrumhalf", age: 24, nation: "Wales", ovr: 68 },
    // Fly-halves
    { id: "angus-obrien", name: "Angus O'Brien", role: "flyhalf", age: 30, nation: "Wales", ovr: 76, overrides: { goalKick: 82 } },
    { id: "tinus-de-beer", name: "Tinus de Beer", role: "flyhalf", age: 28, nation: "South Africa", ovr: 75, overrides: { goalKick: 80 } },
    { id: "jac-lloyd", name: "Jac Lloyd", role: "flyhalf", age: 21, nation: "Wales", ovr: 66 },
    // Centres
    { id: "aneurin-owen", name: "Aneurin Owen", role: "centre", age: 24, nation: "Wales", ovr: 74 },
    { id: "harri-ackerman", name: "Harri Ackerman", role: "centre", age: 21, nation: "Wales", ovr: 71 },
    { id: "fetuli-paea", name: "Fetuli Paea", role: "centre", age: 27, nation: "Tonga", ovr: 71 },
    { id: "joe-westwood", name: "Joe Westwood", role: "centre", age: 24, nation: "Wales", ovr: 68 },
    // Back three
    { id: "rio-dyer", name: "Rio Dyer", role: "wing", age: 25, nation: "Wales", ovr: 79, overrides: { pace: 88 } },
    { id: "jared-rosser", name: "Jared Rosser", role: "wing", age: 26, nation: "Wales", ovr: 72 },
    { id: "fine-inisi", name: "Fine Inisi", role: "wing", age: 24, nation: "Tonga", ovr: 72 },
    { id: "david-richards-dra", name: "David Richards", role: "fullback", age: 24, nation: "Wales", alt: ["wing", "centre"], ovr: 74 },
    { id: "cai-evans", name: "Cai Evans", role: "fullback", age: 26, nation: "Wales", ovr: 71, overrides: { goalKick: 78 } },
    { id: "huw-anderson", name: "Huw Anderson", role: "fullback", age: 22, nation: "Wales", alt: ["wing"], ovr: 68 },
  ],
};
