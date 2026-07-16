// Sale Sharks — researched 2025-26 Gallagher PREM squad.
// Source: Wikipedia "Sale Sharks 2025-26 Premiership Rugby squad" table,
// cross-checked with salesharks.com and season reports. Snapshot: 2025-26
// season (7th — a down year, but the Curry twins / Ford core keeps the
// ceiling high).
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "sale",
  name: "Sale Sharks",
  shortName: "Sale",
  abbr: "SAL",
  city: "Salford",
  stadium: "CorpAcq Stadium",
  colors: ["#001489", "#ffffff"],
  players: [
    // Props
    { id: "asher-opoku-fordjour", name: "Asher Opoku-Fordjour", role: "prop", age: 21, nation: "England", ovr: 81, overrides: { setPiece: 84 } },
    { id: "bevan-rodd", name: "Bevan Rodd", role: "prop", age: 25, nation: "England", ovr: 79, overrides: { setPiece: 80 } },
    { id: "willgriff-john", name: "WillGriff John", role: "prop", age: 32, nation: "Wales", ovr: 75, overrides: { setPiece: 79 } },
    { id: "simon-mcintyre", name: "Simon McIntyre", role: "prop", age: 34, nation: "England", ovr: 72 },
    { id: "james-harper", name: "James Harper", role: "prop", age: 24, nation: "England", ovr: 70 },
    { id: "patreece-bell", name: "Patreece Bell", role: "prop", age: 26, nation: "Ireland", ovr: 68 },
    { id: "tumy-onasanya", name: "Tumy Onasanya", role: "prop", age: 22, nation: "England", ovr: 65 },
    // Hookers
    { id: "luke-cowan-dickie", name: "Luke Cowan-Dickie", role: "hooker", age: 32, nation: "England", ovr: 82, overrides: { setPiece: 83, breakdown: 82 } },
    { id: "tadgh-mcelroy", name: "Tadgh McElroy", role: "hooker", age: 27, nation: "Ireland", ovr: 72 },
    { id: "nathan-jibulu", name: "Nathan Jibulu", role: "hooker", age: 24, nation: "England", ovr: 71 },
    { id: "ethan-caine", name: "Ethan Caine", role: "hooker", age: 21, nation: "England", ovr: 64 },
    // Locks
    { id: "ernst-van-rhyn", name: "Ernst van Rhyn", role: "lock", age: 27, nation: "South Africa", alt: ["flanker"], ovr: 79, overrides: { setPiece: 80 } },
    { id: "hyron-andrews", name: "Hyron Andrews", role: "lock", age: 28, nation: "South Africa", ovr: 74 },
    { id: "ben-bamber", name: "Ben Bamber", role: "lock", age: 24, nation: "England", ovr: 73 },
    { id: "rouban-birch", name: "Rouban Birch", role: "lock", age: 22, nation: "England", ovr: 66 },
    // Back row
    { id: "tom-curry", name: "Tom Curry", role: "flanker", age: 27, nation: "England", ovr: 88, overrides: { breakdown: 91, defence: 91, carry: 85 } },
    { id: "ben-curry", name: "Ben Curry", role: "flanker", age: 27, nation: "England", ovr: 83, overrides: { breakdown: 86, defence: 86 } },
    { id: "jacques-vermeulen", name: "Jacques Vermeulen", role: "flanker", age: 30, nation: "South Africa", ovr: 79, overrides: { breakdown: 82 } },
    { id: "sam-dugdale", name: "Sam Dugdale", role: "flanker", age: 24, nation: "England", ovr: 74 },
    { id: "huw-davies-sale", name: "Huw Davies", role: "flanker", age: 22, nation: "Wales", ovr: 68 },
    { id: "dan-du-preez", name: "Dan du Preez", role: "number8", age: 30, nation: "South Africa", ovr: 81, overrides: { carry: 86 } },
    // Scrum-halves
    { id: "raffi-quirke", name: "Raffi Quirke", role: "scrumhalf", age: 24, nation: "England", ovr: 80, overrides: { pace: 86 } },
    { id: "gus-warr", name: "Gus Warr", role: "scrumhalf", age: 26, nation: "Scotland", ovr: 76 },
    { id: "will-wootton", name: "Will Wootton", role: "scrumhalf", age: 23, nation: "Ireland", ovr: 69 },
    { id: "nye-thomas", name: "Nye Thomas", role: "scrumhalf", age: 21, nation: "England", ovr: 65 },
    // Fly-halves
    { id: "george-ford", name: "George Ford", role: "flyhalf", age: 32, nation: "England", ovr: 86, overrides: { gameManage: 90, goalKick: 89, kick: 88 } },
    { id: "rob-du-preez", name: "Robert du Preez", role: "flyhalf", age: 32, nation: "South Africa", alt: ["centre"], ovr: 74, overrides: { goalKick: 79 } },
    // Centres
    { id: "rekeiti-maasi-white", name: "Rekeiti Ma'asi-White", role: "centre", age: 22, nation: "England", ovr: 79, overrides: { carry: 83, pace: 82 } },
    { id: "marius-louw", name: "Marius Louw", role: "centre", age: 29, nation: "South Africa", ovr: 77, overrides: { defence: 80 } },
    { id: "sam-bedlow", name: "Sam Bedlow", role: "centre", age: 26, nation: "England", alt: ["flyhalf"], ovr: 74 },
    { id: "tom-curtis", name: "Tom Curtis", role: "centre", age: 24, nation: "England", alt: ["flyhalf", "fullback"], ovr: 72 },
    { id: "joe-bedlow", name: "Joe Bedlow", role: "centre", age: 22, nation: "England", ovr: 68 },
    // Wings
    { id: "tom-roebuck", name: "Tom Roebuck", role: "wing", age: 24, nation: "England", ovr: 83, overrides: { pace: 86, carry: 82 } },
    { id: "arron-reed", name: "Arron Reed", role: "wing", age: 24, nation: "Scotland", ovr: 79, overrides: { pace: 90 } },
    { id: "tom-oflaherty", name: "Tom O'Flaherty", role: "wing", age: 30, nation: "England", ovr: 76, overrides: { pace: 87 } },
    { id: "obi-ene", name: "Obi Ene", role: "wing", age: 21, nation: "England", ovr: 68 },
    { id: "alex-wills", name: "Alex Wills", role: "wing", age: 22, nation: "England", ovr: 66 },
    // Fullbacks
    { id: "joe-carpenter", name: "Joe Carpenter", role: "fullback", age: 24, nation: "England", ovr: 79, overrides: { handling: 81, defence: 80 } },
    { id: "luke-james", name: "Luke James", role: "fullback", age: 27, nation: "England", alt: ["centre"], ovr: 75 },
  ],
};
