// Exeter Chiefs — researched 2025-26 Gallagher PREM squad.
// Source: Wikipedia "Exeter Chiefs 2025-26 Premiership Rugby squad" table,
// cross-checked with exeterchiefs.co.uk and season match reports. Josh Hodge
// (fullback) played 2025-26 at Exeter before his confirmed 2026-27 move to
// Newcastle, so he is listed here. Snapshot: 2025-26 season (3rd, semi-finalists,
// best defence in the league).
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "exeter",
  name: "Exeter Chiefs",
  shortName: "Exeter",
  abbr: "EXE",
  city: "Exeter",
  stadium: "Sandy Park",
  colors: ["#000000", "#e4002b"],
  players: [
    // Props
    { id: "josh-iosefa-scott", name: "Josh Iosefa-Scott", role: "prop", age: 26, nation: "England", ovr: 77, overrides: { setPiece: 80 } },
    { id: "scott-sio", name: "Scott Sio", role: "prop", age: 33, nation: "Samoa", ovr: 77, overrides: { setPiece: 81 } },
    { id: "ehren-painter", name: "Ehren Painter", role: "prop", age: 28, nation: "England", ovr: 75 },
    { id: "will-goodrick-clarke", name: "Will Goodrick-Clarke", role: "prop", age: 27, nation: "England", ovr: 74 },
    { id: "kwenzo-blose", name: "Kwenzo Blose", role: "prop", age: 27, nation: "South Africa", ovr: 73 },
    { id: "bachuki-tchumbadze", name: "Bachuki Tchumbadze", role: "prop", age: 23, nation: "Georgia", ovr: 71 },
    { id: "jimmy-roots", name: "Jimmy Roots", role: "prop", age: 27, nation: "New Zealand", ovr: 70 },
    { id: "khwezi-mona", name: "Khwezi Mona", role: "prop", age: 24, nation: "South Africa", ovr: 68 },
    { id: "ethan-burger", name: "Ethan Burger", role: "prop", age: 22, nation: "South Africa", ovr: 66 },
    // Hookers
    { id: "joseph-dweba", name: "Joseph Dweba", role: "hooker", age: 29, nation: "South Africa", ovr: 78, overrides: { carry: 78 } },
    { id: "jack-yeandle", name: "Jack Yeandle", role: "hooker", age: 36, nation: "England", ovr: 72 },
    { id: "max-norey", name: "Max Norey", role: "hooker", age: 24, nation: "England", ovr: 70 },
    { id: "julian-heaven", name: "Julian Heaven", role: "hooker", age: 21, nation: "Australia", ovr: 66 },
    // Locks
    { id: "dafydd-jenkins", name: "Dafydd Jenkins", role: "lock", age: 22, nation: "Wales", ovr: 83, overrides: { setPiece: 85, defence: 84 } },
    { id: "rus-tuima", name: "Rus Tuima", role: "lock", age: 24, nation: "England", alt: ["flanker"], ovr: 76, overrides: { carry: 79 } },
    { id: "andrea-zambonin", name: "Andrea Zambonin", role: "lock", age: 24, nation: "Italy", ovr: 74 },
    { id: "lewis-pearson", name: "Lewis Pearson", role: "lock", age: 24, nation: "England", ovr: 71 },
    // Back row
    { id: "ethan-roots", name: "Ethan Roots", role: "flanker", age: 28, nation: "England", ovr: 81, overrides: { carry: 84, defence: 83 } },
    { id: "tom-hooper", name: "Tom Hooper", role: "flanker", age: 24, nation: "Australia", alt: ["lock"], ovr: 80, overrides: { defence: 82 } },
    { id: "christ-tshiunza", name: "Christ Tshiunza", role: "flanker", age: 23, nation: "Wales", alt: ["lock"], ovr: 77 },
    { id: "richard-capstick", name: "Richard Capstick", role: "flanker", age: 25, nation: "England", alt: ["number8"], ovr: 75 },
    { id: "martin-moloney", name: "Martin Moloney", role: "flanker", age: 24, nation: "Ireland", ovr: 71 },
    { id: "greg-fisilau", name: "Greg Fisilau", role: "number8", age: 21, nation: "England", ovr: 78, overrides: { carry: 82 } },
    { id: "ross-vintcent", name: "Ross Vintcent", role: "number8", age: 23, nation: "Italy", alt: ["flanker"], ovr: 77, overrides: { pace: 78 } },
    // Scrum-halves
    { id: "stephen-varney", name: "Stephen Varney", role: "scrumhalf", age: 24, nation: "Italy", ovr: 77 },
    { id: "tom-cairns", name: "Tom Cairns", role: "scrumhalf", age: 24, nation: "England", ovr: 74 },
    { id: "charlie-chapman", name: "Charlie Chapman", role: "scrumhalf", age: 25, nation: "Scotland", ovr: 70 },
    // Fly-halves
    { id: "will-haydon-wood", name: "Will Haydon-Wood", role: "flyhalf", age: 24, nation: "England", ovr: 76, overrides: { goalKick: 81 } },
    { id: "harvey-skinner", name: "Harvey Skinner", role: "flyhalf", age: 27, nation: "England", ovr: 75, overrides: { goalKick: 80 } },
    // Centres
    { id: "len-ikitau", name: "Len Ikitau", role: "centre", age: 27, nation: "Australia", ovr: 85, overrides: { defence: 87, handling: 85 } },
    { id: "henry-slade", name: "Henry Slade", role: "centre", age: 32, nation: "England", alt: ["flyhalf"], ovr: 84, overrides: { kick: 86, handling: 87, defence: 84 } },
    { id: "will-rigg", name: "Will Rigg", role: "centre", age: 23, nation: "England", ovr: 76, overrides: { carry: 79 } },
    { id: "tamati-tua", name: "Tamati Tua", role: "centre", age: 27, nation: "New Zealand", ovr: 72 },
    { id: "zack-wimbush", name: "Zack Wimbush", role: "centre", age: 21, nation: "England", ovr: 67 },
    { id: "harry-ascherl", name: "Harry Ascherl", role: "centre", age: 21, nation: "England", ovr: 65 },
    // Wings
    { id: "immanuel-feyi-waboso", name: "Immanuel Feyi-Waboso", role: "wing", age: 22, nation: "England", ovr: 86, overrides: { pace: 94, carry: 84 } },
    { id: "paul-brown-bampoe", name: "Paul Brown-Bampoe", role: "wing", age: 22, nation: "England", ovr: 75, overrides: { pace: 87 } },
    { id: "ben-hammersley", name: "Ben Hammersley", role: "wing", age: 24, nation: "England", ovr: 71 },
    { id: "campbell-ridl", name: "Campbell Ridl", role: "wing", age: 23, nation: "England", ovr: 69 },
    // Fullbacks
    { id: "josh-hodge", name: "Josh Hodge", role: "fullback", age: 25, nation: "England", alt: ["wing"], ovr: 78, overrides: { goalKick: 82, handling: 81 } },
    { id: "tom-wyatt", name: "Tom Wyatt", role: "fullback", age: 25, nation: "England", alt: ["wing"], ovr: 75 },
    { id: "olly-woodburn", name: "Olly Woodburn", role: "fullback", age: 33, nation: "England", alt: ["wing"], ovr: 73 },
    { id: "dan-john", name: "Dan John", role: "fullback", age: 24, nation: "Wales", alt: ["wing"], ovr: 72 },
  ],
};
