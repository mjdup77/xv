// Harlequins — researched 2025-26 Gallagher PREM squad.
// Source: Wikipedia "Harlequins 2025-26 Premiership Rugby squad" table and the
// club's official 2025/26 squad announcement (quins.co.uk), cross-checked with
// season reports. Snapshot: 2025-26 season (9th).
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "harlequins",
  name: "Harlequins",
  shortName: "Harlequins",
  abbr: "HAR",
  city: "London",
  stadium: "Twickenham Stoop",
  colors: ["#0c1c47", "#00a887"],
  players: [
    // Props
    { id: "fin-baxter", name: "Fin Baxter", role: "prop", age: 23, nation: "England", ovr: 81, overrides: { setPiece: 84 } },
    { id: "titi-lamositele", name: "Titi Lamositele", role: "prop", age: 30, nation: "Samoa", ovr: 76, overrides: { setPiece: 79 } },
    { id: "harry-williams-har", name: "Harry Williams", role: "prop", age: 33, nation: "England", ovr: 75, overrides: { setPiece: 79 } },
    { id: "simon-kerrod", name: "Simon Kerrod", role: "prop", age: 31, nation: "South Africa", ovr: 73 },
    { id: "pedro-delgado", name: "Pedro Delgado", role: "prop", age: 26, nation: "Argentina", ovr: 72 },
    { id: "boris-wenger", name: "Boris Wenger", role: "prop", age: 24, nation: "Argentina", ovr: 72 },
    { id: "jordan-els", name: "Jordan Els", role: "prop", age: 25, nation: "South Africa", ovr: 68 },
    { id: "cameron-doak", name: "Cameron Doak", role: "prop", age: 24, nation: "Ireland", ovr: 65 },
    // Hookers
    { id: "george-turner", name: "George Turner", role: "hooker", age: 33, nation: "Scotland", ovr: 78, overrides: { carry: 78 } },
    { id: "sam-riley", name: "Sam Riley", role: "hooker", age: 24, nation: "England", ovr: 75 },
    { id: "jack-walker-har", name: "Jack Walker", role: "hooker", age: 29, nation: "England", ovr: 73 },
    { id: "jack-musk", name: "Jack Musk", role: "hooker", age: 24, nation: "England", ovr: 69 },
    // Locks
    { id: "guido-petti", name: "Guido Petti", role: "lock", age: 30, nation: "Argentina", alt: ["flanker"], ovr: 82, overrides: { setPiece: 84, defence: 83 } },
    { id: "kieran-treadwell", name: "Kieran Treadwell", role: "lock", age: 29, nation: "Ireland", ovr: 77 },
    { id: "joe-launchbury", name: "Joe Launchbury", role: "lock", age: 34, nation: "England", ovr: 76, overrides: { setPiece: 79 } },
    { id: "stephan-lewies", name: "Stephan Lewies", role: "lock", age: 33, nation: "South Africa", ovr: 74 },
    { id: "jonny-green-har", name: "Jonny Green", role: "lock", age: 22, nation: "Wales", ovr: 68 },
    // Back row
    { id: "chandler-cunningham-south", name: "Chandler Cunningham-South", role: "flanker", age: 22, nation: "England", alt: ["number8", "lock"], ovr: 83, overrides: { carry: 87 } },
    { id: "will-evans", name: "Will Evans", role: "flanker", age: 28, nation: "England", ovr: 81, overrides: { breakdown: 88 } },
    { id: "james-chisholm", name: "James Chisholm", role: "flanker", age: 30, nation: "England", alt: ["number8"], ovr: 76 },
    { id: "jack-kenningham", name: "Jack Kenningham", role: "flanker", age: 26, nation: "England", ovr: 75 },
    { id: "tom-lawday", name: "Tom Lawday", role: "number8", age: 30, nation: "England", ovr: 73 },
    { id: "zach-carr", name: "Zach Carr", role: "flanker", age: 21, nation: "England", ovr: 66 },
    { id: "alex-dombrandt", name: "Alex Dombrandt", role: "number8", age: 28, nation: "England", ovr: 82, overrides: { carry: 86, handling: 82 } },
    // Scrum-halves
    { id: "will-porter", name: "Will Porter", role: "scrumhalf", age: 26, nation: "England", ovr: 76 },
    { id: "max-green-har", name: "Max Green", role: "scrumhalf", age: 27, nation: "England", ovr: 71 },
    { id: "stu-townsend", name: "Stu Townsend", role: "scrumhalf", age: 29, nation: "England", ovr: 71 },
    // Fly-halves
    { id: "marcus-smith", name: "Marcus Smith", role: "flyhalf", age: 26, nation: "England", alt: ["fullback"], ovr: 88, overrides: { pace: 86, handling: 90, goalKick: 86, gameManage: 87 } },
    { id: "jarrod-evans", name: "Jarrod Evans", role: "flyhalf", age: 29, nation: "Wales", ovr: 75, overrides: { goalKick: 80 } },
    { id: "jamie-benson", name: "Jamie Benson", role: "flyhalf", age: 23, nation: "England", ovr: 69 },
    // Centres
    { id: "oscar-beard", name: "Oscar Beard", role: "centre", age: 23, nation: "England", ovr: 78, overrides: { pace: 82 } },
    { id: "luke-northmore", name: "Luke Northmore", role: "centre", age: 28, nation: "England", ovr: 77 },
    { id: "hayden-hyde", name: "Hayden Hyde", role: "centre", age: 22, nation: "England", ovr: 72 },
    { id: "ben-waghorn", name: "Ben Waghorn", role: "centre", age: 20, nation: "England", ovr: 67 },
    // Wings
    { id: "cadan-murley", name: "Cadan Murley", role: "wing", age: 26, nation: "England", ovr: 82, overrides: { pace: 88 } },
    { id: "rodrigo-isgro", name: "Rodrigo Isgró", role: "wing", age: 26, nation: "Argentina", ovr: 79, overrides: { breakdown: 76 } },
    { id: "cassius-cleaves", name: "Cassius Cleaves", role: "wing", age: 23, nation: "England", ovr: 73, overrides: { pace: 85 } },
    { id: "nick-david", name: "Nick David", role: "wing", age: 25, nation: "England", alt: ["fullback"], ovr: 76 },
    // Fullbacks
    { id: "tyrone-green", name: "Tyrone Green", role: "fullback", age: 27, nation: "South Africa", alt: ["wing"], ovr: 82, overrides: { handling: 85, pace: 85 } },
    { id: "cameron-anderson", name: "Cameron Anderson", role: "fullback", age: 23, nation: "Scotland", alt: ["centre"], ovr: 70 },
  ],
};
