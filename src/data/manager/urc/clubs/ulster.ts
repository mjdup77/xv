// Ulster Rugby — researched 2025-26 BKT URC squad (9th).
// Source: Wikipedia current-squad table reverse-adjusted to 2025-26 using the
// List of 2026-27 URC transfers (Bell/Kok/Andrew/Humphreys/Rea/Reffell etc.
// restored; 2026-27 arrivals Snyman/Devine/Donnell/Bello/Knox excluded;
// Bryn Ward kept — he debuted during 2025-26).
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "ulster",
  name: "Ulster Rugby",
  shortName: "Ulster",
  abbr: "ULS",
  city: "Belfast",
  stadium: "Ravenhill Stadium",
  colors: ["#ffffff", "#c8102e"],
  players: [
    // Props
    { id: "tom-otoole", name: "Tom O'Toole", role: "prop", age: 26, nation: "Ireland", ovr: 81, overrides: { setPiece: 83 } },
    { id: "angus-bell", name: "Angus Bell", role: "prop", age: 25, nation: "Australia", ovr: 84, overrides: { carry: 86, setPiece: 84 } },
    { id: "eric-osullivan", name: "Eric O'Sullivan", role: "prop", age: 29, nation: "Ireland", ovr: 76 },
    { id: "scott-wilson-uls", name: "Scott Wilson", role: "prop", age: 24, nation: "Ireland", ovr: 74 },
    { id: "callum-reid", name: "Callum Reid", role: "prop", age: 26, nation: "Ireland", ovr: 73 },
    { id: "sam-crean", name: "Sam Crean", role: "prop", age: 26, nation: "Ireland", ovr: 72 },
    { id: "rory-mcguire", name: "Rory McGuire", role: "prop", age: 23, nation: "Ireland", ovr: 69 },
    // Hookers
    { id: "rob-herring", name: "Rob Herring", role: "hooker", age: 35, nation: "Ireland", ovr: 78, overrides: { setPiece: 82 } },
    { id: "tom-stewart", name: "Tom Stewart", role: "hooker", age: 24, nation: "Ireland", ovr: 78, overrides: { breakdown: 78 } },
    { id: "james-mccormick", name: "James McCormick", role: "hooker", age: 24, nation: "Ireland", ovr: 72 },
    { id: "john-andrew", name: "John Andrew", role: "hooker", age: 32, nation: "Ireland", ovr: 71 },
    // Locks
    { id: "iain-henderson", name: "Iain Henderson", role: "lock", age: 33, nation: "Ireland", ovr: 81, overrides: { carry: 82 } },
    { id: "cormac-izuchukwu", name: "Cormac Izuchukwu", role: "lock", age: 25, nation: "Ireland", alt: ["flanker"], ovr: 79, overrides: { pace: 80 } },
    { id: "harry-sheridan", name: "Harry Sheridan", role: "lock", age: 24, nation: "Ireland", ovr: 76 },
    { id: "charlie-irvine", name: "Charlie Irvine", role: "lock", age: 23, nation: "Ireland", ovr: 73 },
    { id: "joe-hopes", name: "Joe Hopes", role: "lock", age: 22, nation: "Ireland", ovr: 71 },
    // Back row
    { id: "nick-timoney", name: "Nick Timoney", role: "flanker", age: 30, nation: "Ireland", alt: ["number8"], ovr: 81, overrides: { breakdown: 83, pace: 81 } },
    { id: "juarno-augustus", name: "Juarno Augustus", role: "number8", age: 27, nation: "South Africa", ovr: 80, overrides: { carry: 85 } },
    { id: "david-mccann", name: "David McCann", role: "number8", age: 24, nation: "Ireland", alt: ["flanker"], ovr: 77 },
    { id: "james-mcnabney", name: "James McNabney", role: "flanker", age: 23, nation: "Ireland", ovr: 76 },
    { id: "marcus-rea", name: "Marcus Rea", role: "flanker", age: 29, nation: "Ireland", ovr: 72 },
    { id: "sean-reffell", name: "Sean Reffell", role: "flanker", age: 27, nation: "Wales", ovr: 72, overrides: { breakdown: 76 } },
    { id: "bryn-ward", name: "Bryn Ward", role: "flanker", age: 21, nation: "Ireland", alt: ["number8"], ovr: 71 },
    // Scrum-halves
    { id: "nathan-doak", name: "Nathan Doak", role: "scrumhalf", age: 23, nation: "Ireland", ovr: 79, overrides: { goalKick: 83 } },
    { id: "conor-mckee", name: "Conor McKee", role: "scrumhalf", age: 24, nation: "Ireland", ovr: 71 },
    { id: "david-shanahan", name: "David Shanahan", role: "scrumhalf", age: 32, nation: "Ireland", ovr: 69 },
    // Fly-halves
    { id: "jack-murphy-uls", name: "Jack Murphy", role: "flyhalf", age: 20, nation: "Ireland", ovr: 76 },
    { id: "jake-flannery", name: "Jake Flannery", role: "flyhalf", age: 25, nation: "Ireland", alt: ["fullback"], ovr: 75 },
    { id: "james-humphreys", name: "James Humphreys", role: "flyhalf", age: 23, nation: "Ireland", ovr: 72 },
    // Centres
    { id: "stuart-mccloskey", name: "Stuart McCloskey", role: "centre", age: 33, nation: "Ireland", ovr: 82, overrides: { carry: 86 } },
    { id: "james-hume", name: "James Hume", role: "centre", age: 27, nation: "Ireland", ovr: 78 },
    { id: "jude-postlethwaite", name: "Jude Postlethwaite", role: "centre", age: 21, nation: "Ireland", ovr: 74 },
    { id: "stewart-moore", name: "Stewart Moore", role: "centre", age: 26, nation: "Ireland", alt: ["fullback"], ovr: 74 },
    { id: "ben-carson", name: "Ben Carson", role: "centre", age: 22, nation: "Ireland", ovr: 72 },
    // Back three
    { id: "jacob-stockdale", name: "Jacob Stockdale", role: "wing", age: 29, nation: "Ireland", alt: ["fullback"], ovr: 80, overrides: { carry: 83 } },
    { id: "robert-baloucoune", name: "Robert Baloucoune", role: "wing", age: 28, nation: "Ireland", ovr: 80, overrides: { pace: 90 } },
    { id: "werner-kok", name: "Werner Kok", role: "wing", age: 32, nation: "South Africa", ovr: 79, overrides: { defence: 84, breakdown: 80 } },
    { id: "zac-ward", name: "Zac Ward", role: "wing", age: 24, nation: "Ireland", ovr: 79, overrides: { pace: 86, carry: 80 } },
    { id: "ethan-mcilroy", name: "Ethan McIlroy", role: "wing", age: 25, nation: "Ireland", alt: ["fullback"], ovr: 74 },
    { id: "michael-lowry", name: "Michael Lowry", role: "fullback", age: 27, nation: "Ireland", alt: ["flyhalf"], ovr: 78, overrides: { pace: 84 } },
    { id: "ben-moxham", name: "Ben Moxham", role: "fullback", age: 24, nation: "Ireland", alt: ["wing", "centre"], ovr: 72 },
  ],
};
