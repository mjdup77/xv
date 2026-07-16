// Blind Rank — theme engine.
//
// A "theme" carves the full player universe into a candidate pool (e.g. all
// New Zealand players, or every World Cup-winning fly-half). The daily puzzle
// picks one theme and draws 8 players from its pool.
//
// Players who appear in multiple World Cups are DE-DUPLICATED by name — we keep
// their best-rated instance so the same person can never appear twice in one
// puzzle, and their "true" rating is their career peak (identical to `primeOf`).

import type { Player, Role } from "../types";
import { ALL_PLAYERS, SQUADS } from "../data/squads";

// Nation → flag emoji, sourced from the squad data so it always matches.
export const NATION_FLAG: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const s of SQUADS) if (!m[s.nation]) m[s.nation] = s.flag;
  return m;
})();

export function flagFor(nation: string): string {
  return NATION_FLAG[nation] ?? "🏉";
}

// The (nation|year) pairs that actually lifted the William Webb Ellis Cup.
const WC_WINNERS = new Set<string>([
  "New Zealand|1987",
  "Australia|1991",
  "South Africa|1995",
  "Australia|1999",
  "England|2003",
  "South Africa|2007",
  "New Zealand|2011",
  "New Zealand|2015",
  "South Africa|2019",
  "South Africa|2023",
]);

// One person, collapsed across all their World Cup appearances.
export interface UniPlayer {
  player: Player; // best-rated instance (identity + peak rating for the true order)
  nation: string;
  primaryRoles: Set<Role>; // MAIN role of EACH cap (alt roles never included)
  roles: Set<Role>; // union of every role + alt role they ever played
  wonWC: boolean; // were they ever in a title-winning squad?
  flag: string;
}

let UNIVERSE_CACHE: UniPlayer[] | null = null;

// Same real person, authored under two different spellings across appearances.
// Mapped to a single canonical name so they collapse to ONE universe entry
// (their best/prime instance is still what's kept — no ratings invented).
const NAME_ALIASES: Record<string, string> = {
  "Jonathan Sexton": "Johnny Sexton", // capped as both; "Johnny" is the 89 prime
  "Toby Faletau": "Taulupe Faletau", // "Toby" was the early spelling of Taulupe
};

// The name key used for de-duplication: alias-folded, diacritic- and
// case-insensitive, whitespace-normalised. This guarantees "one entry per real
// person" even when a name is spelled inconsistently (e.g. Éric/Eric Champ).
export function personKey(name: string): string {
  const canonical = NAME_ALIASES[name] ?? name;
  return canonical
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// The inverse of an alias: two DIFFERENT real people who happen to share an
// identical name. Each rule buckets an appearance into a distinct identity so
// their ratings and roles never merge. (No ratings invented — each split just
// keeps its own instances.)
const NAME_SPLITS: Record<string, (p: Player) => string> = {
  // Wales #10 legend (1987) vs. the modern Wales #12/#13 centre (2011–2019).
  "jonathan davies": (p) => (p.role === "flyhalf" ? "fh87" : "centre"),
  // "Alfie" the wing/fullback (1999–2003) vs. the 2023 loosehead prop.
  "gareth thomas": (p) => (p.role === "prop" ? "prop" : "back"),
};

// Full de-dup identity: the name key, plus a discriminator when the name is a
// known collision between two distinct people.
export function identityKey(p: Player): string {
  const base = personKey(p.name);
  const split = NAME_SPLITS[base];
  return split ? `${base}#${split(p)}` : base;
}

// Collapse ALL_PLAYERS to one entry per PERSON (best/prime rating wins),
// unioning roles across appearances so position themes stay inclusive of
// versatile players.
export function buildUniverse(): UniPlayer[] {
  if (UNIVERSE_CACHE) return UNIVERSE_CACHE;
  const byPerson = new Map<
    string,
    { best: Player; roles: Set<Role>; primaries: Set<Role>; won: boolean }
  >();
  for (const p of ALL_PLAYERS) {
    const won = WC_WINNERS.has(`${p.nation}|${p.year}`);
    const key = identityKey(p);
    const cur = byPerson.get(key);
    if (!cur) {
      byPerson.set(key, {
        best: p,
        roles: new Set<Role>([p.role, ...(p.alt ?? [])]),
        primaries: new Set<Role>([p.role]), // MAIN role only — never the alts
        won,
      });
    } else {
      cur.roles.add(p.role);
      for (const r of p.alt ?? []) cur.roles.add(r);
      cur.primaries.add(p.role);
      if (p.ovr > cur.best.ovr) cur.best = p;
      cur.won = cur.won || won;
    }
  }
  UNIVERSE_CACHE = Array.from(byPerson.values())
    .map((e) => ({
      player: e.best,
      nation: e.best.nation,
      primaryRoles: e.primaries, // union of every cap's MAIN role (alts excluded)
      roles: e.roles,
      wonWC: e.won,
      flag: flagFor(e.best.nation),
    }))
    // Stable order so downstream shuffles are fully deterministic.
    .sort((a, b) => a.player.id.localeCompare(b.player.id));
  return UNIVERSE_CACHE;
}

// ---- Position groups (map a player's PRIMARY roles → rugby unit) ----
// Purity rule: eligibility tests the set of MAIN roles across a player's caps
// (alt roles are never included). A versatile star qualifies for every unit
// they genuinely started in, but never bleeds in via an alt-only role.
const isBackThree = (r: Set<Role>) => r.has("wing") || r.has("fullback");
const isBackRow = (r: Set<Role>) => r.has("flanker") || r.has("number8");
const isFrontRow = (r: Set<Role>) => r.has("prop") || r.has("hooker");
const isTightFive = (r: Set<Role>) =>
  r.has("prop") || r.has("hooker") || r.has("lock");
const isForward = (r: Set<Role>) =>
  r.has("prop") ||
  r.has("hooker") ||
  r.has("lock") ||
  r.has("flanker") ||
  r.has("number8");
const isBack = (r: Set<Role>) => !isForward(r);

export interface Theme {
  id: string;
  title: string;
  blurb: string; // short "rank these …" descriptor shown to the player
  filter: (u: UniPlayer) => boolean;
}

const nation = (id: string, title: string, blurb: string, nat: string): Theme => ({
  id,
  title,
  blurb,
  filter: (u) => u.nation === nat,
});

// The curated pool. Validated (scripts scratch-check) so every theme yields
// ≥ 8 de-duplicated players. A mix of granularities keeps the daily fresh.
export const THEMES: Theme[] = [
  // ---- Nation ----
  nation("nat-nzl", "All-time All Blacks", "the greatest New Zealanders", "New Zealand"),
  nation("nat-rsa", "All-time Springboks", "the greatest South Africans", "South Africa"),
  nation("nat-eng", "All-time England", "the greatest Englishmen", "England"),
  nation("nat-aus", "All-time Wallabies", "the greatest Australians", "Australia"),
  nation("nat-fra", "All-time France", "the greatest Frenchmen", "France"),
  nation("nat-wal", "All-time Wales", "the greatest Welshmen", "Wales"),
  nation("nat-ire", "All-time Ireland", "the greatest Irishmen", "Ireland"),
  nation("nat-arg", "All-time Argentina", "the greatest Pumas", "Argentina"),

  // ---- Position (whole universe) — pure by PRIMARY roles (alts excluded) ----
  { id: "pos-fh", title: "Fly-halves", blurb: "the No. 10s", filter: (u) => u.primaryRoles.has("flyhalf") },
  { id: "pos-sh", title: "Scrum-halves", blurb: "the No. 9s", filter: (u) => u.primaryRoles.has("scrumhalf") },
  { id: "pos-pr", title: "Props", blurb: "the tightheads & looseheads", filter: (u) => u.primaryRoles.has("prop") },
  { id: "pos-hk", title: "Hookers", blurb: "the No. 2s", filter: (u) => u.primaryRoles.has("hooker") },
  { id: "pos-lk", title: "Locks", blurb: "the second row", filter: (u) => u.primaryRoles.has("lock") },
  { id: "pos-br", title: "Loose forwards", blurb: "the back row — flankers & No. 8s", filter: (u) => isBackRow(u.primaryRoles) },
  { id: "pos-ce", title: "Centres", blurb: "the midfield", filter: (u) => u.primaryRoles.has("centre") },
  { id: "pos-b3", title: "Back three", blurb: "the wings & fullbacks", filter: (u) => isBackThree(u.primaryRoles) },
  { id: "pos-wg", title: "Wings", blurb: "the finishers", filter: (u) => u.primaryRoles.has("wing") },
  { id: "pos-fb", title: "Fullbacks", blurb: "the No. 15s", filter: (u) => u.primaryRoles.has("fullback") },

  // ---- World Cup winners ----
  { id: "win-all", title: "World Cup winners", blurb: "players who lifted the cup", filter: (u) => u.wonWC },
  { id: "win-fwd", title: "World Cup-winning forwards", blurb: "title-winning forwards", filter: (u) => u.wonWC && isForward(u.primaryRoles) },
  { id: "win-back", title: "World Cup-winning backs", blurb: "title-winning backs", filter: (u) => u.wonWC && isBack(u.primaryRoles) },
  { id: "win-t5", title: "World Cup-winning tight five", blurb: "title-winning props, hookers & locks", filter: (u) => u.wonWC && isTightFive(u.primaryRoles) },

  // ---- Granular / spicy combos — nation + PRIMARY roles ----
  { id: "aus-b3", title: "Wallaby back three", blurb: "Australia's wings & fullbacks", filter: (u) => u.nation === "Australia" && isBackThree(u.primaryRoles) },
  { id: "nzl-br", title: "All Black loose forwards", blurb: "New Zealand's back row", filter: (u) => u.nation === "New Zealand" && isBackRow(u.primaryRoles) },
  { id: "nzl-b3", title: "All Black back three", blurb: "New Zealand's wings & fullbacks", filter: (u) => u.nation === "New Zealand" && isBackThree(u.primaryRoles) },
  { id: "rsa-fwd", title: "Springbok forwards", blurb: "South Africa's pack", filter: (u) => u.nation === "South Africa" && isForward(u.primaryRoles) },
  { id: "rsa-fr", title: "Springbok front row", blurb: "South Africa's props & hookers", filter: (u) => u.nation === "South Africa" && isFrontRow(u.primaryRoles) },
  { id: "eng-fwd", title: "England forwards", blurb: "England's pack", filter: (u) => u.nation === "England" && isForward(u.primaryRoles) },
  { id: "eng-back", title: "England backs", blurb: "England's backline", filter: (u) => u.nation === "England" && isBack(u.primaryRoles) },
  { id: "fra-back", title: "French flair", blurb: "France's backline", filter: (u) => u.nation === "France" && isBack(u.primaryRoles) },
  { id: "wal-back", title: "Welsh backs", blurb: "Wales's backline", filter: (u) => u.nation === "Wales" && isBack(u.primaryRoles) },
  { id: "ire-fwd", title: "Irish forwards", blurb: "Ireland's pack", filter: (u) => u.nation === "Ireland" && isForward(u.primaryRoles) },
  { id: "nzl-fwd", title: "All Black forwards", blurb: "New Zealand's pack", filter: (u) => u.nation === "New Zealand" && isForward(u.primaryRoles) },
  { id: "aus-fwd", title: "Wallaby forwards", blurb: "Australia's pack", filter: (u) => u.nation === "Australia" && isForward(u.primaryRoles) },
];

// The candidate pool for a theme: every unique player it matches, in a stable
// deterministic order (so seeded selection is reproducible).
export function themePool(theme: Theme, universe: UniPlayer[] = buildUniverse()): UniPlayer[] {
  return universe.filter(theme.filter);
}

export const MIN_POOL = 8;
