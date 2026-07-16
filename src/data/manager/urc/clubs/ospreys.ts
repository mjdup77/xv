// Ospreys — researched 2025-26 BKT URC squad (11th, Welsh Shield winners).
// Source: Wikipedia current-squad table reverse-adjusted to 2025-26 using the
// List of 2026-27 URC transfers (Jac Morgan/Dewi Lake/Walsh/Kasende/Fender/
// Nagy/Scully restored; 2026-27 arrivals Rogers/John/Wright/Foketi/Creighton
// excluded). Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "ospreys",
  name: "Ospreys",
  shortName: "Ospreys",
  abbr: "OSP",
  city: "Swansea",
  stadium: "Brewery Field, Bridgend",
  colors: ["#000000", "#c0c0c0"],
  players: [
    // Props
    { id: "gareth-thomas-osp", name: "Gareth Thomas", role: "prop", age: 31, nation: "Wales", ovr: 78, overrides: { setPiece: 80 } },
    { id: "tom-botha", name: "Tom Botha", role: "prop", age: 30, nation: "Wales", ovr: 75, overrides: { setPiece: 78 } },
    { id: "rhys-henry", name: "Rhys Henry", role: "prop", age: 24, nation: "Wales", ovr: 71 },
    { id: "garyn-phillips", name: "Garyn Phillips", role: "prop", age: 25, nation: "Wales", ovr: 71 },
    { id: "ben-warren", name: "Ben Warren", role: "prop", age: 24, nation: "Wales", ovr: 70 },
    { id: "steffan-thomas-osp", name: "Steffan Thomas", role: "prop", age: 24, nation: "Wales", ovr: 68 },
    // Hookers
    { id: "dewi-lake", name: "Dewi Lake", role: "hooker", age: 26, nation: "Wales", ovr: 82, overrides: { carry: 84, breakdown: 82 } },
    { id: "sam-parry", name: "Sam Parry", role: "hooker", age: 33, nation: "Wales", ovr: 75 },
    { id: "ethan-lewis-osp", name: "Ethan Lewis", role: "hooker", age: 25, nation: "Wales", ovr: 71 },
    { id: "efan-daniel", name: "Efan Daniel", role: "hooker", age: 22, nation: "Wales", ovr: 68 },
    // Locks
    { id: "james-ratti", name: "James Ratti", role: "lock", age: 27, nation: "Wales", alt: ["number8"], ovr: 76 },
    { id: "rhys-davies-osp", name: "Rhys Davies", role: "lock", age: 26, nation: "Wales", ovr: 74 },
    { id: "james-fender", name: "James Fender", role: "lock", age: 24, nation: "Wales", ovr: 72 },
    { id: "huw-sutton", name: "Huw Sutton", role: "lock", age: 24, nation: "Wales", ovr: 71 },
    { id: "lewis-jones-osp", name: "Lewis Jones", role: "lock", age: 22, nation: "Wales", ovr: 68 },
    // Back row
    { id: "jac-morgan", name: "Jac Morgan", role: "flanker", age: 25, nation: "Wales", ovr: 87, overrides: { breakdown: 90, carry: 85, defence: 87 } },
    { id: "morgan-morris", name: "Morgan Morris", role: "number8", age: 27, nation: "Wales", ovr: 80, overrides: { carry: 83 } },
    { id: "morgan-morse", name: "Morgan Morse", role: "number8", age: 20, nation: "Wales", ovr: 76, overrides: { carry: 79 } },
    { id: "harri-deaves", name: "Harri Deaves", role: "flanker", age: 24, nation: "Wales", ovr: 75, overrides: { breakdown: 78 } },
    { id: "ross-moriarty", name: "Ross Moriarty", role: "flanker", age: 31, nation: "Wales", alt: ["number8"], ovr: 75 },
    { id: "tristan-davies-osp", name: "Tristan Davies", role: "flanker", age: 22, nation: "Wales", ovr: 67 },
    // Scrum-halves
    { id: "kieran-hardy", name: "Kieran Hardy", role: "scrumhalf", age: 29, nation: "Wales", ovr: 78, overrides: { pace: 80 } },
    { id: "reuben-morgan-williams", name: "Reuben Morgan-Williams", role: "scrumhalf", age: 27, nation: "Wales", ovr: 73 },
    { id: "luke-davies-osp", name: "Luke Davies", role: "scrumhalf", age: 24, nation: "Wales", ovr: 70 },
    { id: "harri-williams-osp", name: "Harri Williams", role: "scrumhalf", age: 22, nation: "Wales", ovr: 67 },
    // Fly-halves
    { id: "dan-edwards", name: "Dan Edwards", role: "flyhalf", age: 22, nation: "Wales", ovr: 81, overrides: { goalKick: 86, gameManage: 80 } },
    { id: "jack-walsh", name: "Jack Walsh", role: "flyhalf", age: 26, nation: "Australia", alt: ["centre", "fullback"], ovr: 77, overrides: { goalKick: 81 } },
    { id: "luke-scully", name: "Luke Scully", role: "flyhalf", age: 24, nation: "Wales", ovr: 69 },
    // Centres
    { id: "owen-watkin", name: "Owen Watkin", role: "centre", age: 29, nation: "Wales", ovr: 78, overrides: { defence: 81 } },
    { id: "keiran-williams", name: "Keiran Williams", role: "centre", age: 28, nation: "Wales", ovr: 77, overrides: { carry: 81 } },
    { id: "evardi-boshoff", name: "Evardi Boshoff", role: "centre", age: 24, nation: "South Africa", ovr: 72 },
    // Back three
    { id: "keelan-giles", name: "Keelan Giles", role: "wing", age: 27, nation: "Wales", ovr: 76, overrides: { pace: 87 } },
    { id: "luke-morgan-osp", name: "Luke Morgan", role: "wing", age: 31, nation: "Wales", ovr: 74, overrides: { pace: 83 } },
    { id: "daniel-kasende", name: "Daniel Kasende", role: "wing", age: 25, nation: "DR Congo", ovr: 74, overrides: { carry: 79, pace: 82 } },
    { id: "harri-houston", name: "Harri Houston", role: "wing", age: 22, nation: "Wales", ovr: 70 },
    { id: "iestyn-hopkins", name: "Iestyn Hopkins", role: "fullback", age: 23, nation: "Wales", alt: ["wing"], ovr: 75 },
    { id: "max-nagy", name: "Max Nagy", role: "fullback", age: 25, nation: "Wales", alt: ["wing"], ovr: 72 },
  ],
};
