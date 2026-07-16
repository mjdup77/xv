// Bristol Bears — researched 2025-26 Gallagher PREM squad.
// Source: Wikipedia "Bristol Bears 2025-26 Premiership Rugby squad" table,
// cross-checked with bristolbearsrugby.com and season reports (Rees-Zammit's
// NFL-return signing confirmed via BBC Sport, Jul 2025). Snapshot: 2025-26
// season (6th, the league's trademark all-court attack).
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "bristol",
  name: "Bristol Bears",
  shortName: "Bristol",
  abbr: "BRI",
  city: "Bristol",
  stadium: "Ashton Gate",
  colors: ["#003057", "#ffb81c"],
  players: [
    // Props
    { id: "ellis-genge", name: "Ellis Genge", role: "prop", age: 30, nation: "England", ovr: 86, overrides: { setPiece: 86, carry: 87 } },
    { id: "max-lahiff", name: "Max Lahiff", role: "prop", age: 35, nation: "England", ovr: 74 },
    { id: "jake-woolmore", name: "Jake Woolmore", role: "prop", age: 30, nation: "England", ovr: 74 },
    { id: "george-kloska", name: "George Kloska", role: "prop", age: 24, nation: "England", ovr: 72 },
    { id: "lovejoy-chawatama", name: "Lovejoy Chawatama", role: "prop", age: 29, nation: "Zimbabwe", ovr: 71 },
    { id: "sam-grahamslaw", name: "Sam Grahamslaw", role: "prop", age: 23, nation: "England", ovr: 66 },
    // Hookers
    { id: "gabriel-oghre", name: "Gabriel Oghre", role: "hooker", age: 27, nation: "England", ovr: 79, overrides: { pace: 74, breakdown: 79 } },
    { id: "harry-thacker", name: "Harry Thacker", role: "hooker", age: 30, nation: "England", ovr: 76, overrides: { pace: 74 } },
    { id: "will-capon", name: "Will Capon", role: "hooker", age: 25, nation: "England", ovr: 72 },
    // Locks
    { id: "pedro-rubiolo", name: "Pedro Rubiolo", role: "lock", age: 22, nation: "Argentina", alt: ["flanker"], ovr: 79, overrides: { setPiece: 80 } },
    { id: "james-dun", name: "James Dun", role: "lock", age: 24, nation: "England", alt: ["flanker"], ovr: 75 },
    { id: "joe-batley", name: "Joe Batley", role: "lock", age: 28, nation: "England", ovr: 74 },
    { id: "joe-owen-bri", name: "Joe Owen", role: "lock", age: 22, nation: "England", ovr: 68 },
    { id: "will-ramply", name: "Will Ramply", role: "lock", age: 21, nation: "England", ovr: 65 },
    { id: "steele-barker", name: "Steele Barker", role: "lock", age: 21, nation: "England", ovr: 64 },
    // Back row
    { id: "viliame-mata", name: "Viliame Mata", role: "number8", age: 33, nation: "Fiji", ovr: 84, overrides: { handling: 87, carry: 87 } },
    { id: "fitz-harding", name: "Fitz Harding", role: "number8", age: 26, nation: "England", alt: ["flanker"], ovr: 80, overrides: { carry: 82 } },
    { id: "steven-luatua", name: "Steven Luatua", role: "flanker", age: 34, nation: "Samoa", alt: ["lock", "number8"], ovr: 78, overrides: { handling: 80 } },
    { id: "santiago-grondona", name: "Santiago Grondona", role: "flanker", age: 27, nation: "Argentina", alt: ["number8"], ovr: 78 },
    { id: "benjamin-grondona", name: "Benjamín Grondona", role: "flanker", age: 24, nation: "Argentina", ovr: 75 },
    { id: "luka-ivanishvili", name: "Luka Ivanishvili", role: "flanker", age: 21, nation: "Georgia", ovr: 73, overrides: { breakdown: 77 } },
    { id: "kofi-cripps", name: "Kofi Cripps", role: "flanker", age: 20, nation: "England", ovr: 66 },
    // Scrum-halves
    { id: "harry-randall", name: "Harry Randall", role: "scrumhalf", age: 27, nation: "England", ovr: 81, overrides: { pace: 84, handling: 84 } },
    { id: "kieran-marmion", name: "Kieran Marmion", role: "scrumhalf", age: 33, nation: "Ireland", ovr: 74 },
    { id: "sam-wolstenholme", name: "Sam Wolstenholme", role: "scrumhalf", age: 25, nation: "England", ovr: 72 },
    { id: "max-pepper", name: "Max Pepper", role: "scrumhalf", age: 22, nation: "England", ovr: 68 },
    // Fly-halves
    { id: "aj-macginty", name: "AJ MacGinty", role: "flyhalf", age: 35, nation: "United States", ovr: 81, overrides: { goalKick: 87, gameManage: 84 } },
    { id: "tom-jordan", name: "Tom Jordan", role: "flyhalf", age: 27, nation: "Scotland", alt: ["centre", "fullback"], ovr: 80, overrides: { handling: 83 } },
    { id: "sam-worsley", name: "Sam Worsley", role: "flyhalf", age: 24, nation: "England", ovr: 71 },
    // Centres
    { id: "benhard-janse-van-rensburg", name: "Benhard Janse van Rensburg", role: "centre", age: 29, nation: "South Africa", ovr: 80, overrides: { carry: 84 } },
    { id: "james-williams-bri", name: "James Williams", role: "centre", age: 28, nation: "England", alt: ["flyhalf"], ovr: 78, overrides: { goalKick: 80 } },
    { id: "matias-moroni", name: "Matias Moroni", role: "centre", age: 34, nation: "Argentina", alt: ["wing"], ovr: 75, overrides: { defence: 80 } },
    { id: "joe-jenkins-bri", name: "Joe Jenkins", role: "centre", age: 21, nation: "England", ovr: 71 },
    // Wings
    { id: "gabriel-ibitoye", name: "Gabriel Ibitoye", role: "wing", age: 26, nation: "England", ovr: 82, overrides: { pace: 89, handling: 83 } },
    { id: "kalaveti-ravouvou", name: "Kalaveti Ravouvou", role: "wing", age: 27, nation: "Fiji", alt: ["centre"], ovr: 80, overrides: { carry: 84, pace: 86 } },
    { id: "louis-rees-zammit", name: "Louis Rees-Zammit", role: "wing", age: 24, nation: "Wales", alt: ["fullback"], ovr: 80, overrides: { pace: 94 } },
    { id: "jack-bates", name: "Jack Bates", role: "wing", age: 24, nation: "England", ovr: 71 },
    { id: "aidan-boshoff", name: "Aidan Boshoff", role: "wing", age: 21, nation: "Wales", ovr: 66 },
    // Fullbacks
    { id: "benjamin-elizalde", name: "Benjamín Elizalde", role: "fullback", age: 24, nation: "Argentina", alt: ["wing"], ovr: 76 },
    { id: "rich-lane", name: "Richard Lane", role: "fullback", age: 27, nation: "England", ovr: 74 },
    { id: "noah-heward", name: "Noah Heward", role: "fullback", age: 24, nation: "England", alt: ["wing"], ovr: 73 },
    { id: "josh-carrington", name: "Josh Carrington", role: "fullback", age: 22, nation: "Wales", alt: ["wing"], ovr: 72 },
  ],
};
