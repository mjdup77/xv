// Benetton Rugby — researched 2025-26 BKT URC squad (13th).
// Source: Wikipedia current-squad table (already a 2025-26 snapshot; the
// 2026-27 outgoings Menoncello/Snyman/Gallo/Fekitoa/Roger etc. were all
// Benetton players during 2025-26 and are kept).
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "benetton",
  name: "Benetton Rugby",
  shortName: "Benetton",
  abbr: "BEN",
  city: "Treviso",
  stadium: "Stadio Comunale di Monigo",
  colors: ["#00563f", "#ffffff"],
  players: [
    // Props
    { id: "thomas-gallo", name: "Thomas Gallo", role: "prop", age: 26, nation: "Argentina", ovr: 79, overrides: { carry: 81 } },
    { id: "simone-ferrari", name: "Simone Ferrari", role: "prop", age: 32, nation: "Italy", ovr: 77, overrides: { setPiece: 80 } },
    { id: "ivan-nemer", name: "Ivan Nemer", role: "prop", age: 27, nation: "Italy", ovr: 75 },
    { id: "giosue-zilocchi", name: "Giosuè Zilocchi", role: "prop", age: 28, nation: "Italy", ovr: 74 },
    { id: "tiziano-pasquali", name: "Tiziano Pasquali", role: "prop", age: 29, nation: "Italy", ovr: 72 },
    { id: "nahuel-tetaz-chaparro", name: "Nahuel Tetaz Chaparro", role: "prop", age: 35, nation: "Argentina", ovr: 71 },
    { id: "mirco-spagnolo", name: "Mirco Spagnolo", role: "prop", age: 22, nation: "Italy", ovr: 70 },
    { id: "destiny-aminu", name: "Destiny Aminu", role: "prop", age: 21, nation: "Italy", ovr: 66 },
    { id: "marcos-gallorini", name: "Marcos Gallorini", role: "prop", age: 22, nation: "Italy", ovr: 65 },
    // Hookers
    { id: "siua-maile", name: "Siua Maile", role: "hooker", age: 26, nation: "Tonga", ovr: 76 },
    { id: "bautista-bernasconi", name: "Bautista Bernasconi", role: "hooker", age: 23, nation: "Argentina", ovr: 74 },
    { id: "nicholas-gasperini", name: "Nicholas Gasperini", role: "hooker", age: 22, nation: "Italy", ovr: 70 },
    // Locks
    { id: "federico-ruzza", name: "Federico Ruzza", role: "lock", age: 30, nation: "Italy", ovr: 82, overrides: { setPiece: 84, handling: 80 } },
    { id: "niccolo-cannone", name: "Niccolò Cannone", role: "lock", age: 27, nation: "Italy", ovr: 79 },
    { id: "eli-snyman", name: "Eli Snyman", role: "lock", age: 30, nation: "South Africa", ovr: 76 },
    { id: "scott-scrafton", name: "Scott Scrafton", role: "lock", age: 31, nation: "New Zealand", ovr: 73 },
    { id: "riccardo-favretto", name: "Riccardo Favretto", role: "lock", age: 22, nation: "Italy", alt: ["flanker"], ovr: 71 },
    // Back row
    { id: "michele-lamaro", name: "Michele Lamaro", role: "flanker", age: 27, nation: "Italy", ovr: 83, overrides: { defence: 87, breakdown: 84 } },
    { id: "sebastian-negri", name: "Sebastian Negri", role: "flanker", age: 31, nation: "Italy", ovr: 80, overrides: { carry: 83 } },
    { id: "manuel-zuliani", name: "Manuel Zuliani", role: "flanker", age: 25, nation: "Italy", ovr: 78, overrides: { breakdown: 82 } },
    { id: "lorenzo-cannone", name: "Lorenzo Cannone", role: "number8", age: 24, nation: "Italy", ovr: 78, overrides: { carry: 80 } },
    { id: "alessandro-izekor", name: "Alessandro Izekor", role: "number8", age: 24, nation: "Italy", alt: ["flanker", "lock"], ovr: 75 },
    { id: "sootala-faasoo", name: "So'otala Fa'aso'o", role: "number8", age: 27, nation: "Samoa", ovr: 74 },
    { id: "giulio-marini", name: "Giulio Marini", role: "flanker", age: 23, nation: "Italy", ovr: 70 },
    { id: "jadin-kingi", name: "Jadin Kingi", role: "flanker", age: 21, nation: "Italy", ovr: 66 },
    // Scrum-halves
    { id: "alessandro-garbisi", name: "Alessandro Garbisi", role: "scrumhalf", age: 24, nation: "Italy", ovr: 76 },
    { id: "andy-uren", name: "Andy Uren", role: "scrumhalf", age: 29, nation: "England", ovr: 74 },
    // Fly-halves
    { id: "jacob-umaga", name: "Jacob Umaga", role: "flyhalf", age: 27, nation: "Italy", ovr: 78, overrides: { goalKick: 83 } },
    { id: "nicolas-roger", name: "Nicolás Roger", role: "flyhalf", age: 25, nation: "Argentina", ovr: 72 },
    // Centres
    { id: "tommaso-menoncello", name: "Tommaso Menoncello", role: "centre", age: 22, nation: "Italy", alt: ["wing"], ovr: 86, overrides: { carry: 88, pace: 87 } },
    { id: "malakai-fekitoa", name: "Malakai Fekitoa", role: "centre", age: 33, nation: "Tonga", ovr: 77, overrides: { defence: 80 } },
    { id: "leonardo-marin", name: "Leonardo Marin", role: "centre", age: 26, nation: "Italy", alt: ["flyhalf"], ovr: 75 },
    { id: "tomas-medina", name: "Tomás Medina", role: "centre", age: 23, nation: "Argentina", ovr: 71 },
    { id: "federico-zanandrea", name: "Federico Zanandrea", role: "centre", age: 21, nation: "Italy", ovr: 68 },
    // Back three
    { id: "louis-lynagh", name: "Louis Lynagh", role: "wing", age: 24, nation: "Italy", ovr: 81, overrides: { pace: 85, handling: 81 } },
    { id: "ignacio-mendy", name: "Ignacio Mendy", role: "wing", age: 24, nation: "Argentina", ovr: 77, overrides: { pace: 84 } },
    { id: "onisi-ratave", name: "Onisi Ratave", role: "wing", age: 27, nation: "Fiji", ovr: 77, overrides: { pace: 86, carry: 80 } },
    { id: "paolo-odogwu", name: "Paolo Odogwu", role: "wing", age: 28, nation: "Italy", alt: ["centre"], ovr: 76, overrides: { carry: 81 } },
    { id: "matt-gallagher", name: "Matt Gallagher", role: "fullback", age: 29, nation: "Ireland", ovr: 75 },
    { id: "rhyno-smith", name: "Rhyno Smith", role: "fullback", age: 29, nation: "South Africa", ovr: 74, overrides: { goalKick: 78 } },
  ],
};
