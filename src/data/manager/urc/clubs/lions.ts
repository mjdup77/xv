// Lions — researched 2025-26 BKT URC squad (7th, first playoffs, SA Shield
// winners; Ivan van Rooyen URC Coach of the Year).
// Source: Wikipedia "squad for the 2025-26 United Rugby Championship" list
// (the URC squad, NOT the Golden Lions Currie Cup roster). In-season
// departures (Lyons, Wolhuter loan, de Leeuw loan) excluded per the page
// footnote. Snapshot: 2 July 2026.
// Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "lions",
  name: "Lions",
  shortName: "Lions",
  abbr: "LIO",
  city: "Johannesburg",
  stadium: "Ellis Park Stadium",
  colors: ["#e4002b", "#ffffff"],
  players: [
    // Props
    { id: "asenathi-ntlabakanye", name: "Asenathi Ntlabakanye", role: "prop", age: 26, nation: "South Africa", ovr: 80, overrides: { setPiece: 83, carry: 80 } },
    { id: "juan-schoeman", name: "Juan Schoeman", role: "prop", age: 29, nation: "South Africa", ovr: 75 },
    { id: "sj-kotze", name: "SJ Kotze", role: "prop", age: 24, nation: "South Africa", ovr: 74 },
    { id: "morgan-naude", name: "Morgan Naudé", role: "prop", age: 27, nation: "South Africa", ovr: 73 },
    { id: "conraad-van-vuuren", name: "Conraad van Vuuren", role: "prop", age: 26, nation: "South Africa", ovr: 72 },
    { id: "corne-weilbach", name: "Corné Weilbach", role: "prop", age: 24, nation: "South Africa", ovr: 72 },
    { id: "stian-de-bruyn", name: "Stian de Bruyn", role: "prop", age: 24, nation: "South Africa", ovr: 70 },
    { id: "eddie-davids", name: "Eddie Davids", role: "prop", age: 22, nation: "South Africa", ovr: 68 },
    // Hookers
    { id: "pj-botha", name: "PJ Botha", role: "hooker", age: 30, nation: "South Africa", ovr: 76 },
    { id: "franco-marais", name: "Franco Marais", role: "hooker", age: 34, nation: "South Africa", ovr: 73 },
    { id: "morne-brandon", name: "Morné Brandon", role: "hooker", age: 24, nation: "South Africa", ovr: 72 },
    { id: "marno-grobbelaar", name: "Marno Grobbelaar", role: "hooker", age: 22, nation: "South Africa", ovr: 68 },
    // Locks
    { id: "darrien-landsberg", name: "Darrien Landsberg", role: "lock", age: 26, nation: "South Africa", ovr: 76 },
    { id: "etienne-oosthuizen-lio", name: "Etienne Oosthuizen", role: "lock", age: 24, nation: "South Africa", ovr: 75 },
    { id: "reinhard-nothnagel", name: "Reinhard Nothnagel", role: "lock", age: 26, nation: "South Africa", ovr: 73 },
    { id: "ruben-schoeman", name: "Ruben Schoeman", role: "lock", age: 27, nation: "South Africa", ovr: 72 },
    { id: "ruan-delport", name: "Ruan Delport", role: "lock", age: 24, nation: "South Africa", ovr: 69 },
    { id: "tiaan-wessels", name: "Tiaan Wessels", role: "lock", age: 23, nation: "South Africa", ovr: 68 },
    // Back row
    { id: "francke-horn", name: "Francke Horn", role: "number8", age: 27, nation: "South Africa", ovr: 81, overrides: { carry: 84 } },
    { id: "ruan-venter-lio", name: "Ruan Venter", role: "flanker", age: 27, nation: "South Africa", ovr: 81, overrides: { breakdown: 83, defence: 82 } },
    { id: "jc-pretorius", name: "JC Pretorius", role: "flanker", age: 26, nation: "South Africa", ovr: 78, overrides: { pace: 83, breakdown: 80 } },
    { id: "jarod-cairns", name: "Jarod Cairns", role: "flanker", age: 25, nation: "South Africa", ovr: 75 },
    { id: "wj-steenkamp", name: "WJ Steenkamp", role: "flanker", age: 25, nation: "South Africa", ovr: 74 },
    { id: "renzo-du-plessis", name: "Renzo du Plessis", role: "flanker", age: 24, nation: "South Africa", ovr: 72 },
    { id: "izan-esterhuizen", name: "Izan Esterhuizen", role: "number8", age: 22, nation: "South Africa", ovr: 71 },
    { id: "batho-hlekani", name: "Batho Hlekani", role: "number8", age: 21, nation: "South Africa", ovr: 70 },
    { id: "siba-mahashe", name: "Siba Mahashe", role: "flanker", age: 24, nation: "South Africa", ovr: 74, overrides: { pace: 80 } },
    // Scrum-halves
    { id: "morne-van-den-berg", name: "Morné van den Berg", role: "scrumhalf", age: 27, nation: "South Africa", ovr: 84, overrides: { pace: 84, handling: 84 } },
    { id: "nico-steyn", name: "Nico Steyn", role: "scrumhalf", age: 24, nation: "South Africa", ovr: 74 },
    { id: "haashim-pead", name: "Haashim Pead", role: "scrumhalf", age: 20, nation: "South Africa", ovr: 74, overrides: { pace: 84 } },
    { id: "layton-horn", name: "Layton Horn", role: "scrumhalf", age: 21, nation: "South Africa", ovr: 67 },
    // Fly-halves
    { id: "chris-smith-lio", name: "Chris Smith", role: "flyhalf", age: 30, nation: "South Africa", ovr: 79, overrides: { goalKick: 87, gameManage: 80 } },
    { id: "lubabalo-dobela", name: "Lubabalo Dobela", role: "flyhalf", age: 23, nation: "South Africa", ovr: 74, overrides: { goalKick: 78 } },
    { id: "sam-francis-lio", name: "Sam Francis", role: "flyhalf", age: 23, nation: "South Africa", ovr: 69 },
    // Centres
    { id: "henco-van-wyk", name: "Henco van Wyk", role: "centre", age: 24, nation: "South Africa", ovr: 81, overrides: { carry: 83, pace: 82 } },
    { id: "erich-cronje", name: "Erich Cronjé", role: "centre", age: 26, nation: "South Africa", ovr: 76 },
    { id: "bronson-mills", name: "Bronson Mills", role: "centre", age: 23, nation: "South Africa", ovr: 74 },
    { id: "rynhardt-jonker", name: "Rynhardt Jonker", role: "centre", age: 24, nation: "South Africa", ovr: 71 },
    { id: "likhona-finca", name: "Likhona Finca", role: "centre", age: 22, nation: "South Africa", ovr: 69 },
    // Back three
    { id: "eduan-keyter", name: "Eduan Keyter", role: "wing", age: 27, nation: "South Africa", ovr: 76, overrides: { pace: 84 } },
    { id: "angelo-davids", name: "Angelo Davids", role: "wing", age: 26, nation: "South Africa", ovr: 76, overrides: { pace: 87 } },
    { id: "richard-kriel", name: "Richard Kriel", role: "wing", age: 25, nation: "South Africa", alt: ["fullback"], ovr: 75 },
    { id: "kelly-mpeku", name: "Kelly Mpeku", role: "wing", age: 24, nation: "South Africa", ovr: 75, overrides: { pace: 85 } },
    { id: "rabz-maxwane", name: "Rabz Maxwane", role: "wing", age: 29, nation: "South Africa", ovr: 73, overrides: { pace: 84 } },
    { id: "quan-horn", name: "Quan Horn", role: "fullback", age: 25, nation: "South Africa", alt: ["wing"], ovr: 84, overrides: { pace: 87, defence: 83 } },
    { id: "gianni-lombard", name: "Gianni Lombard", role: "fullback", age: 25, nation: "South Africa", alt: ["flyhalf"], ovr: 74 },
    { id: "tapiwa-mafura", name: "Tapiwa Mafura", role: "fullback", age: 28, nation: "Zimbabwe", ovr: 72 },
  ],
};
