// Glasgow Warriors — researched 2025-26 BKT URC squad (1st in the regular
// season, semi-finalists, Scottish-Italian Shield winners).
// Source: Wikipedia current-squad table reverse-adjusted to 2025-26 using the
// List of 2026-27 URC transfers (Hastings/Jones/Bhatti/Dempsey/Matthews/Weir/
// Vailanu restored; 2026-27 arrivals Ritchie/Kuenzle/van der Merwe and academy
// promotions excluded, except those who debuted during 2025-26).
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "glasgow",
  name: "Glasgow Warriors",
  shortName: "Glasgow",
  abbr: "GLA",
  city: "Glasgow",
  stadium: "Scotstoun Stadium",
  colors: ["#101820", "#0072ce"],
  players: [
    // Props
    { id: "zander-fagerson", name: "Zander Fagerson", role: "prop", age: 29, nation: "Scotland", ovr: 85, overrides: { setPiece: 87 } },
    { id: "rory-sutherland", name: "Rory Sutherland", role: "prop", age: 33, nation: "Scotland", ovr: 78, overrides: { setPiece: 81 } },
    { id: "nathan-mcbeth", name: "Nathan McBeth", role: "prop", age: 27, nation: "Scotland", ovr: 77 },
    { id: "patrick-schickerling", name: "Patrick Schickerling", role: "prop", age: 26, nation: "South Africa", ovr: 77 },
    { id: "jamie-bhatti", name: "Jamie Bhatti", role: "prop", age: 32, nation: "Scotland", ovr: 76 },
    { id: "sam-talakai", name: "Sam Talakai", role: "prop", age: 33, nation: "Australia", ovr: 74 },
    { id: "fin-richardson", name: "Fin Richardson", role: "prop", age: 24, nation: "Scotland", ovr: 71 },
    { id: "murphy-walker", name: "Murphy Walker", role: "prop", age: 26, nation: "Scotland", ovr: 71 },
    // Hookers
    { id: "johnny-matthews", name: "Johnny Matthews", role: "hooker", age: 32, nation: "Scotland", ovr: 78, overrides: { carry: 79 } },
    { id: "gregor-hiddleston", name: "Gregor Hiddleston", role: "hooker", age: 22, nation: "Scotland", ovr: 76 },
    { id: "grant-stewart", name: "Grant Stewart", role: "hooker", age: 30, nation: "Scotland", ovr: 73 },
    { id: "seb-stephen", name: "Seb Stephen", role: "hooker", age: 21, nation: "Scotland", ovr: 70 },
    { id: "tavi-tuipulotu", name: "Tavi Tuipulotu", role: "hooker", age: 21, nation: "Scotland", ovr: 68 },
    // Locks
    { id: "scott-cummings", name: "Scott Cummings", role: "lock", age: 29, nation: "Scotland", ovr: 82, overrides: { setPiece: 84 } },
    { id: "max-williamson", name: "Max Williamson", role: "lock", age: 23, nation: "Scotland", ovr: 78 },
    { id: "jare-oguntibeju", name: "Jare Oguntibeju", role: "lock", age: 22, nation: "Scotland", ovr: 74 },
    { id: "alex-samuel", name: "Alex Samuel", role: "lock", age: 27, nation: "Scotland", ovr: 74 },
    { id: "alex-craig", name: "Alex Craig", role: "lock", age: 28, nation: "Scotland", ovr: 72 },
    // Back row
    { id: "rory-darge", name: "Rory Darge", role: "flanker", age: 25, nation: "Scotland", ovr: 87, overrides: { breakdown: 91, defence: 87 } },
    { id: "matt-fagerson", name: "Matt Fagerson", role: "number8", age: 27, nation: "Scotland", alt: ["flanker"], ovr: 83, overrides: { carry: 84 } },
    { id: "jack-dempsey", name: "Jack Dempsey", role: "number8", age: 31, nation: "Scotland", ovr: 82, overrides: { carry: 86 } },
    { id: "gregor-brown", name: "Gregor Brown", role: "flanker", age: 24, nation: "Scotland", alt: ["lock"], ovr: 78 },
    { id: "sione-vailanu", name: "Sione Vailanu", role: "number8", age: 30, nation: "Tonga", ovr: 77, overrides: { carry: 82 } },
    { id: "euan-ferrie", name: "Euan Ferrie", role: "flanker", age: 22, nation: "Scotland", ovr: 73 },
    { id: "ally-miller", name: "Ally Miller", role: "flanker", age: 26, nation: "Scotland", ovr: 72 },
    { id: "macenzzie-duncan", name: "Macenzzie Duncan", role: "flanker", age: 21, nation: "Scotland", ovr: 69 },
    { id: "angus-fraser-gla", name: "Angus Fraser", role: "flanker", age: 21, nation: "Scotland", ovr: 68 },
    // Scrum-halves
    { id: "george-horne", name: "George Horne", role: "scrumhalf", age: 30, nation: "Scotland", ovr: 82, overrides: { pace: 85, goalKick: 80 } },
    { id: "jamie-dobie", name: "Jamie Dobie", role: "scrumhalf", age: 24, nation: "Scotland", alt: ["wing"], ovr: 80, overrides: { pace: 84 } },
    { id: "ben-afshar", name: "Ben Afshar", role: "scrumhalf", age: 22, nation: "Scotland", ovr: 68 },
    // Fly-halves
    { id: "adam-hastings", name: "Adam Hastings", role: "flyhalf", age: 29, nation: "Scotland", ovr: 80, overrides: { goalKick: 83, kick: 83 } },
    { id: "dan-lancaster", name: "Dan Lancaster", role: "flyhalf", age: 24, nation: "England", ovr: 76, overrides: { goalKick: 80 } },
    { id: "duncan-weir", name: "Duncan Weir", role: "flyhalf", age: 34, nation: "Scotland", ovr: 72, overrides: { goalKick: 80 } },
    { id: "charlie-savala", name: "Charlie Savala", role: "flyhalf", age: 25, nation: "Scotland", alt: ["centre"], ovr: 71 },
    // Centres
    { id: "sione-tuipulotu", name: "Sione Tuipulotu", role: "centre", age: 28, nation: "Scotland", ovr: 88, overrides: { carry: 88, handling: 87 } },
    { id: "huw-jones", name: "Huw Jones", role: "centre", age: 31, nation: "Scotland", ovr: 85, overrides: { pace: 87, handling: 84 } },
    { id: "stafford-mcdowall", name: "Stafford McDowall", role: "centre", age: 27, nation: "Scotland", ovr: 82, overrides: { defence: 83, carry: 82 } },
    { id: "johnny-ventisei", name: "Johnny Ventisei", role: "centre", age: 21, nation: "Scotland", ovr: 71 },
    { id: "duncan-munn", name: "Duncan Munn", role: "centre", age: 22, nation: "Scotland", ovr: 68 },
    // Back three
    { id: "kyle-steyn", name: "Kyle Steyn", role: "wing", age: 31, nation: "Scotland", ovr: 82, overrides: { carry: 83 } },
    { id: "kyle-rowe", name: "Kyle Rowe", role: "wing", age: 27, nation: "Scotland", alt: ["fullback"], ovr: 82, overrides: { pace: 87 } },
    { id: "fergus-watson", name: "Fergus Watson", role: "wing", age: 21, nation: "Scotland", ovr: 69 },
    { id: "josh-mckay", name: "Josh McKay", role: "fullback", age: 28, nation: "New Zealand", alt: ["wing"], ovr: 79, overrides: { pace: 84 } },
    { id: "ollie-smith-gla", name: "Ollie Smith", role: "fullback", age: 25, nation: "Scotland", ovr: 77 },
  ],
};
