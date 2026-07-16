// Bath Rugby — researched 2025-26 Gallagher PREM squad.
// Source: Bath Rugby official squad announcement (25 Aug 2025) via Wikipedia,
// cross-checked against the 2025-26 season records. Snapshot: 2025-26 season.
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "bath",
  name: "Bath Rugby",
  shortName: "Bath",
  abbr: "BAT",
  city: "Bath",
  stadium: "The Recreation Ground",
  colors: ["#003c71", "#8b0d32"],
  players: [
    // Props
    { id: "thomas-du-toit", name: "Thomas du Toit", role: "prop", age: 30, nation: "South Africa", ovr: 86, overrides: { setPiece: 89, carry: 82 } },
    { id: "will-stuart", name: "Will Stuart", role: "prop", age: 29, nation: "England", ovr: 84, overrides: { setPiece: 87 } },
    { id: "beno-obano", name: "Beno Obano", role: "prop", age: 30, nation: "England", ovr: 82, overrides: { setPiece: 84, carry: 80 } },
    { id: "francois-van-wyk", name: "Francois van Wyk", role: "prop", age: 34, nation: "South Africa", ovr: 76 },
    { id: "archie-griffin", name: "Archie Griffin", role: "prop", age: 24, nation: "Wales", ovr: 75 },
    { id: "mikey-summerfield", name: "Mikey Summerfield", role: "prop", age: 21, nation: "England", ovr: 66 },
    { id: "kieran-verden", name: "Kieran Verden", role: "prop", age: 20, nation: "England", ovr: 64 },
    // Hookers
    { id: "tom-dunn", name: "Tom Dunn", role: "hooker", age: 32, nation: "England", ovr: 79, overrides: { breakdown: 82 } },
    { id: "dan-frost", name: "Dan Frost", role: "hooker", age: 26, nation: "England", ovr: 78 },
    { id: "jasper-spandler", name: "Jasper Spandler", role: "hooker", age: 21, nation: "England", ovr: 67 },
    // Locks
    { id: "charlie-ewels", name: "Charlie Ewels", role: "lock", age: 30, nation: "England", ovr: 81, overrides: { setPiece: 84, defence: 84 } },
    { id: "ross-molony", name: "Ross Molony", role: "lock", age: 31, nation: "Ireland", ovr: 78 },
    { id: "quinn-roux", name: "Quinn Roux", role: "lock", age: 34, nation: "Ireland", ovr: 74 },
    { id: "ewan-richards", name: "Ewan Richards", role: "lock", age: 23, nation: "England", alt: ["flanker"], ovr: 74 },
    // Back row
    { id: "sam-underhill", name: "Sam Underhill", role: "flanker", age: 29, nation: "England", ovr: 86, overrides: { breakdown: 89, defence: 91 } },
    { id: "ted-hill", name: "Ted Hill", role: "flanker", age: 26, nation: "England", alt: ["lock", "number8"], ovr: 83, overrides: { carry: 86 } },
    { id: "guy-pepper", name: "Guy Pepper", role: "flanker", age: 22, nation: "England", ovr: 82, overrides: { breakdown: 86 } },
    { id: "josh-bayliss", name: "Josh Bayliss", role: "flanker", age: 27, nation: "Scotland", alt: ["number8"], ovr: 78 },
    { id: "miles-reid", name: "Miles Reid", role: "flanker", age: 26, nation: "England", ovr: 78 },
    { id: "thompson-cowan", name: "Thompson Cowan", role: "flanker", age: 21, nation: "Wales", ovr: 68 },
    { id: "alfie-barbeary", name: "Alfie Barbeary", role: "number8", age: 25, nation: "England", alt: ["hooker"], ovr: 82, overrides: { carry: 88 } },
    { id: "jaco-coetzee", name: "Jaco Coetzee", role: "number8", age: 29, nation: "South Africa", alt: ["flanker"], ovr: 78 },
    { id: "ethan-staddon", name: "Ethan Staddon", role: "number8", age: 21, nation: "England", alt: ["flanker"], ovr: 70 },
    // Scrum-halves
    { id: "ben-spencer", name: "Ben Spencer", role: "scrumhalf", age: 33, nation: "England", ovr: 82, overrides: { gameManage: 85, kick: 82 } },
    { id: "bernard-van-der-linde", name: "Bernard van der Linde", role: "scrumhalf", age: 24, nation: "South Africa", ovr: 71 },
    { id: "tom-carr-smith", name: "Tom Carr-Smith", role: "scrumhalf", age: 21, nation: "England", ovr: 66 },
    // Fly-halves
    { id: "finn-russell", name: "Finn Russell", role: "flyhalf", age: 33, nation: "Scotland", ovr: 91, overrides: { goalKick: 90, handling: 93, gameManage: 92, kick: 91 } },
    { id: "ciaran-donoghue", name: "Ciaran Donoghue", role: "flyhalf", age: 21, nation: "England", alt: ["fullback"], ovr: 75, overrides: { goalKick: 81 } },
    { id: "sam-harris-bath", name: "Sam Harris", role: "flyhalf", age: 20, nation: "England", alt: ["centre"], ovr: 67 },
    // Centres
    { id: "ollie-lawrence", name: "Ollie Lawrence", role: "centre", age: 26, nation: "England", ovr: 87, overrides: { carry: 91, defence: 86 } },
    { id: "cameron-redpath", name: "Cameron Redpath", role: "centre", age: 25, nation: "Scotland", ovr: 81, overrides: { handling: 85 } },
    { id: "max-ojomoh", name: "Max Ojomoh", role: "centre", age: 24, nation: "England", alt: ["flyhalf"], ovr: 78 },
    { id: "chris-harris", name: "Chris Harris", role: "centre", age: 34, nation: "Scotland", ovr: 76, overrides: { defence: 84 } },
    { id: "will-butt", name: "Will Butt", role: "centre", age: 25, nation: "England", alt: ["wing"], ovr: 75 },
    { id: "louie-hennessey", name: "Louie Hennessey", role: "centre", age: 21, nation: "Wales", ovr: 70 },
    // Back three
    { id: "joe-cokanasiga", name: "Joe Cokanasiga", role: "wing", age: 27, nation: "England", ovr: 81, overrides: { carry: 87, pace: 86 } },
    { id: "henry-arundell", name: "Henry Arundell", role: "wing", age: 22, nation: "England", alt: ["fullback"], ovr: 82, overrides: { pace: 92 } },
    { id: "will-muir", name: "Will Muir", role: "wing", age: 29, nation: "England", ovr: 79, overrides: { pace: 86 } },
    { id: "santiago-carreras", name: "Santiago Carreras", role: "fullback", age: 27, nation: "Argentina", alt: ["flyhalf", "wing"], ovr: 83, overrides: { handling: 86, pace: 85 } },
    { id: "tom-de-glanville", name: "Tom de Glanville", role: "fullback", age: 25, nation: "England", alt: ["wing"], ovr: 80 },
    { id: "austin-emens", name: "Austin Emens", role: "fullback", age: 19, nation: "England", alt: ["wing"], ovr: 63 },
  ],
};
