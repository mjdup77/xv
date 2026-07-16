// Zebre Parma — researched 2025-26 BKT URC squad (16th, wooden spoon; the
// league's weakest squad by design of the rating bands).
// Source: Wikipedia current-squad table (already a 2025-26 snapshot; the
// 2026-27 outgoings Pieretto/Lucchin/Morisi/Garcia/Faissal/Roger Farias etc.
// were all Zebre players during 2025-26 and are kept).
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "zebre",
  name: "Zebre Parma",
  shortName: "Zebre",
  abbr: "ZEB",
  city: "Parma",
  stadium: "Stadio Sergio Lanfranchi",
  colors: ["#ffffff", "#000000"],
  players: [
    // Props
    { id: "ion-neculai", name: "Ion Neculai", role: "prop", age: 24, nation: "Italy", ovr: 74, overrides: { setPiece: 76 } },
    { id: "enrique-pieretto", name: "Enrique Pieretto", role: "prop", age: 31, nation: "Argentina", ovr: 72 },
    { id: "luca-rizzoli", name: "Luca Rizzoli", role: "prop", age: 24, nation: "Italy", ovr: 72 },
    { id: "muhamed-hasa", name: "Muhamed Hasa", role: "prop", age: 22, nation: "Italy", ovr: 70 },
    { id: "matteo-nocera", name: "Matteo Nocera", role: "prop", age: 22, nation: "Italy", ovr: 68 },
    { id: "juan-pitinari", name: "Juan Pitinari", role: "prop", age: 27, nation: "Argentina", ovr: 68 },
    { id: "paolo-buonfiglio", name: "Paolo Buonfiglio", role: "prop", age: 24, nation: "Italy", ovr: 66 },
    { id: "luca-franceschetto", name: "Luca Franceschetto", role: "prop", age: 22, nation: "Italy", ovr: 64 },
    // Hookers
    { id: "tommaso-di-bartolomeo", name: "Tommaso Di Bartolomeo", role: "hooker", age: 24, nation: "Italy", ovr: 72 },
    { id: "giovanni-quattrini", name: "Giovanni Quattrini", role: "hooker", age: 23, nation: "Italy", ovr: 69 },
    { id: "shilo-klein", name: "Shilo Klein", role: "hooker", age: 26, nation: "Israel", ovr: 67 },
    { id: "giampietro-ribaldi", name: "Giampietro Ribaldi", role: "hooker", age: 22, nation: "Italy", ovr: 65 },
    // Locks
    { id: "leonard-krumov", name: "Leonard Krumov", role: "lock", age: 24, nation: "Italy", ovr: 71 },
    { id: "matteo-canali", name: "Matteo Canali", role: "lock", age: 23, nation: "Italy", ovr: 69 },
    { id: "franco-carrera", name: "Franco Carrera", role: "lock", age: 25, nation: "Argentina", ovr: 68 },
    { id: "alessandro-ortombina", name: "Alessandro Ortombina", role: "lock", age: 21, nation: "Italy", ovr: 65 },
    { id: "francesco-ruffolo", name: "Francesco Ruffolo", role: "lock", age: 25, nation: "Italy", ovr: 64 },
    // Back row
    { id: "giovanni-licata", name: "Giovanni Licata", role: "flanker", age: 27, nation: "Italy", alt: ["number8"], ovr: 76, overrides: { carry: 78 } },
    { id: "bautista-stavile", name: "Bautista Stavile", role: "number8", age: 24, nation: "Argentina", ovr: 74, overrides: { carry: 77 } },
    { id: "davide-ruggeri", name: "Davide Ruggeri", role: "flanker", age: 23, nation: "Italy", ovr: 71 },
    { id: "david-odiase", name: "David Odiase", role: "flanker", age: 23, nation: "Italy", ovr: 70 },
    { id: "giacomo-ferrari-zeb", name: "Giacomo Ferrari", role: "flanker", age: 26, nation: "Italy", alt: ["number8"], ovr: 69 },
    { id: "samuele-locatelli", name: "Samuele Locatelli", role: "number8", age: 22, nation: "Italy", ovr: 66 },
    { id: "iacopo-bianchi", name: "Iacopo Bianchi", role: "flanker", age: 25, nation: "Italy", ovr: 66 },
    { id: "guido-volpi", name: "Guido Volpi", role: "flanker", age: 24, nation: "Argentina", ovr: 65 },
    // Scrum-halves
    { id: "alessandro-fusco", name: "Alessandro Fusco", role: "scrumhalf", age: 25, nation: "Italy", ovr: 74 },
    { id: "thomas-dominguez", name: "Thomas Dominguez", role: "scrumhalf", age: 23, nation: "Argentina", ovr: 71 },
    { id: "gonzalo-garcia-zeb", name: "Gonzalo García", role: "scrumhalf", age: 31, nation: "Italy", ovr: 69 },
    // Fly-halves
    { id: "giacomo-da-re", name: "Giacomo Da Re", role: "flyhalf", age: 26, nation: "Italy", ovr: 73, overrides: { goalKick: 78 } },
    { id: "giovanni-montemauri", name: "Giovanni Montemauri", role: "flyhalf", age: 23, nation: "Italy", ovr: 70 },
    { id: "martin-roger-farias", name: "Martin Roger Farias", role: "flyhalf", age: 25, nation: "Argentina", ovr: 68 },
    // Centres
    { id: "giulio-bertaccini", name: "Giulio Bertaccini", role: "centre", age: 24, nation: "Italy", ovr: 73 },
    { id: "marco-zanon", name: "Marco Zanon", role: "centre", age: 28, nation: "Italy", ovr: 72 },
    { id: "enrico-lucchin", name: "Enrico Lucchin", role: "centre", age: 32, nation: "Italy", ovr: 68 },
    { id: "luca-morisi", name: "Luca Morisi", role: "centre", age: 34, nation: "Italy", ovr: 67 },
    { id: "damiano-mazza", name: "Damiano Mazza", role: "centre", age: 22, nation: "Italy", ovr: 65 },
    // Back three
    { id: "simone-gesi", name: "Simone Gesi", role: "wing", age: 24, nation: "Italy", ovr: 77, overrides: { pace: 85 } },
    { id: "jacopo-trulla", name: "Jacopo Trulla", role: "wing", age: 25, nation: "Italy", alt: ["fullback"], ovr: 74 },
    { id: "malik-faissal", name: "Malik Faissal", role: "wing", age: 20, nation: "Italy", ovr: 70, overrides: { pace: 82 } },
    { id: "albert-batista", name: "Albert Batista", role: "wing", age: 23, nation: "Italy", ovr: 66 },
    { id: "lorenzo-pani", name: "Lorenzo Pani", role: "fullback", age: 22, nation: "Italy", ovr: 73 },
    { id: "mirko-belloni", name: "Mirko Belloni", role: "fullback", age: 24, nation: "Italy", alt: ["flyhalf"], ovr: 70 },
  ],
};
