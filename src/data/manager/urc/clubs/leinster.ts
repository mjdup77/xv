// Leinster Rugby — researched 2025-26 BKT URC squad (champions).
// Source: Wikipedia current-squad table reverse-adjusted to 2025-26 using the
// List of 2026-27 URC transfers (Ioane/Frawley/Connors/McGrath/Slimani/Lowe/
// McKee/Cahir restored; Carbery's 2026-27 return excluded).
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "leinster",
  name: "Leinster Rugby",
  shortName: "Leinster",
  abbr: "LEI",
  city: "Dublin",
  stadium: "Aviva Stadium",
  colors: ["#0050a0", "#ffc82e"],
  players: [
    // Props
    { id: "andrew-porter", name: "Andrew Porter", role: "prop", age: 29, nation: "Ireland", ovr: 87, overrides: { setPiece: 88, carry: 84 } },
    { id: "tadhg-furlong", name: "Tadhg Furlong", role: "prop", age: 32, nation: "Ireland", ovr: 86, overrides: { setPiece: 90, handling: 84 } },
    { id: "thomas-clarkson", name: "Thomas Clarkson", role: "prop", age: 25, nation: "Ireland", ovr: 82, overrides: { setPiece: 84 } },
    { id: "jack-boyle", name: "Jack Boyle", role: "prop", age: 23, nation: "Ireland", ovr: 78 },
    { id: "rabah-slimani", name: "Rabah Slimani", role: "prop", age: 36, nation: "France", ovr: 78, overrides: { setPiece: 83 } },
    { id: "paddy-mccarthy-lei", name: "Paddy McCarthy", role: "prop", age: 21, nation: "Ireland", ovr: 73 },
    { id: "alex-usanov", name: "Alex Usanov", role: "prop", age: 21, nation: "Ireland", ovr: 70 },
    // Hookers
    { id: "dan-sheehan", name: "Dan Sheehan", role: "hooker", age: 27, nation: "Ireland", ovr: 90, overrides: { carry: 90, pace: 87, setPiece: 88 } },
    { id: "ronan-kelleher", name: "Rónan Kelleher", role: "hooker", age: 27, nation: "Ireland", ovr: 84, overrides: { carry: 85 } },
    { id: "gus-mccarthy", name: "Gus McCarthy", role: "hooker", age: 22, nation: "Ireland", ovr: 78 },
    { id: "john-mckee", name: "John McKee", role: "hooker", age: 25, nation: "Ireland", ovr: 75 },
    // Locks
    { id: "joe-mccarthy", name: "Joe McCarthy", role: "lock", age: 24, nation: "Ireland", ovr: 86, overrides: { defence: 89, setPiece: 87 } },
    { id: "james-ryan", name: "James Ryan", role: "lock", age: 29, nation: "Ireland", ovr: 86, overrides: { setPiece: 88 } },
    { id: "rg-snyman", name: "RG Snyman", role: "lock", age: 30, nation: "South Africa", ovr: 84, overrides: { handling: 89, carry: 86 } },
    { id: "ryan-baird", name: "Ryan Baird", role: "lock", age: 26, nation: "Ireland", alt: ["flanker"], ovr: 84, overrides: { pace: 84 } },
    { id: "conor-otighearnaigh", name: "Conor O'Tighearnaigh", role: "lock", age: 23, nation: "Ireland", ovr: 75 },
    { id: "brian-deeny", name: "Brian Deeny", role: "lock", age: 25, nation: "Ireland", ovr: 74 },
    // Back row
    { id: "caelan-doris", name: "Caelan Doris", role: "number8", age: 27, nation: "Ireland", ovr: 89, overrides: { carry: 90, breakdown: 88, handling: 86 } },
    { id: "josh-van-der-flier", name: "Josh van der Flier", role: "flanker", age: 32, nation: "Ireland", ovr: 87, overrides: { breakdown: 90, defence: 88 } },
    { id: "jack-conan", name: "Jack Conan", role: "number8", age: 33, nation: "Ireland", ovr: 84, overrides: { carry: 87 } },
    { id: "scott-penny", name: "Scott Penny", role: "flanker", age: 26, nation: "Ireland", ovr: 80, overrides: { breakdown: 82 } },
    { id: "max-deegan", name: "Max Deegan", role: "number8", age: 29, nation: "Ireland", alt: ["flanker"], ovr: 79 },
    { id: "will-connors", name: "Will Connors", role: "flanker", age: 29, nation: "Ireland", ovr: 77, overrides: { defence: 86 } },
    { id: "alex-soroka", name: "Alex Soroka", role: "flanker", age: 24, nation: "Ireland", alt: ["lock"], ovr: 76 },
    { id: "james-culhane", name: "James Culhane", role: "number8", age: 23, nation: "Ireland", ovr: 75 },
    // Scrum-halves
    { id: "jamison-gibson-park", name: "Jamison Gibson-Park", role: "scrumhalf", age: 33, nation: "Ireland", ovr: 90, overrides: { handling: 92, gameManage: 92, kick: 88 } },
    { id: "luke-mcgrath", name: "Luke McGrath", role: "scrumhalf", age: 32, nation: "Ireland", ovr: 78 },
    { id: "fintan-gunne", name: "Fintan Gunne", role: "scrumhalf", age: 21, nation: "Ireland", ovr: 74 },
    // Fly-halves
    { id: "sam-prendergast", name: "Sam Prendergast", role: "flyhalf", age: 22, nation: "Ireland", ovr: 86, overrides: { kick: 90, goalKick: 88, handling: 88 } },
    { id: "ciaran-frawley", name: "Ciarán Frawley", role: "flyhalf", age: 27, nation: "Ireland", alt: ["fullback", "centre"], ovr: 81 },
    { id: "harry-byrne", name: "Harry Byrne", role: "flyhalf", age: 26, nation: "Ireland", ovr: 79, overrides: { goalKick: 84 } },
    // Centres
    { id: "garry-ringrose", name: "Garry Ringrose", role: "centre", age: 30, nation: "Ireland", ovr: 86, overrides: { defence: 88, pace: 85 } },
    { id: "rieko-ioane", name: "Rieko Ioane", role: "centre", age: 28, nation: "New Zealand", alt: ["wing"], ovr: 86, overrides: { pace: 92, carry: 88 } },
    { id: "robbie-henshaw", name: "Robbie Henshaw", role: "centre", age: 32, nation: "Ireland", ovr: 84, overrides: { defence: 86 } },
    { id: "jamie-osborne", name: "Jamie Osborne", role: "centre", age: 23, nation: "Ireland", alt: ["fullback", "wing"], ovr: 83 },
    { id: "charlie-tector", name: "Charlie Tector", role: "centre", age: 22, nation: "Ireland", alt: ["flyhalf"], ovr: 77 },
    { id: "hugh-cooney", name: "Hugh Cooney", role: "centre", age: 22, nation: "Ireland", ovr: 74 },
    // Back three
    { id: "james-lowe", name: "James Lowe", role: "wing", age: 33, nation: "Ireland", ovr: 86, overrides: { kick: 89, carry: 87 } },
    { id: "tommy-obrien", name: "Tommy O'Brien", role: "wing", age: 27, nation: "Ireland", ovr: 82, overrides: { pace: 86 } },
    { id: "joshua-kenny", name: "Joshua Kenny", role: "wing", age: 22, nation: "Ireland", ovr: 78, overrides: { pace: 87 } },
    { id: "jordan-larmour", name: "Jordan Larmour", role: "wing", age: 28, nation: "Ireland", alt: ["fullback"], ovr: 78, overrides: { pace: 87 } },
    { id: "hugo-keenan", name: "Hugo Keenan", role: "fullback", age: 29, nation: "Ireland", ovr: 87, overrides: { pace: 88, defence: 88 } },
    { id: "jimmy-obrien", name: "Jimmy O'Brien", role: "fullback", age: 28, nation: "Ireland", alt: ["wing", "centre"], ovr: 79 },
  ],
};
