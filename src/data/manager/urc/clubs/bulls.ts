// Bulls — researched 2025-26 BKT URC squad (4th, Grand Final runners-up).
// Source: Wikipedia "squad for the 2025-26 United Rugby Championship" list
// (the URC squad, NOT the Blue Bulls Currie Cup roster). In-season departures
// (Dyantyi, Goosen, Serfontein retirements) excluded per the page footnote.
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "bulls",
  name: "Bulls",
  shortName: "Bulls",
  abbr: "BUL",
  city: "Pretoria",
  stadium: "Loftus Versfeld Stadium",
  colors: ["#00a3e0", "#e4002b"],
  players: [
    // Props
    { id: "wilco-louw", name: "Wilco Louw", role: "prop", age: 31, nation: "South Africa", ovr: 85, overrides: { setPiece: 89 } },
    { id: "gerhard-steenekamp", name: "Gerhard Steenekamp", role: "prop", age: 28, nation: "South Africa", ovr: 83, overrides: { setPiece: 85 } },
    { id: "jan-hendrik-wessels", name: "Jan-Hendrik Wessels", role: "prop", age: 24, nation: "South Africa", alt: ["hooker"], ovr: 82, overrides: { carry: 82 } },
    { id: "mornay-smith", name: "Mornay Smith", role: "prop", age: 29, nation: "South Africa", ovr: 76 },
    { id: "khutha-mchunu", name: "Khutha Mchunu", role: "prop", age: 27, nation: "South Africa", ovr: 75 },
    { id: "sti-sithole", name: "Sti Sithole", role: "prop", age: 28, nation: "South Africa", ovr: 74 },
    { id: "francois-klopper", name: "Francois Klopper", role: "prop", age: 24, nation: "South Africa", ovr: 73 },
    { id: "alulutho-tshakweni", name: "Alulutho Tshakweni", role: "prop", age: 25, nation: "South Africa", ovr: 72 },
    // Hookers
    { id: "johan-grobbelaar", name: "Johan Grobbelaar", role: "hooker", age: 27, nation: "South Africa", ovr: 84, overrides: { setPiece: 85, pace: 80 } },
    { id: "akker-van-der-merwe", name: "Akker van der Merwe", role: "hooker", age: 34, nation: "South Africa", ovr: 78, overrides: { carry: 81 } },
    { id: "juann-else", name: "Juann Else", role: "hooker", age: 23, nation: "South Africa", ovr: 72 },
    // Locks
    { id: "ruan-nortje", name: "Ruan Nortjé", role: "lock", age: 27, nation: "South Africa", ovr: 84, overrides: { setPiece: 86 } },
    { id: "cobus-wiese", name: "Cobus Wiese", role: "lock", age: 28, nation: "South Africa", ovr: 82, overrides: { carry: 82 } },
    { id: "jf-van-heerden", name: "JF van Heerden", role: "lock", age: 25, nation: "South Africa", ovr: 76 },
    { id: "ruan-vermaak", name: "Ruan Vermaak", role: "lock", age: 25, nation: "South Africa", ovr: 75 },
    { id: "nico-janse-van-rensburg", name: "Nico Janse van Rensburg", role: "lock", age: 31, nation: "South Africa", ovr: 74 },
    { id: "reinhardt-ludwig", name: "Reinhardt Ludwig", role: "lock", age: 22, nation: "South Africa", alt: ["flanker"], ovr: 73 },
    // Back row
    { id: "cameron-hanekom", name: "Cameron Hanekom", role: "number8", age: 23, nation: "South Africa", ovr: 85, overrides: { carry: 88, pace: 82 } },
    { id: "elrigh-louw", name: "Elrigh Louw", role: "number8", age: 26, nation: "South Africa", alt: ["flanker"], ovr: 83, overrides: { carry: 85 } },
    { id: "marco-van-staden", name: "Marco van Staden", role: "flanker", age: 30, nation: "South Africa", ovr: 82, overrides: { breakdown: 87 } },
    { id: "marcell-coetzee", name: "Marcell Coetzee", role: "flanker", age: 34, nation: "South Africa", alt: ["number8"], ovr: 80, overrides: { carry: 83 } },
    { id: "jeandre-rudolph", name: "Jeandré Rudolph", role: "number8", age: 28, nation: "South Africa", ovr: 77 },
    { id: "nizaam-carr", name: "Nizaam Carr", role: "number8", age: 34, nation: "South Africa", ovr: 75 },
    { id: "jannes-kirsten", name: "Jannes Kirsten", role: "flanker", age: 32, nation: "South Africa", ovr: 74 },
    { id: "mpilo-gumede", name: "Mpilo Gumede", role: "flanker", age: 23, nation: "South Africa", ovr: 73 },
    { id: "nama-xaba", name: "Nama Xaba", role: "flanker", age: 28, nation: "South Africa", ovr: 73, overrides: { breakdown: 77 } },
    // Scrum-halves
    { id: "embrose-papier", name: "Embrose Papier", role: "scrumhalf", age: 28, nation: "South Africa", ovr: 86, overrides: { pace: 87, handling: 85 } },
    { id: "zak-burger", name: "Zak Burger", role: "scrumhalf", age: 28, nation: "South Africa", ovr: 76 },
    { id: "paul-de-wet", name: "Paul de Wet", role: "scrumhalf", age: 28, nation: "South Africa", ovr: 75 },
    // Fly-halves
    { id: "handre-pollard", name: "Handré Pollard", role: "flyhalf", age: 31, nation: "South Africa", ovr: 88, overrides: { goalKick: 92, gameManage: 90, defence: 84 } },
    { id: "keagan-johannes", name: "Keagan Johannes", role: "flyhalf", age: 26, nation: "South Africa", alt: ["scrumhalf"], ovr: 76, overrides: { goalKick: 80 } },
    { id: "kade-wolhuter", name: "Kade Wolhuter", role: "flyhalf", age: 24, nation: "South Africa", ovr: 72 },
    // Centres
    { id: "david-kriel", name: "David Kriel", role: "centre", age: 26, nation: "South Africa", alt: ["fullback", "wing"], ovr: 80 },
    { id: "harold-vorster", name: "Harold Vorster", role: "centre", age: 30, nation: "South Africa", ovr: 78, overrides: { carry: 80 } },
    { id: "stedman-gans", name: "Stedman Gans", role: "centre", age: 28, nation: "South Africa", ovr: 75, overrides: { pace: 82 } },
    { id: "katlego-letebele", name: "Katlego Letebele", role: "centre", age: 22, nation: "South Africa", ovr: 70 },
    // Back three
    { id: "kurt-lee-arendse", name: "Kurt-Lee Arendse", role: "wing", age: 29, nation: "South Africa", ovr: 88, overrides: { pace: 94, handling: 86 } },
    { id: "canan-moodie", name: "Canan Moodie", role: "wing", age: 22, nation: "South Africa", alt: ["centre"], ovr: 85, overrides: { pace: 89, carry: 84 } },
    { id: "sebastian-de-klerk", name: "Sebastian de Klerk", role: "wing", age: 24, nation: "South Africa", ovr: 77, overrides: { pace: 85 } },
    { id: "stravino-jacobs", name: "Stravino Jacobs", role: "wing", age: 26, nation: "South Africa", ovr: 75, overrides: { pace: 84 } },
    { id: "cheswill-jooste", name: "Cheswill Jooste", role: "wing", age: 26, nation: "South Africa", ovr: 75, overrides: { pace: 86 } },
    { id: "sergeal-petersen", name: "Sergeal Petersen", role: "wing", age: 31, nation: "South Africa", ovr: 74, overrides: { pace: 84 } },
    { id: "willie-le-roux", name: "Willie le Roux", role: "fullback", age: 36, nation: "South Africa", ovr: 82, overrides: { handling: 90, gameManage: 88, kick: 84 } },
    { id: "devon-williams", name: "Devon Williams", role: "fullback", age: 29, nation: "South Africa", alt: ["wing"], ovr: 73 },
  ],
};
