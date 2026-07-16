// Gloucester Rugby — researched 2025-26 Gallagher PREM squad.
// Source: Wikipedia "Gloucester Rugby 2025-26 Premiership Rugby squad" table,
// cross-checked with gloucesterrugby.co.uk and season reports. Snapshot:
// 2025-26 season (8th).
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "gloucester",
  name: "Gloucester Rugby",
  shortName: "Gloucester",
  abbr: "GLO",
  city: "Gloucester",
  stadium: "Kingsholm",
  colors: ["#b30838", "#ffffff"],
  players: [
    // Props
    { id: "val-rapava-ruskin", name: "Val Rapava-Ruskin", role: "prop", age: 32, nation: "Georgia", ovr: 79, overrides: { setPiece: 83 } },
    { id: "afolabi-fasogbon", name: "Afolabi Fasogbon", role: "prop", age: 21, nation: "England", ovr: 77, overrides: { setPiece: 80 } },
    { id: "kirill-gotovtsev", name: "Kirill Gotovtsev", role: "prop", age: 34, nation: "Russia", ovr: 74 },
    { id: "nepo-laulala", name: "Nepo Laulala", role: "prop", age: 34, nation: "New Zealand", ovr: 76, overrides: { setPiece: 81 } },
    { id: "jamal-ford-robinson", name: "Jamal Ford-Robinson", role: "prop", age: 31, nation: "England", ovr: 73 },
    { id: "ciaran-knight", name: "Ciaran Knight", role: "prop", age: 27, nation: "England", ovr: 72 },
    { id: "dian-bleuler", name: "Dian Bleuler", role: "prop", age: 25, nation: "South Africa", ovr: 71 },
    { id: "archie-mcarthur", name: "Archie McArthur", role: "prop", age: 22, nation: "England", ovr: 65 },
    // Hookers
    { id: "jack-singleton", name: "Jack Singleton", role: "hooker", age: 29, nation: "England", ovr: 77, overrides: { setPiece: 79 } },
    { id: "seb-blake", name: "Seb Blake", role: "hooker", age: 22, nation: "England", ovr: 72 },
    { id: "jack-innard", name: "Jack Innard", role: "hooker", age: 28, nation: "England", ovr: 70 },
    // Locks
    { id: "freddie-thomas", name: "Freddie Thomas", role: "lock", age: 28, nation: "Wales", ovr: 77, overrides: { setPiece: 79 } },
    { id: "matias-alemanno", name: "Matias Alemanno", role: "lock", age: 33, nation: "Argentina", ovr: 76, overrides: { setPiece: 79 } },
    { id: "arthur-clark", name: "Arthur Clark", role: "lock", age: 24, nation: "England", ovr: 74 },
    { id: "cameron-jordan-glo", name: "Cameron Jordan", role: "lock", age: 22, nation: "England", ovr: 68 },
    { id: "danny-eite", name: "Danny Eite", role: "lock", age: 21, nation: "England", ovr: 65 },
    { id: "hugh-bokenham", name: "Hugh Bokenham", role: "lock", age: 23, nation: "Australia", ovr: 64 },
    // Back row
    { id: "lewis-ludlow", name: "Lewis Ludlow", role: "flanker", age: 30, nation: "England", ovr: 79, overrides: { breakdown: 81, defence: 82 } },
    { id: "james-venter", name: "James Venter", role: "flanker", age: 28, nation: "South Africa", ovr: 78, overrides: { breakdown: 82 } },
    { id: "jack-clement", name: "Jack Clement", role: "number8", age: 25, nation: "England", alt: ["flanker"], ovr: 77, overrides: { carry: 80 } },
    { id: "jack-mann", name: "Jack Mann", role: "number8", age: 24, nation: "Scotland", alt: ["flanker"], ovr: 76, overrides: { carry: 80 } },
    { id: "will-trenholm", name: "Will Trenholm", role: "flanker", age: 22, nation: "England", ovr: 71 },
    { id: "harry-taylor-glo", name: "Harry Taylor", role: "flanker", age: 23, nation: "England", alt: ["number8"], ovr: 71 },
    { id: "josh-basham", name: "Josh Basham", role: "flanker", age: 26, nation: "England", ovr: 70 },
    // Scrum-halves
    { id: "tomos-williams", name: "Tomos Williams", role: "scrumhalf", age: 30, nation: "Wales", ovr: 85, overrides: { handling: 87, pace: 82 } },
    { id: "caolan-englefield", name: "Caolan Englefield", role: "scrumhalf", age: 24, nation: "England", ovr: 73 },
    { id: "mike-austin", name: "Mike Austin", role: "scrumhalf", age: 22, nation: "England", ovr: 67 },
    // Fly-halves
    { id: "charlie-atkinson", name: "Charlie Atkinson", role: "flyhalf", age: 24, nation: "England", ovr: 78, overrides: { goalKick: 83 } },
    { id: "ross-byrne", name: "Ross Byrne", role: "flyhalf", age: 30, nation: "Ireland", ovr: 78, overrides: { goalKick: 84, gameManage: 82 } },
    // Centres
    { id: "seb-atkinson", name: "Seb Atkinson", role: "centre", age: 24, nation: "England", ovr: 79, overrides: { carry: 81 } },
    { id: "max-llewellyn", name: "Max Llewellyn", role: "centre", age: 26, nation: "Wales", ovr: 78, overrides: { carry: 81 } },
    { id: "will-joseph", name: "Will Joseph", role: "centre", age: 22, nation: "England", ovr: 74 },
    { id: "will-butler", name: "Will Butler", role: "centre", age: 27, nation: "England", ovr: 72 },
    // Wings
    { id: "ollie-thorley", name: "Ollie Thorley", role: "wing", age: 29, nation: "England", ovr: 79, overrides: { pace: 88, carry: 81 } },
    { id: "ben-loader", name: "Ben Loader", role: "wing", age: 27, nation: "England", ovr: 75, overrides: { pace: 84 } },
    { id: "rob-russell", name: "Rob Russell", role: "wing", age: 25, nation: "Ireland", ovr: 72 },
    { id: "jacob-morris", name: "Jacob Morris", role: "wing", age: 24, nation: "England", ovr: 69 },
    // Fullbacks
    { id: "ben-redshaw", name: "Ben Redshaw", role: "fullback", age: 21, nation: "England", alt: ["wing"], ovr: 76, overrides: { pace: 86 } },
    { id: "josh-hathaway", name: "Josh Hathaway", role: "fullback", age: 22, nation: "Wales", alt: ["wing"], ovr: 75, overrides: { pace: 85 } },
    { id: "george-barton", name: "George Barton", role: "fullback", age: 24, nation: "England", alt: ["flyhalf"], ovr: 73 },
  ],
};
