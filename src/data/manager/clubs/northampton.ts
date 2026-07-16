// Northampton Saints — researched 2025-26 Gallagher PREM squad.
// Source: Wikipedia squad table (2026-27) reverse-adjusted with the official
// 2026-27 transfer list to reconstruct the 2025-26 squad; cross-checked with
// northamptonsaints.co.uk. Snapshot: 2025-26 season (regular-season leaders).
// Contract: see the comment block at the top of src/manager/types.ts.

import type { ClubData } from "../../../manager/types";

export const CLUB: ClubData = {
  id: "northampton",
  name: "Northampton Saints",
  shortName: "Northampton",
  abbr: "NOR",
  city: "Northampton",
  stadium: "cinch Stadium at Franklin's Gardens",
  colors: ["#000000", "#00a54f"],
  players: [
    // Props
    { id: "elliot-millar-mills", name: "Elliot Millar Mills", role: "prop", age: 29, nation: "Scotland", ovr: 77, overrides: { setPiece: 81 } },
    { id: "trevor-davison", name: "Trevor Davison", role: "prop", age: 29, nation: "England", ovr: 76 },
    { id: "danilo-fischetti", name: "Danilo Fischetti", role: "prop", age: 27, nation: "Italy", ovr: 79, overrides: { breakdown: 78 } },
    { id: "emmanuel-iyogun", name: "Emmanuel Iyogun", role: "prop", age: 24, nation: "England", ovr: 77 },
    { id: "tom-west", name: "Tom West", role: "prop", age: 29, nation: "England", ovr: 74 },
    { id: "cleopas-kundiona", name: "Cleopas Kundiona", role: "prop", age: 27, nation: "Zimbabwe", ovr: 72 },
    { id: "luke-green", name: "Luke Green", role: "prop", age: 23, nation: "England", ovr: 68 },
    // Hookers
    { id: "curtis-langdon", name: "Curtis Langdon", role: "hooker", age: 28, nation: "England", ovr: 80, overrides: { breakdown: 80 } },
    { id: "henry-walker", name: "Henry Walker", role: "hooker", age: 28, nation: "England", ovr: 74 },
    { id: "robbie-smith-nor", name: "Robbie Smith", role: "hooker", age: 26, nation: "Scotland", ovr: 74 },
    { id: "craig-wright", name: "Craig Wright", role: "hooker", age: 22, nation: "England", ovr: 68 },
    // Locks
    { id: "alex-coles", name: "Alex Coles", role: "lock", age: 26, nation: "England", alt: ["flanker"], ovr: 82, overrides: { setPiece: 84 } },
    { id: "jj-van-der-mescht", name: "JJ van der Mescht", role: "lock", age: 25, nation: "South Africa", ovr: 79, overrides: { carry: 82 } },
    { id: "chunya-munga", name: "Chunya Munga", role: "lock", age: 25, nation: "England", ovr: 75 },
    { id: "tom-lockett", name: "Tom Lockett", role: "lock", age: 21, nation: "England", ovr: 70 },
    { id: "ed-prowse", name: "Ed Prowse", role: "lock", age: 20, nation: "England", ovr: 66 },
    // Back row
    { id: "henry-pollock", name: "Henry Pollock", role: "flanker", age: 20, nation: "England", alt: ["number8"], ovr: 85, overrides: { breakdown: 87, pace: 84, carry: 87 } },
    { id: "tom-pearson", name: "Tom Pearson", role: "flanker", age: 26, nation: "England", ovr: 81, overrides: { breakdown: 84 } },
    { id: "josh-kemeny", name: "Josh Kemeny", role: "flanker", age: 27, nation: "Australia", ovr: 78 },
    { id: "sam-graham", name: "Sam Graham", role: "flanker", age: 26, nation: "England", alt: ["number8"], ovr: 75 },
    { id: "archie-benson", name: "Archie Benson", role: "flanker", age: 21, nation: "England", ovr: 70 },
    { id: "callum-chick", name: "Callum Chick", role: "number8", age: 28, nation: "England", alt: ["flanker"], ovr: 77, overrides: { carry: 80 } },
    // Scrum-halves
    { id: "alex-mitchell", name: "Alex Mitchell", role: "scrumhalf", age: 28, nation: "England", ovr: 87, overrides: { pace: 86, handling: 88 } },
    { id: "tom-james-nor", name: "Tom James", role: "scrumhalf", age: 32, nation: "England", ovr: 74 },
    { id: "archie-mcparland", name: "Archie McParland", role: "scrumhalf", age: 20, nation: "England", ovr: 71 },
    { id: "jonny-weimann", name: "Jonny Weimann", role: "scrumhalf", age: 19, nation: "England", ovr: 64 },
    // Fly-halves
    { id: "fin-smith", name: "Fin Smith", role: "flyhalf", age: 23, nation: "England", ovr: 87, overrides: { goalKick: 90, gameManage: 88 } },
    { id: "anthony-belleau", name: "Anthony Belleau", role: "flyhalf", age: 29, nation: "France", ovr: 77, overrides: { goalKick: 83 } },
    // Centres
    { id: "fraser-dingwall", name: "Fraser Dingwall", role: "centre", age: 26, nation: "England", ovr: 82, overrides: { defence: 85, handling: 83 } },
    { id: "rory-hutchinson", name: "Rory Hutchinson", role: "centre", age: 29, nation: "Scotland", alt: ["flyhalf"], ovr: 78, overrides: { handling: 83 } },
    { id: "tom-litchfield", name: "Tom Litchfield", role: "centre", age: 22, nation: "England", alt: ["wing"], ovr: 74 },
    { id: "toby-thame", name: "Toby Thame", role: "centre", age: 19, nation: "England", ovr: 66 },
    // Wings
    { id: "tommy-freeman", name: "Tommy Freeman", role: "wing", age: 24, nation: "England", alt: ["centre", "fullback"], ovr: 88, overrides: { pace: 90, carry: 87, handling: 86 } },
    { id: "ollie-sleightholme", name: "Ollie Sleightholme", role: "wing", age: 25, nation: "England", ovr: 82, overrides: { pace: 89 } },
    { id: "edoardo-todaro", name: "Edoardo Todaro", role: "wing", age: 20, nation: "Italy", ovr: 75, overrides: { pace: 86 } },
    { id: "james-martin-nor", name: "James Martin", role: "wing", age: 20, nation: "England", ovr: 66 },
    { id: "amena-caqusau", name: "Amena Caqusau", role: "wing", age: 19, nation: "Scotland", ovr: 67 },
    // Fullbacks
    { id: "george-furbank", name: "George Furbank", role: "fullback", age: 28, nation: "England", alt: ["flyhalf"], ovr: 83, overrides: { handling: 86, gameManage: 83 } },
    { id: "george-hendy", name: "George Hendy", role: "fullback", age: 22, nation: "England", alt: ["wing"], ovr: 76, overrides: { pace: 85 } },
    { id: "james-ramm", name: "James Ramm", role: "fullback", age: 27, nation: "Australia", alt: ["wing"], ovr: 76 },
    { id: "james-pater", name: "James Pater", role: "fullback", age: 19, nation: "England", ovr: 64 },
  ],
};
