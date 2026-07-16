// Leicester Tigers — researched 2025-26 Gallagher PREM squad.
// Source: Wikipedia "Leicester Tigers 2025-26 Premiership Rugby squad" table,
// cross-checked with leicestertigers.com and 2025-26 season reports.
// Hamish Watson joined on a short-term loan from Edinburgh in March 2026 and
// is included as a squad player. Snapshot: 2025-26 season (4th, semi-finalists).
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "leicester",
  name: "Leicester Tigers",
  shortName: "Leicester",
  abbr: "LEI",
  city: "Leicester",
  stadium: "Mattioli Woods Welford Road",
  colors: ["#046a38", "#c8102e"],
  players: [
    // Props
    { id: "joe-heyes", name: "Joe Heyes", role: "prop", age: 26, nation: "England", ovr: 82, overrides: { setPiece: 85 } },
    { id: "nicky-smith", name: "Nicky Smith", role: "prop", age: 31, nation: "Wales", ovr: 79, overrides: { setPiece: 83 } },
    { id: "will-hurd", name: "Will Hurd", role: "prop", age: 26, nation: "Scotland", ovr: 76 },
    { id: "tarek-haffar", name: "Tarek Haffar", role: "prop", age: 22, nation: "England", ovr: 70 },
    { id: "cameron-miell", name: "Cameron Miell", role: "prop", age: 23, nation: "England", ovr: 70 },
    { id: "archie-vanderflier", name: "Archie van der Flier", role: "prop", age: 22, nation: "England", ovr: 68 },
    { id: "ale-loman", name: "Ale Loman", role: "prop", age: 24, nation: "Sweden", ovr: 66 },
    // Hookers
    { id: "jamie-blamire", name: "Jamie Blamire", role: "hooker", age: 27, nation: "England", ovr: 78, overrides: { pace: 74 } },
    { id: "charlie-clare", name: "Charlie Clare", role: "hooker", age: 30, nation: "England", ovr: 74 },
    { id: "john-stewart-lei", name: "John Stewart", role: "hooker", age: 24, nation: "England", ovr: 70 },
    { id: "finn-theobald-thomas", name: "Finn Theobald-Thomas", role: "hooker", age: 21, nation: "England", ovr: 65 },
    // Locks
    { id: "ollie-chessum", name: "Ollie Chessum", role: "lock", age: 25, nation: "England", alt: ["flanker"], ovr: 86, overrides: { setPiece: 87, defence: 86 } },
    { id: "george-martin-lei", name: "George Martin", role: "lock", age: 24, nation: "England", alt: ["flanker"], ovr: 84, overrides: { defence: 87 } },
    { id: "cameron-henderson", name: "Cameron Henderson", role: "lock", age: 27, nation: "Scotland", ovr: 76 },
    { id: "lewis-chessum", name: "Lewis Chessum", role: "lock", age: 22, nation: "England", ovr: 72 },
    { id: "harry-wells", name: "Harry Wells", role: "lock", age: 32, nation: "England", ovr: 72 },
    { id: "james-thompson-lei", name: "James Thompson", role: "lock", age: 24, nation: "New Zealand", ovr: 68 },
    { id: "tom-manz", name: "Tom Manz", role: "lock", age: 21, nation: "England", ovr: 65 },
    // Back row
    { id: "tommy-reffell", name: "Tommy Reffell", role: "flanker", age: 26, nation: "Wales", ovr: 83, overrides: { breakdown: 89 } },
    { id: "hanro-liebenberg", name: "Hanro Liebenberg", role: "number8", age: 30, nation: "South Africa", alt: ["flanker"], ovr: 82, overrides: { carry: 85 } },
    { id: "joaquin-moro", name: "Joaquín Moro", role: "flanker", age: 25, nation: "Argentina", alt: ["number8"], ovr: 78, overrides: { breakdown: 81 } },
    { id: "finn-carnduff", name: "Finn Carnduff", role: "flanker", age: 20, nation: "England", ovr: 76 },
    { id: "olly-cracknell", name: "Olly Cracknell", role: "flanker", age: 31, nation: "Wales", ovr: 75 },
    { id: "emeka-ilione", name: "Emeka Ilione", role: "flanker", age: 23, nation: "England", alt: ["number8"], ovr: 75 },
    { id: "hamish-watson", name: "Hamish Watson", role: "flanker", age: 34, nation: "Scotland", ovr: 76, overrides: { breakdown: 82 } },
    { id: "josh-manz", name: "Josh Manz", role: "number8", age: 21, nation: "England", ovr: 66 },
    // Scrum-halves
    { id: "jack-van-poortvliet", name: "Jack van Poortvliet", role: "scrumhalf", age: 24, nation: "England", ovr: 82, overrides: { kick: 82 } },
    { id: "tom-whiteley", name: "Tom Whiteley", role: "scrumhalf", age: 29, nation: "England", ovr: 73 },
    { id: "ollie-allan", name: "Ollie Allan", role: "scrumhalf", age: 21, nation: "England", ovr: 68 },
    // Fly-halves
    { id: "orlando-bailey", name: "Orlando Bailey", role: "flyhalf", age: 24, nation: "England", alt: ["centre", "fullback"], ovr: 79, overrides: { goalKick: 84 } },
    { id: "billy-searle", name: "Billy Searle", role: "flyhalf", age: 29, nation: "England", ovr: 77, overrides: { goalKick: 82 } },
    { id: "charlie-titcombe", name: "Charlie Titcombe", role: "flyhalf", age: 21, nation: "England", ovr: 66 },
    // Centres
    { id: "solomone-kata", name: "Solomone Kata", role: "centre", age: 30, nation: "Tonga", ovr: 80, overrides: { carry: 86 } },
    { id: "will-wand", name: "Will Wand", role: "centre", age: 20, nation: "England", ovr: 79, overrides: { handling: 82 } },
    { id: "izaia-perese", name: "Izaia Perese", role: "centre", age: 28, nation: "Australia", alt: ["wing"], ovr: 78, overrides: { carry: 82 } },
    { id: "joseph-woodward", name: "Joseph Woodward", role: "centre", age: 22, nation: "England", alt: ["flyhalf"], ovr: 73 },
    // Wings
    { id: "adam-radwan", name: "Adam Radwan", role: "wing", age: 27, nation: "England", ovr: 80, overrides: { pace: 93 } },
    { id: "ollie-hassell-collins", name: "Ollie Hassell-Collins", role: "wing", age: 26, nation: "England", ovr: 79, overrides: { pace: 87 } },
    { id: "gabriel-hamer-webb", name: "Gabriel Hamer-Webb", role: "wing", age: 24, nation: "Wales", ovr: 72 },
    // Fullbacks
    { id: "freddie-steward", name: "Freddie Steward", role: "fullback", age: 24, nation: "England", ovr: 83, overrides: { handling: 85, defence: 84 } },
    { id: "james-oconnor", name: "James O'Connor", role: "fullback", age: 35, nation: "Australia", alt: ["flyhalf", "centre"], ovr: 78, overrides: { goalKick: 84, gameManage: 84 } },
  ],
};
