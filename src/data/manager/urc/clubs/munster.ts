// Munster Rugby — researched 2025-26 BKT URC squad (5th, quarter-finalists).
// Source: Wikipedia senior-squad table reverse-adjusted to 2025-26 using the
// List of 2026-27 URC transfers (Kleyn/Scannell/Ryan/Abrahams/Butler/Smith
// restored; 2026-27 arrivals van der Merwe/Aungier/Harrison etc. excluded).
// Snapshot: 2 July 2026. Contract: src/data/manager/urc/types.ts.

import type { ClubData } from "../../../../manager/types";

export const CLUB: ClubData = {
  id: "munster",
  name: "Munster Rugby",
  shortName: "Munster",
  abbr: "MUN",
  city: "Limerick",
  stadium: "Thomond Park",
  colors: ["#c8102e", "#001489"],
  players: [
    // Props
    { id: "jeremy-loughman", name: "Jeremy Loughman", role: "prop", age: 30, nation: "Ireland", ovr: 79 },
    { id: "oli-jager", name: "Oli Jager", role: "prop", age: 30, nation: "Ireland", ovr: 79, overrides: { setPiece: 83 } },
    { id: "michael-milne", name: "Michael Milne", role: "prop", age: 26, nation: "Ireland", ovr: 77 },
    { id: "josh-wycherley", name: "Josh Wycherley", role: "prop", age: 25, nation: "Ireland", ovr: 76 },
    { id: "roman-salanoa", name: "Roman Salanoa", role: "prop", age: 28, nation: "Ireland", ovr: 74 },
    { id: "john-ryan-mun", name: "John Ryan", role: "prop", age: 37, nation: "Ireland", ovr: 73, overrides: { setPiece: 79 } },
    { id: "mark-donnelly", name: "Mark Donnelly", role: "prop", age: 24, nation: "Ireland", ovr: 71 },
    { id: "kieran-ryan", name: "Kieran Ryan", role: "prop", age: 25, nation: "Ireland", ovr: 70 },
    // Hookers
    { id: "diarmuid-barron", name: "Diarmuid Barron", role: "hooker", age: 27, nation: "Ireland", ovr: 77 },
    { id: "niall-scannell", name: "Niall Scannell", role: "hooker", age: 33, nation: "Ireland", ovr: 75 },
    { id: "lee-barron", name: "Lee Barron", role: "hooker", age: 24, nation: "Ireland", ovr: 74 },
    // Locks
    { id: "tadhg-beirne", name: "Tadhg Beirne", role: "lock", age: 33, nation: "Ireland", alt: ["flanker"], ovr: 88, overrides: { breakdown: 91, setPiece: 87 } },
    { id: "jean-kleyn", name: "Jean Kleyn", role: "lock", age: 32, nation: "South Africa", ovr: 79, overrides: { setPiece: 83 } },
    { id: "thomas-ahern", name: "Thomas Ahern", role: "lock", age: 25, nation: "Ireland", ovr: 78, overrides: { pace: 78 } },
    { id: "fineen-wycherley", name: "Fineen Wycherley", role: "lock", age: 27, nation: "Ireland", ovr: 76 },
    { id: "edwin-edogbo", name: "Edwin Edogbo", role: "lock", age: 22, nation: "Ireland", ovr: 73 },
    { id: "evan-oconnell", name: "Evan O'Connell", role: "lock", age: 21, nation: "Ireland", ovr: 71 },
    // Back row
    { id: "gavin-coombes", name: "Gavin Coombes", role: "number8", age: 27, nation: "Ireland", ovr: 82, overrides: { carry: 87 } },
    { id: "john-hodnett", name: "John Hodnett", role: "flanker", age: 26, nation: "Ireland", ovr: 81, overrides: { breakdown: 84 } },
    { id: "jack-odonoghue", name: "Jack O'Donoghue", role: "flanker", age: 31, nation: "Ireland", alt: ["number8"], ovr: 80 },
    { id: "alex-kendellen", name: "Alex Kendellen", role: "number8", age: 24, nation: "Ireland", alt: ["flanker"], ovr: 79, overrides: { carry: 81 } },
    { id: "brian-gleeson", name: "Brian Gleeson", role: "number8", age: 21, nation: "Ireland", ovr: 76, overrides: { carry: 80 } },
    { id: "ruadhan-quinn", name: "Ruadhán Quinn", role: "flanker", age: 21, nation: "Ireland", alt: ["number8"], ovr: 72 },
    // Scrum-halves
    { id: "craig-casey", name: "Craig Casey", role: "scrumhalf", age: 26, nation: "Ireland", ovr: 84, overrides: { pace: 84, handling: 85 } },
    { id: "ethan-coughlan", name: "Ethan Coughlan", role: "scrumhalf", age: 22, nation: "Ireland", ovr: 76 },
    { id: "paddy-patterson", name: "Paddy Patterson", role: "scrumhalf", age: 26, nation: "Ireland", ovr: 71 },
    // Fly-halves
    { id: "jack-crowley", name: "Jack Crowley", role: "flyhalf", age: 25, nation: "Ireland", ovr: 86, overrides: { gameManage: 86, goalKick: 85, carry: 82 } },
    { id: "jj-hanrahan", name: "JJ Hanrahan", role: "flyhalf", age: 33, nation: "Ireland", alt: ["centre"], ovr: 77, overrides: { goalKick: 83 } },
    { id: "tony-butler", name: "Tony Butler", role: "flyhalf", age: 22, nation: "Ireland", ovr: 72 },
    // Centres
    { id: "tom-farrell", name: "Tom Farrell", role: "centre", age: 32, nation: "Ireland", ovr: 79, overrides: { carry: 81 } },
    { id: "alex-nankivell", name: "Alex Nankivell", role: "centre", age: 29, nation: "New Zealand", ovr: 79 },
    { id: "dan-kelly-mun", name: "Dan Kelly", role: "centre", age: 24, nation: "Ireland", ovr: 76 },
    { id: "sean-obrien-mun", name: "Seán O'Brien", role: "centre", age: 24, nation: "Ireland", ovr: 74 },
    { id: "fionn-gibbons", name: "Fionn Gibbons", role: "centre", age: 23, nation: "Ireland", ovr: 71 },
    // Back three
    { id: "calvin-nash", name: "Calvin Nash", role: "wing", age: 28, nation: "Ireland", ovr: 81, overrides: { pace: 85 } },
    { id: "shane-daly", name: "Shane Daly", role: "wing", age: 28, nation: "Ireland", alt: ["fullback"], ovr: 78 },
    { id: "diarmuid-kilgallen", name: "Diarmuid Kilgallen", role: "wing", age: 25, nation: "Ireland", ovr: 76, overrides: { pace: 84 } },
    { id: "andrew-smith-mun", name: "Andrew Smith", role: "wing", age: 25, nation: "Ireland", ovr: 73 },
    { id: "shay-mccarthy", name: "Shay McCarthy", role: "wing", age: 21, nation: "Ireland", ovr: 69 },
    { id: "mike-haley", name: "Mike Haley", role: "fullback", age: 31, nation: "Ireland", ovr: 78 },
    { id: "ben-oconnor-mun", name: "Ben O'Connor", role: "fullback", age: 21, nation: "Ireland", alt: ["wing"], ovr: 72 },
  ],
};
