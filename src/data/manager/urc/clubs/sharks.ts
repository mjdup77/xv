// Sharks — researched 2025-26 BKT URC squad (10th).
// Source: Wikipedia "squad for the 2025-26 United Rugby Championship" list
// (the URC squad, NOT the Currie Cup roster). Lukhanyo Am left for Japan
// mid-season but started early rounds and is kept per the played-minutes
// rule; other in-season departures (Bleuler, Dlamini, Hlekani) excluded.
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "sharks",
  name: "Hollywoodbets Sharks",
  shortName: "Sharks",
  abbr: "SHA",
  city: "Durban",
  stadium: "Kings Park Stadium",
  colors: ["#000000", "#ffffff"],
  players: [
    // Props
    { id: "ox-nche", name: "Ox Nché", role: "prop", age: 30, nation: "South Africa", ovr: 87, overrides: { setPiece: 92 } },
    { id: "vincent-koch", name: "Vincent Koch", role: "prop", age: 35, nation: "South Africa", ovr: 81, overrides: { setPiece: 85 } },
    { id: "trevor-nyakane", name: "Trevor Nyakane", role: "prop", age: 36, nation: "South Africa", ovr: 77, overrides: { setPiece: 82 } },
    { id: "ruan-dreyer", name: "Ruan Dreyer", role: "prop", age: 35, nation: "South Africa", ovr: 73 },
    { id: "lee-marvin-mazibuko", name: "Lee-Marvin Mazibuko", role: "prop", age: 27, nation: "South Africa", ovr: 73 },
    { id: "hanro-jacobs", name: "Hanro Jacobs", role: "prop", age: 24, nation: "South Africa", ovr: 71 },
    { id: "simphiwe-matanzima", name: "Simphiwe Matanzima", role: "prop", age: 27, nation: "South Africa", ovr: 71 },
    { id: "cameron-dawson", name: "Cameron Dawson", role: "prop", age: 26, nation: "South Africa", ovr: 70 },
    // Hookers
    { id: "bongi-mbonambi", name: "Bongi Mbonambi", role: "hooker", age: 34, nation: "South Africa", ovr: 81, overrides: { setPiece: 85 } },
    { id: "fez-mbatha", name: "Fez Mbatha", role: "hooker", age: 26, nation: "South Africa", ovr: 76 },
    { id: "kerron-van-vuuren", name: "Kerron van Vuuren", role: "hooker", age: 28, nation: "South Africa", ovr: 73 },
    { id: "ethan-bester", name: "Ethan Bester", role: "hooker", age: 21, nation: "South Africa", ovr: 68 },
    // Locks
    { id: "eben-etzebeth", name: "Eben Etzebeth", role: "lock", age: 33, nation: "South Africa", ovr: 88, overrides: { setPiece: 90, defence: 91 } },
    { id: "jason-jenkins", name: "Jason Jenkins", role: "lock", age: 30, nation: "South Africa", ovr: 79, overrides: { carry: 81 } },
    { id: "emile-van-heerden", name: "Emile van Heerden", role: "lock", age: 27, nation: "South Africa", ovr: 77 },
    { id: "marvin-orie", name: "Marvin Orie", role: "lock", age: 32, nation: "South Africa", ovr: 76, overrides: { setPiece: 80 } },
    { id: "coetzee-le-roux", name: "Coetzee le Roux", role: "lock", age: 27, nation: "South Africa", ovr: 72 },
    { id: "thomas-dyer", name: "Thomas Dyer", role: "lock", age: 24, nation: "South Africa", ovr: 70 },
    // Back row
    { id: "siya-kolisi", name: "Siya Kolisi", role: "flanker", age: 34, nation: "South Africa", ovr: 85, overrides: { defence: 87, carry: 85 } },
    { id: "vincent-tshituka", name: "Vincent Tshituka", role: "flanker", age: 26, nation: "South Africa", alt: ["number8"], ovr: 83, overrides: { carry: 85 } },
    { id: "phepsi-buthelezi", name: "Phepsi Buthelezi", role: "number8", age: 26, nation: "South Africa", ovr: 80, overrides: { carry: 82 } },
    { id: "emmanuel-tshituka", name: "Emmanuel Tshituka", role: "number8", age: 24, nation: "South Africa", alt: ["flanker"], ovr: 78 },
    { id: "tinotenda-mavesere", name: "Tinotenda Mavesere", role: "flanker", age: 27, nation: "Zimbabwe", ovr: 74 },
    { id: "jannes-potgieter", name: "Jannes Potgieter", role: "number8", age: 26, nation: "South Africa", ovr: 73 },
    { id: "nick-hatton", name: "Nick Hatton", role: "flanker", age: 23, nation: "South Africa", ovr: 72 },
    { id: "meno-barnard", name: "Meno Barnard", role: "flanker", age: 23, nation: "South Africa", ovr: 71 },
    // Scrum-halves
    { id: "grant-williams", name: "Grant Williams", role: "scrumhalf", age: 29, nation: "South Africa", ovr: 84, overrides: { pace: 88 } },
    { id: "jaden-hendrikse", name: "Jaden Hendrikse", role: "scrumhalf", age: 25, nation: "South Africa", ovr: 80, overrides: { gameManage: 80 } },
    { id: "ross-braude", name: "Ross Braude", role: "scrumhalf", age: 25, nation: "South Africa", ovr: 71 },
    // Fly-halves
    { id: "jordan-hendrikse", name: "Jordan Hendrikse", role: "flyhalf", age: 24, nation: "South Africa", ovr: 79, overrides: { goalKick: 83 } },
    { id: "siya-masuku", name: "Siya Masuku", role: "flyhalf", age: 29, nation: "South Africa", ovr: 75, overrides: { goalKick: 80 } },
    { id: "vusi-moyo", name: "Vusi Moyo", role: "flyhalf", age: 24, nation: "South Africa", ovr: 72, overrides: { goalKick: 78 } },
    // Centres
    { id: "andre-esterhuizen", name: "André Esterhuizen", role: "centre", age: 31, nation: "South Africa", ovr: 85, overrides: { carry: 89, defence: 86 } },
    { id: "lukhanyo-am", name: "Lukhanyo Am", role: "centre", age: 31, nation: "South Africa", ovr: 82, overrides: { defence: 87, handling: 84 } },
    { id: "ethan-hooker", name: "Ethan Hooker", role: "centre", age: 22, nation: "South Africa", alt: ["wing"], ovr: 78 },
    { id: "francois-venter", name: "Francois Venter", role: "centre", age: 34, nation: "South Africa", ovr: 74 },
    { id: "jurenzo-julius", name: "Jurenzo Julius", role: "centre", age: 24, nation: "South Africa", alt: ["wing"], ovr: 74 },
    { id: "diego-appollis", name: "Diego Appollis", role: "centre", age: 22, nation: "South Africa", ovr: 71 },
    // Back three
    { id: "makazole-mapimpi", name: "Makazole Mapimpi", role: "wing", age: 35, nation: "South Africa", ovr: 82, overrides: { pace: 86 } },
    { id: "edwill-van-der-merwe", name: "Edwill van der Merwe", role: "wing", age: 29, nation: "South Africa", ovr: 79, overrides: { pace: 85 } },
    { id: "yaw-penxe", name: "Yaw Penxe", role: "wing", age: 28, nation: "South Africa", ovr: 76, overrides: { pace: 84 } },
    { id: "marnus-potgieter", name: "Marnus Potgieter", role: "wing", age: 26, nation: "South Africa", ovr: 73 },
    { id: "aphelele-fassi", name: "Aphelele Fassi", role: "fullback", age: 27, nation: "South Africa", ovr: 84, overrides: { pace: 87, kick: 84 } },
    { id: "zekhethelo-siyaya", name: "Zekhethelo Siyaya", role: "fullback", age: 23, nation: "South Africa", alt: ["wing"], ovr: 70 },
  ],
};
