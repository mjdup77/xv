// Stormers — researched 2025-26 BKT URC squad (3rd, semi-finalists).
// Source: Wikipedia "squad for the 2025-26 United Rugby Championship" list
// (the URC squad, NOT the Western Province Currie Cup roster). In-season
// departures (Sithole to Bulls, Maart, Markus, Makata) excluded per the
// page footnote. Snapshot: 2 July 2026.
// Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "stormers",
  name: "DHL Stormers",
  shortName: "Stormers",
  abbr: "STO",
  city: "Cape Town",
  stadium: "Cape Town Stadium",
  colors: ["#001f5b", "#87ceeb"],
  players: [
    // Props
    { id: "frans-malherbe", name: "Frans Malherbe", role: "prop", age: 34, nation: "South Africa", ovr: 83, overrides: { setPiece: 89 } },
    { id: "ntuthuko-mchunu", name: "Ntuthuko Mchunu", role: "prop", age: 26, nation: "South Africa", ovr: 82, overrides: { setPiece: 83, carry: 80 } },
    { id: "neethling-fouche", name: "Neethling Fouché", role: "prop", age: 32, nation: "South Africa", ovr: 78, overrides: { setPiece: 81 } },
    { id: "oli-kebble", name: "Oli Kebble", role: "prop", age: 33, nation: "South Africa", ovr: 74 },
    { id: "sazi-sandi", name: "Sazi Sandi", role: "prop", age: 26, nation: "South Africa", ovr: 73 },
    { id: "zachary-porthen", name: "Zachary Porthen", role: "prop", age: 20, nation: "South Africa", ovr: 72 },
    { id: "ali-vermaak", name: "Ali Vermaak", role: "prop", age: 35, nation: "South Africa", ovr: 71 },
    { id: "vernon-matongo", name: "Vernon Matongo", role: "prop", age: 24, nation: "South Africa", ovr: 70 },
    // Hookers
    { id: "andre-hugo-venter", name: "Andre-Hugo Venter", role: "hooker", age: 22, nation: "South Africa", ovr: 78, overrides: { setPiece: 80 } },
    { id: "jj-kotze", name: "JJ Kotze", role: "hooker", age: 24, nation: "South Africa", ovr: 75 },
    { id: "scarra-ntubeni", name: "Scarra Ntubeni", role: "hooker", age: 34, nation: "South Africa", ovr: 72 },
    { id: "vernon-paulo", name: "Vernon Paulo", role: "hooker", age: 23, nation: "South Africa", ovr: 68 },
    // Locks
    { id: "salmaan-moerat", name: "Salmaan Moerat", role: "lock", age: 27, nation: "South Africa", ovr: 81, overrides: { setPiece: 83 } },
    { id: "ruben-van-heerden", name: "Ruben van Heerden", role: "lock", age: 28, nation: "South Africa", ovr: 77 },
    { id: "jd-schickerling", name: "JD Schickerling", role: "lock", age: 30, nation: "South Africa", ovr: 76 },
    { id: "adre-smith", name: "Adré Smith", role: "lock", age: 26, nation: "South Africa", ovr: 75 },
    { id: "connor-evans", name: "Connor Evans", role: "lock", age: 24, nation: "South Africa", ovr: 74 },
    { id: "gary-porter", name: "Gary Porter", role: "lock", age: 23, nation: "South Africa", ovr: 69 },
    // Back row
    { id: "evan-roos", name: "Evan Roos", role: "number8", age: 25, nation: "South Africa", ovr: 86, overrides: { carry: 90, breakdown: 82 } },
    { id: "ben-jason-dixon", name: "Ben-Jason Dixon", role: "flanker", age: 27, nation: "South Africa", alt: ["lock"], ovr: 81, overrides: { defence: 83 } },
    { id: "paul-de-villiers", name: "Paul de Villiers", role: "flanker", age: 24, nation: "South Africa", ovr: 80, overrides: { breakdown: 82 } },
    { id: "ruan-ackermann", name: "Ruan Ackermann", role: "number8", age: 29, nation: "South Africa", alt: ["flanker"], ovr: 78, overrides: { carry: 81 } },
    { id: "deon-fourie", name: "Deon Fourie", role: "flanker", age: 39, nation: "South Africa", alt: ["hooker"], ovr: 77, overrides: { breakdown: 84 } },
    { id: "hacjivah-dayimani", name: "Hacjivah Dayimani", role: "number8", age: 28, nation: "South Africa", ovr: 76, overrides: { pace: 82 } },
    { id: "marcel-theunissen", name: "Marcel Theunissen", role: "flanker", age: 25, nation: "South Africa", ovr: 74 },
    { id: "louw-nel", name: "Louw Nel", role: "flanker", age: 25, nation: "South Africa", ovr: 74 },
    { id: "keke-morabe", name: "Keke Morabe", role: "flanker", age: 22, nation: "South Africa", ovr: 71 },
    { id: "riley-norton", name: "Riley Norton", role: "number8", age: 20, nation: "South Africa", alt: ["lock"], ovr: 71 },
    // Scrum-halves
    { id: "cobus-reinach", name: "Cobus Reinach", role: "scrumhalf", age: 35, nation: "South Africa", ovr: 82, overrides: { pace: 85 } },
    { id: "stefan-ungerer", name: "Stefan Ungerer", role: "scrumhalf", age: 31, nation: "South Africa", ovr: 74 },
    { id: "imad-khan", name: "Imad Khan", role: "scrumhalf", age: 24, nation: "South Africa", ovr: 73 },
    { id: "dewaldt-duvenage", name: "Dewaldt Duvenage", role: "scrumhalf", age: 37, nation: "South Africa", ovr: 71 },
    // Fly-halves
    { id: "sacha-feinberg-mngomezulu", name: "Sacha Feinberg-Mngomezulu", role: "flyhalf", age: 23, nation: "South Africa", alt: ["centre", "fullback"], ovr: 90, overrides: { goalKick: 91, handling: 91, carry: 87, gameManage: 89 } },
    { id: "jurie-matthee", name: "Jurie Matthee", role: "flyhalf", age: 24, nation: "South Africa", ovr: 78, overrides: { goalKick: 83 } },
    { id: "jean-luc-du-plessis", name: "Jean-Luc du Plessis", role: "flyhalf", age: 31, nation: "South Africa", ovr: 73 },
    { id: "kyle-smith-sto", name: "Kyle Smith", role: "flyhalf", age: 24, nation: "South Africa", ovr: 70 },
    // Centres
    { id: "damian-willemse", name: "Damian Willemse", role: "centre", age: 27, nation: "South Africa", alt: ["fullback", "flyhalf"], ovr: 85, overrides: { handling: 87, pace: 85 } },
    { id: "wandisile-simelane", name: "Wandisile Simelane", role: "centre", age: 27, nation: "South Africa", ovr: 79, overrides: { pace: 84, handling: 81 } },
    { id: "dan-du-plessis", name: "Dan du Plessis", role: "centre", age: 30, nation: "South Africa", ovr: 78 },
    { id: "suleiman-hartzenberg", name: "Suleiman Hartzenberg", role: "centre", age: 21, nation: "South Africa", alt: ["wing"], ovr: 76 },
    { id: "ruhan-nel", name: "Ruhan Nel", role: "centre", age: 34, nation: "South Africa", ovr: 75 },
    // Back three
    { id: "leolin-zas", name: "Leolin Zas", role: "wing", age: 29, nation: "South Africa", ovr: 78, overrides: { pace: 86 } },
    { id: "seabelo-senatla", name: "Seabelo Senatla", role: "wing", age: 32, nation: "South Africa", ovr: 75, overrides: { pace: 88 } },
    { id: "courtnall-skosan", name: "Courtnall Skosan", role: "wing", age: 34, nation: "South Africa", ovr: 73 },
    { id: "mfundo-ndhlovu", name: "Mfundo Ndhlovu", role: "wing", age: 24, nation: "South Africa", ovr: 72 },
    { id: "warrick-gelant", name: "Warrick Gelant", role: "fullback", age: 30, nation: "South Africa", alt: ["wing"], ovr: 79, overrides: { handling: 84 } },
    { id: "jc-mars", name: "JC Mars", role: "fullback", age: 23, nation: "South Africa", alt: ["wing"], ovr: 72 },
  ],
};
