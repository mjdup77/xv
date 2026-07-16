// Newcastle Red Bulls — researched 2025-26 Gallagher PREM squad.
// Source: Wikipedia "Newcastle Red Bulls 2025-26 Premiership Rugby squad"
// table (first season under the Red Bull ownership rebrand from Newcastle
// Falcons), cross-checked with season reports. Snapshot: 2025-26 season
// (10th — the league's weakest squad by some distance; Red Bull's big
// signings arrive in 2026-27).
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "newcastle",
  name: "Newcastle Red Bulls",
  shortName: "Newcastle",
  abbr: "NEW",
  city: "Newcastle upon Tyne",
  stadium: "Kingston Park",
  colors: ["#1e2a4a", "#d50032"],
  players: [
    // Props
    { id: "eduardo-bello", name: "Eduardo Bello", role: "prop", age: 29, nation: "Argentina", ovr: 74, overrides: { setPiece: 78 } },
    { id: "adam-brocklebank", name: "Adam Brocklebank", role: "prop", age: 26, nation: "England", ovr: 70 },
    { id: "murray-mccallum", name: "Murray McCallum", role: "prop", age: 29, nation: "Scotland", ovr: 70 },
    { id: "luan-de-bruin", name: "Luan de Bruin", role: "prop", age: 28, nation: "South Africa", ovr: 69 },
    { id: "richard-palframan", name: "Richard Palframan", role: "prop", age: 31, nation: "South Africa", ovr: 68 },
    { id: "jamie-clark-new", name: "Jamie Clark", role: "prop", age: 24, nation: "Australia", ovr: 65 },
    // Hookers
    { id: "george-mcguigan", name: "George McGuigan", role: "hooker", age: 32, nation: "England", ovr: 76, overrides: { carry: 77 } },
    { id: "bryn-gordon", name: "Bryn Gordon", role: "hooker", age: 26, nation: "New Zealand", ovr: 69 },
    { id: "ollie-fletcher-new", name: "Ollie Fletcher", role: "hooker", age: 23, nation: "England", ovr: 66 },
    // Locks
    { id: "jamie-hodgson", name: "Jamie Hodgson", role: "lock", age: 26, nation: "Scotland", ovr: 73 },
    { id: "john-hawkins", name: "John Hawkins", role: "lock", age: 26, nation: "England", ovr: 70 },
    { id: "freddie-clarke-new", name: "Freddie Clarke", role: "lock", age: 33, nation: "England", alt: ["flanker"], ovr: 69 },
    { id: "sebastian-de-chaves", name: "Sebastian de Chaves", role: "lock", age: 35, nation: "South Africa", ovr: 66 },
    { id: "tim-cardall", name: "Tim Cardall", role: "lock", age: 29, nation: "England", ovr: 66 },
    { id: "adam-scott-new", name: "Adam Scott", role: "lock", age: 22, nation: "England", ovr: 63 },
    // Back row
    { id: "tom-christie", name: "Tom Christie", role: "flanker", age: 27, nation: "New Zealand", ovr: 77, overrides: { breakdown: 80 } },
    { id: "freddie-lockwood", name: "Freddie Lockwood", role: "number8", age: 23, nation: "England", ovr: 73, overrides: { carry: 76 } },
    { id: "amanaki-mafi", name: "Amanaki Mafi", role: "number8", age: 35, nation: "Japan", ovr: 72, overrides: { carry: 78 } },
    { id: "thomas-gordon-new", name: "Thomas Gordon", role: "flanker", age: 28, nation: "Scotland", ovr: 71 },
    { id: "fergus-lee-warner", name: "Fergus Lee-Warner", role: "flanker", age: 26, nation: "Australia", alt: ["lock"], ovr: 71 },
    { id: "cameron-neild", name: "Cameron Neild", role: "flanker", age: 30, nation: "England", ovr: 69 },
    { id: "ollie-leatherbarrow", name: "Ollie Leatherbarrow", role: "flanker", age: 23, nation: "Scotland", ovr: 67 },
    // Scrum-halves
    { id: "simon-benitez-cruz", name: "Simón Benítez Cruz", role: "scrumhalf", age: 24, nation: "Argentina", ovr: 74 },
    { id: "sam-stuart-new", name: "Sam Stuart", role: "scrumhalf", age: 27, nation: "England", ovr: 70 },
    { id: "james-elliott-new", name: "James Elliott", role: "scrumhalf", age: 22, nation: "England", ovr: 64 },
    // Fly-halves
    { id: "ben-healy", name: "Ben Healy", role: "flyhalf", age: 26, nation: "Scotland", ovr: 77, overrides: { goalKick: 86, kick: 82 } },
    { id: "brett-connon", name: "Brett Connon", role: "flyhalf", age: 28, nation: "Ireland", ovr: 71, overrides: { goalKick: 78 } },
    { id: "boeta-chamberlain", name: "Boeta Chamberlain", role: "flyhalf", age: 26, nation: "South Africa", alt: ["fullback"], ovr: 70, overrides: { goalKick: 77 } },
    // Centres
    { id: "sammy-arnold", name: "Sammy Arnold", role: "centre", age: 29, nation: "Ireland", ovr: 72, overrides: { defence: 76 } },
    { id: "max-clark-new", name: "Max Clark", role: "centre", age: 29, nation: "England", ovr: 70 },
    { id: "connor-doherty", name: "Connor Doherty", role: "centre", age: 24, nation: "England", ovr: 68 },
    { id: "ethan-grayson", name: "Ethan Grayson", role: "centre", age: 23, nation: "England", ovr: 66 },
    { id: "cammy-hutchison", name: "Cammy Hutchison", role: "centre", age: 24, nation: "Scotland", ovr: 65 },
    { id: "oli-spencer", name: "Oli Spencer", role: "centre", age: 21, nation: "England", ovr: 62 },
    // Wings
    { id: "alex-hearle", name: "Alex Hearle", role: "wing", age: 22, nation: "England", ovr: 74, overrides: { pace: 86 } },
    { id: "christian-wade", name: "Christian Wade", role: "wing", age: 34, nation: "England", ovr: 75, overrides: { pace: 89 } },
    { id: "elliott-obatoyinbo", name: "Elliott Obatoyinbo", role: "wing", age: 27, nation: "England", alt: ["fullback"], ovr: 70 },
    { id: "harrison-obatoyinbo", name: "Harrison Obatoyinbo", role: "wing", age: 24, nation: "England", ovr: 66 },
    { id: "joel-grayson", name: "Joel Grayson", role: "wing", age: 22, nation: "England", ovr: 63 },
    // Fullbacks (Josh Hodge joins from Exeter in 2026-27 — not listed here)
    { id: "stefan-coetzee", name: "Stefan Coetzee", role: "fullback", age: 26, nation: "South Africa", ovr: 67 },
    { id: "sam-waugh", name: "Sam Waugh", role: "fullback", age: 22, nation: "England", ovr: 63 },
  ],
};
