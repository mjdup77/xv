import type { Attr, Player, Role, Squad } from "../types";
import { WC_1987_1991 } from "./wc/group1987_1991";
import { WC_1995_1999 } from "./wc/group1995_1999";
import { WC_2003_2007 } from "./wc/group2003_2007";
import { WC_2011_2015 } from "./wc/group2011_2015";
import { WC_2019_2023 } from "./wc/group2019_2023";

// Authoring helpers. Each player: name, role, overall, optional alt roles,
// and optional signature attribute overrides (absolute values 1..99).
type Ov = Partial<Record<Attr, number>>;
interface PDef {
  n: string;
  r: Role;
  o: number;
  alt?: Role[];
  s?: Ov;
}

function squad(
  id: string,
  nation: string,
  year: number,
  flag: string,
  defs: PDef[],
): Squad {
  return {
    id,
    nation,
    year,
    flag,
    players: defs.map((d, i) => ({
      id: `${id}-${i}`,
      name: d.n,
      nation,
      year,
      role: d.r,
      alt: d.alt,
      ovr: d.o,
      overrides: d.s,
    })),
  };
}

export const SQUADS: Squad[] = [
  squad("nzl15", "New Zealand", 2015, "🇳🇿", [
    { n: "Joe Moody", r: "prop", o: 84, s: { setPiece: 86 } },
    { n: "Dane Coles", r: "hooker", o: 89, s: { pace: 80, breakdown: 86 } },
    { n: "Owen Franks", r: "prop", o: 85, s: { setPiece: 88 } },
    { n: "Brodie Retallick", r: "lock", o: 92, s: { setPiece: 92, defence: 90, handling: 80 } },
    { n: "Sam Whitelock", r: "lock", o: 88, s: { setPiece: 90 } },
    { n: "Jerome Kaino", r: "flanker", o: 86, s: { carry: 88, defence: 88 } },
    { n: "Richie McCaw", r: "flanker", o: 93, s: { breakdown: 96, defence: 92, gameManage: 88 } },
    { n: "Kieran Read", r: "number8", o: 90, s: { carry: 90, handling: 86, breakdown: 88 } },
    { n: "Aaron Smith", r: "scrumhalf", o: 89, s: { handling: 92, pace: 84 } },
    { n: "Dan Carter", r: "flyhalf", o: 94, s: { goalKick: 94, gameManage: 93, kick: 90, handling: 88 } },
    { n: "Ma'a Nonu", r: "centre", o: 88, s: { carry: 90, defence: 86 } },
    { n: "Conrad Smith", r: "centre", o: 86, s: { defence: 90, handling: 86 } },
    { n: "Julian Savea", r: "wing", o: 88, s: { pace: 88, carry: 90 } },
    { n: "Nehe Milner-Skudder", r: "wing", o: 84, s: { pace: 88, handling: 84 } },
    { n: "Ben Smith", r: "fullback", o: 88, alt: ["wing"], s: { handling: 88, pace: 86 } },
    { n: "Sonny Bill Williams", r: "centre", o: 86, s: { carry: 90, handling: 88 } },
  ]),

  squad("rsa19", "South Africa", 2019, "🇿🇦", [
    { n: "Tendai Mtawarira", r: "prop", o: 86, s: { setPiece: 88 } },
    { n: "Bongi Mbonambi", r: "hooker", o: 83 },
    { n: "Frans Malherbe", r: "prop", o: 84, s: { setPiece: 89 } },
    { n: "Eben Etzebeth", r: "lock", o: 90, s: { setPiece: 90, defence: 90, carry: 86 } },
    { n: "Lood de Jager", r: "lock", o: 85, s: { setPiece: 88 } },
    { n: "Pieter-Steph du Toit", r: "flanker", o: 90, alt: ["lock"], s: { defence: 92, breakdown: 88 } },
    { n: "Siya Kolisi", r: "flanker", o: 87, s: { breakdown: 88, defence: 88 } },
    { n: "Duane Vermeulen", r: "number8", o: 89, s: { carry: 92, breakdown: 90 } },
    { n: "Faf de Klerk", r: "scrumhalf", o: 88, s: { kick: 88, defence: 84 } },
    { n: "Handré Pollard", r: "flyhalf", o: 87, s: { goalKick: 92, gameManage: 88, kick: 86 } },
    { n: "Damian de Allende", r: "centre", o: 85, s: { carry: 90 } },
    { n: "Lukhanyo Am", r: "centre", o: 86, s: { defence: 88, handling: 88 } },
    { n: "Makazole Mapimpi", r: "wing", o: 86, s: { pace: 90 } },
    { n: "Cheslin Kolbe", r: "wing", o: 89, alt: ["fullback"], s: { pace: 94, handling: 90 } },
    { n: "Willie le Roux", r: "fullback", o: 84, s: { handling: 90 } },
    { n: "Malcolm Marx", r: "hooker", o: 88, s: { breakdown: 92, setPiece: 88 } },
    { n: "RG Snyman", r: "lock", o: 85, s: { setPiece: 86, carry: 84 } },
  ]),

  squad("eng03", "England", 2003, "🏴󠁧󠁢󠁥󠁮󠁧󠁿", [
    { n: "Trevor Woodman", r: "prop", o: 82, s: { setPiece: 85 } },
    { n: "Steve Thompson", r: "hooker", o: 83 },
    { n: "Phil Vickery", r: "prop", o: 85, s: { setPiece: 88 } },
    { n: "Martin Johnson", r: "lock", o: 90, s: { setPiece: 90, defence: 90, gameManage: 88 } },
    { n: "Ben Kay", r: "lock", o: 84, s: { setPiece: 86 } },
    { n: "Richard Hill", r: "flanker", o: 86, s: { breakdown: 88, defence: 88 } },
    { n: "Neil Back", r: "flanker", o: 86, s: { breakdown: 90 } },
    { n: "Lawrence Dallaglio", r: "number8", o: 88, s: { carry: 88, breakdown: 88 } },
    { n: "Matt Dawson", r: "scrumhalf", o: 84, s: { handling: 84 } },
    { n: "Jonny Wilkinson", r: "flyhalf", o: 91, s: { goalKick: 95, kick: 90, defence: 88, gameManage: 90 } },
    { n: "Will Greenwood", r: "centre", o: 85, s: { handling: 88 } },
    { n: "Mike Tindall", r: "centre", o: 82, s: { carry: 86, defence: 86 } },
    { n: "Jason Robinson", r: "wing", o: 88, alt: ["fullback"], s: { pace: 92, handling: 90 } },
    { n: "Ben Cohen", r: "wing", o: 84, s: { carry: 86, pace: 84 } },
    { n: "Josh Lewsey", r: "fullback", o: 83, alt: ["wing"], s: { defence: 84 } },
    { n: "Mike Catt", r: "flyhalf", o: 81, alt: ["centre"], s: { kick: 84 } },
  ]),

  squad("aus99", "Australia", 1999, "🇦🇺", [
    { n: "Richard Harry", r: "prop", o: 80 },
    { n: "Michael Foley", r: "hooker", o: 80 },
    { n: "Andrew Blades", r: "prop", o: 80, s: { setPiece: 84 } },
    { n: "John Eales", r: "lock", o: 90, s: { setPiece: 90, goalKick: 84, gameManage: 86 } },
    { n: "David Giffin", r: "lock", o: 82 },
    { n: "Matt Cockbain", r: "flanker", o: 80 },
    { n: "David Wilson", r: "flanker", o: 83, s: { breakdown: 86 } },
    { n: "Toutai Kefu", r: "number8", o: 85, s: { carry: 90 } },
    { n: "George Gregan", r: "scrumhalf", o: 90, s: { defence: 90, handling: 88 } },
    { n: "Stephen Larkham", r: "flyhalf", o: 88, alt: ["fullback"], s: { handling: 88, gameManage: 88 } },
    { n: "Tim Horan", r: "centre", o: 89, s: { carry: 88, defence: 90 } },
    { n: "Daniel Herbert", r: "centre", o: 82 },
    { n: "Ben Tune", r: "wing", o: 84, s: { pace: 86 } },
    { n: "Joe Roff", r: "wing", o: 85, alt: ["fullback"], s: { pace: 86, goalKick: 80 } },
    { n: "Matt Burke", r: "fullback", o: 87, s: { goalKick: 90, defence: 86 } },
    { n: "Jason Little", r: "centre", o: 83 },
  ]),

  squad("nzl95", "New Zealand", 1995, "🇳🇿", [
    { n: "Craig Dowd", r: "prop", o: 80 },
    { n: "Sean Fitzpatrick", r: "hooker", o: 88, s: { setPiece: 88, gameManage: 86 } },
    { n: "Olo Brown", r: "prop", o: 82, s: { setPiece: 87 } },
    { n: "Ian Jones", r: "lock", o: 83, s: { setPiece: 86 } },
    { n: "Robin Brooke", r: "lock", o: 83 },
    { n: "Michael Jones", r: "flanker", o: 89, s: { breakdown: 90, defence: 90, pace: 84 } },
    { n: "Josh Kronfeld", r: "flanker", o: 85, s: { breakdown: 90 } },
    { n: "Zinzan Brooke", r: "number8", o: 88, s: { handling: 88, carry: 88, kick: 82 } },
    { n: "Graeme Bachop", r: "scrumhalf", o: 83 },
    { n: "Andrew Mehrtens", r: "flyhalf", o: 86, s: { goalKick: 90, gameManage: 86, kick: 86 } },
    { n: "Frank Bunce", r: "centre", o: 85, s: { carry: 86, defence: 86 } },
    { n: "Walter Little", r: "centre", o: 83, s: { handling: 86 } },
    { n: "Jonah Lomu", r: "wing", o: 93, s: { pace: 97, carry: 94, defence: 84 } },
    { n: "Jeff Wilson", r: "wing", o: 86, alt: ["fullback"], s: { pace: 88, goalKick: 80 } },
    { n: "Glen Osborne", r: "fullback", o: 80, alt: ["wing"] },
  ]),

  squad("ire23", "Ireland", 2023, "☘️", [
    { n: "Andrew Porter", r: "prop", o: 86, s: { setPiece: 88 } },
    { n: "Dan Sheehan", r: "hooker", o: 87, s: { pace: 84, breakdown: 86 } },
    { n: "Tadhg Furlong", r: "prop", o: 88, s: { setPiece: 90, carry: 84 } },
    { n: "Tadhg Beirne", r: "lock", o: 87, alt: ["flanker"], s: { breakdown: 90 } },
    { n: "James Ryan", r: "lock", o: 85, s: { setPiece: 88 } },
    { n: "Peter O'Mahony", r: "flanker", o: 83, s: { breakdown: 86 } },
    { n: "Josh van der Flier", r: "flanker", o: 88, s: { breakdown: 90, defence: 88 } },
    { n: "Caelan Doris", r: "number8", o: 88, s: { carry: 88, breakdown: 88 } },
    { n: "Jamison Gibson-Park", r: "scrumhalf", o: 86, s: { pace: 86, handling: 88 } },
    { n: "Johnny Sexton", r: "flyhalf", o: 89, s: { goalKick: 90, gameManage: 92, kick: 88 } },
    { n: "Bundee Aki", r: "centre", o: 87, s: { carry: 90, defence: 88 } },
    { n: "Garry Ringrose", r: "centre", o: 85, s: { defence: 86, handling: 86 } },
    { n: "James Lowe", r: "wing", o: 85, s: { kick: 84, carry: 86 } },
    { n: "Mack Hansen", r: "wing", o: 83, alt: ["fullback"], s: { handling: 86 } },
    { n: "Hugo Keenan", r: "fullback", o: 85, s: { defence: 86, handling: 86 } },
  ]),

  squad("fra11", "France", 2011, "🇫🇷", [
    { n: "Jean-Baptiste Poux", r: "prop", o: 80 },
    { n: "William Servat", r: "hooker", o: 82 },
    { n: "Nicolas Mas", r: "prop", o: 83, s: { setPiece: 88 } },
    { n: "Lionel Nallet", r: "lock", o: 81 },
    { n: "Pascal Papé", r: "lock", o: 80 },
    { n: "Thierry Dusautoir", r: "flanker", o: 88, s: { defence: 92, breakdown: 88 } },
    { n: "Julien Bonnaire", r: "flanker", o: 83, s: { breakdown: 86 } },
    { n: "Imanol Harinordoquy", r: "number8", o: 86, s: { handling: 86, carry: 88 } },
    { n: "Dimitri Yachvili", r: "scrumhalf", o: 83, s: { goalKick: 84, kick: 84 } },
    { n: "Morgan Parra", r: "scrumhalf", o: 82, alt: ["flyhalf"], s: { goalKick: 86 } },
    { n: "François Trinh-Duc", r: "flyhalf", o: 82, s: { handling: 84 } },
    { n: "Aurélien Rougerie", r: "centre", o: 82, alt: ["wing"], s: { carry: 84 } },
    { n: "Maxime Mermoz", r: "centre", o: 80 },
    { n: "Vincent Clerc", r: "wing", o: 84, s: { pace: 88 } },
    { n: "Alexis Palisson", r: "wing", o: 79 },
    { n: "Maxime Médard", r: "fullback", o: 82, alt: ["wing"], s: { handling: 84 } },
  ]),

  squad("wal11", "Wales", 2011, "🏴󠁧󠁢󠁷󠁬󠁳󠁿", [
    { n: "Gethin Jenkins", r: "prop", o: 84, s: { setPiece: 86, breakdown: 84 } },
    { n: "Huw Bennett", r: "hooker", o: 79 },
    { n: "Adam Jones", r: "prop", o: 84, s: { setPiece: 90 } },
    { n: "Alun Wyn Jones", r: "lock", o: 88, s: { setPiece: 90, defence: 88, gameManage: 86 } },
    { n: "Luke Charteris", r: "lock", o: 81, s: { setPiece: 84 } },
    { n: "Dan Lydiate", r: "flanker", o: 83, s: { defence: 90 } },
    { n: "Sam Warburton", r: "flanker", o: 87, s: { breakdown: 90, defence: 88 } },
    { n: "Toby Faletau", r: "number8", o: 86, s: { carry: 88, breakdown: 86 } },
    { n: "Mike Phillips", r: "scrumhalf", o: 84, s: { carry: 84 } },
    { n: "Rhys Priestland", r: "flyhalf", o: 80, s: { goalKick: 84 } },
    { n: "Jamie Roberts", r: "centre", o: 85, s: { carry: 90, defence: 86 } },
    { n: "Jonathan Davies", r: "centre", o: 84, s: { defence: 86, handling: 86 } },
    { n: "George North", r: "wing", o: 87, s: { pace: 90, carry: 90 } },
    { n: "Shane Williams", r: "wing", o: 86, s: { pace: 90, handling: 88 } },
    { n: "Leigh Halfpenny", r: "fullback", o: 86, alt: ["wing"], s: { goalKick: 92, defence: 88 } },
  ]),

  squad("aus91", "Australia", 1991, "🇦🇺", [
    { n: "Tony Daly", r: "prop", o: 80 },
    { n: "Phil Kearns", r: "hooker", o: 84, s: { setPiece: 86 } },
    { n: "Ewen McKenzie", r: "prop", o: 81 },
    { n: "John Eales", r: "lock", o: 87, s: { setPiece: 88, goalKick: 82 } },
    { n: "Rod McCall", r: "lock", o: 80 },
    { n: "Simon Poidevin", r: "flanker", o: 83, s: { breakdown: 86 } },
    { n: "Willie Ofahengaue", r: "flanker", o: 84, alt: ["number8"], s: { carry: 88 } },
    { n: "Tim Gavin", r: "number8", o: 82, s: { carry: 84 } },
    { n: "Nick Farr-Jones", r: "scrumhalf", o: 87, s: { gameManage: 88, defence: 84 } },
    { n: "Michael Lynagh", r: "flyhalf", o: 88, s: { goalKick: 92, gameManage: 90, kick: 88 } },
    { n: "Tim Horan", r: "centre", o: 86, s: { carry: 86, defence: 88 } },
    { n: "Jason Little", r: "centre", o: 83 },
    { n: "David Campese", r: "wing", o: 90, alt: ["fullback"], s: { pace: 92, handling: 92 } },
    { n: "Rob Egerton", r: "wing", o: 78 },
    { n: "Marty Roebuck", r: "fullback", o: 80, s: { goalKick: 82 } },
  ]),

  squad("rsa95", "South Africa", 1995, "🇿🇦", [
    { n: "Os du Randt", r: "prop", o: 88, s: { setPiece: 90, carry: 86 } },
    { n: "Chris Rossouw", r: "hooker", o: 81 },
    { n: "Balie Swart", r: "prop", o: 82, s: { setPiece: 84 } },
    { n: "Kobus Wiese", r: "lock", o: 84, s: { setPiece: 87 } },
    { n: "Hannes Strydom", r: "lock", o: 82 },
    { n: "Ruben Kruger", r: "flanker", o: 86, s: { breakdown: 89, defence: 86 } },
    { n: "François Pienaar", r: "flanker", o: 87, alt: ["number8"], s: { gameManage: 88, breakdown: 86 } },
    { n: "Mark Andrews", r: "number8", o: 85, alt: ["lock"], s: { setPiece: 86 } },
    { n: "Joost van der Westhuizen", r: "scrumhalf", o: 90, s: { pace: 90, defence: 88, carry: 84 } },
    { n: "Joel Stransky", r: "flyhalf", o: 85, s: { goalKick: 89, kick: 86 } },
    { n: "Hennie le Roux", r: "centre", o: 83 },
    { n: "Japie Mulder", r: "centre", o: 83, s: { defence: 87 } },
    { n: "James Small", r: "wing", o: 85, s: { pace: 89 } },
    { n: "Chester Williams", r: "wing", o: 85, s: { pace: 89 } },
    { n: "André Joubert", r: "fullback", o: 86, s: { handling: 88, goalKick: 82 } },
  ]),
  ...WC_1987_1991,
  ...WC_1995_1999,
  ...WC_2003_2007,
  ...WC_2011_2015,
  ...WC_2019_2023,
];

export const ALL_PLAYERS: Player[] = SQUADS.flatMap((s) => s.players);
