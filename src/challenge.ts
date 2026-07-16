import type { Lineup } from "./types";
import { SLOTS } from "./data/slots";
import { PLAYER_BY_ID, primeOf } from "./data/squads";

// "Challenge a friend" links. A run is fully reproducible from its seed + the
// three settings, because the draft sequence is deterministic. We pack those
// (plus the challenger's score, for the beat-it prompt) into a compact URL param.

export interface Challenge {
  seed: string;
  era: string;
  rating: string;
  diff: string;
  score: number;
  verdict: string;
  champion: boolean;
}

function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeChallenge(c: Challenge): string {
  const o = {
    s: c.seed,
    e: c.era,
    r: c.rating,
    d: c.diff,
    sc: c.score,
    v: c.verdict,
    c: c.champion ? 1 : 0,
  };
  return b64urlEncode(JSON.stringify(o));
}

export function decodeChallenge(str: string): Challenge | null {
  try {
    const o = JSON.parse(b64urlDecode(str)) as Record<string, unknown>;
    if (!o || typeof o.s !== "string") return null;
    return {
      seed: o.s,
      era: String(o.e ?? "all"),
      rating: String(o.r ?? "seasonal"),
      diff: String(o.d ?? "medium"),
      score: Number(o.sc) || 0,
      verdict: String(o.v ?? ""),
      champion: !!o.c,
    };
  } catch {
    return null;
  }
}

const BASE = "https://xv-7-0.vercel.app/";

// URL after a consumed link param is removed — keeps the remaining query
// (utm attribution) AND the hash route, so scrubbing never changes the page.
function scrubbedUrl(p: URLSearchParams): string {
  const qs = p.toString();
  return location.pathname + (qs ? "?" + qs : "") + location.hash;
}

export function challengeLink(c: Challenge): string {
  return `${BASE}?c=${encodeChallenge(c)}&utm_source=share&utm_medium=challenge`;
}

// Reads an incoming challenge from the URL and scrubs the `c` param so a reload
// doesn't re-trigger it (utm params are left intact for attribution).
export function readIncomingChallenge(): Challenge | null {
  try {
    const p = new URLSearchParams(location.search);
    const raw = p.get("c");
    if (!raw) return null;
    const parsed = decodeChallenge(raw);
    p.delete("c");
    history.replaceState(null, "", scrubbedUrl(p));
    return parsed;
  } catch {
    return null;
  }
}

// ---- Head-to-head match challenge: a full 15-man XV packed into a link ----

export interface MatchChallenge {
  ids: string[]; // 15 player ids in SLOTS order
  rating: string; // rating mode used to draft (so primes rebuild correctly)
  era: string;
  diff: string;
  name: string; // challenger's label
  overall: number; // challenger team rating, for the prompt
}

export function encodeMatch(m: MatchChallenge): string {
  const o = {
    i: m.ids,
    r: m.rating,
    e: m.era,
    d: m.diff,
    n: m.name,
    o: Math.round(m.overall),
  };
  return b64urlEncode(JSON.stringify(o));
}

export function decodeMatch(str: string): MatchChallenge | null {
  try {
    const o = JSON.parse(b64urlDecode(str)) as Record<string, unknown>;
    const ids = Array.isArray(o.i) ? (o.i as unknown[]).map(String) : [];
    if (ids.length !== SLOTS.length) return null;
    return {
      ids,
      rating: String(o.r ?? "seasonal"),
      era: String(o.e ?? "all"),
      diff: String(o.d ?? "medium"),
      name: String(o.n ?? "A friend"),
      overall: Number(o.o) || 0,
    };
  } catch {
    return null;
  }
}

// Rebuild a playable Lineup from the encoded ids. Returns null if any player
// can't be resolved (e.g. the dataset changed since the link was created).
export function lineupFromMatch(m: MatchChallenge): Lineup | null {
  const out: Lineup = {};
  for (let i = 0; i < SLOTS.length; i++) {
    const base = PLAYER_BY_ID.get(m.ids[i]);
    if (!base) return null;
    out[SLOTS[i].id] = m.rating === "prime" ? primeOf(base) : base;
  }
  return out;
}

export function matchLink(m: MatchChallenge): string {
  return `${BASE}?m=${encodeMatch(m)}&utm_source=share&utm_medium=match`;
}

export function readIncomingMatch(): MatchChallenge | null {
  try {
    const p = new URLSearchParams(location.search);
    const raw = p.get("m");
    if (!raw) return null;
    const parsed = decodeMatch(raw);
    p.delete("m");
    history.replaceState(null, "", scrubbedUrl(p));
    return parsed;
  } catch {
    return null;
  }
}

// ---- Match RESULT link: replays one exact played match for the other player ----
// The match seed already encodes both XVs + the nonce, so the result is fully
// reproducible. We just carry the seed, the two team labels, and the rating so
// the recipient watches the identical 80 minutes the sender saw.
export interface MatchResultLink {
  seed: string;
  hl: string; // home team label (e.g. "Sam's XV")
  al: string; // away team label
  rating: string;
}

export function encodeMatchResult(m: MatchResultLink): string {
  return b64urlEncode(JSON.stringify({ s: m.seed, hl: m.hl, al: m.al, r: m.rating }));
}

export function decodeMatchResult(str: string): MatchResultLink | null {
  try {
    const o = JSON.parse(b64urlDecode(str)) as Record<string, unknown>;
    if (!o || typeof o.s !== "string") return null;
    return {
      seed: o.s,
      hl: String(o.hl ?? "Home XV"),
      al: String(o.al ?? "Away XV"),
      rating: String(o.r ?? "seasonal"),
    };
  } catch {
    return null;
  }
}

// Rebuild both lineups from a match seed of the form
// "m:<homeIds>|<awayIds>:<nonce>". Returns null if anything won't resolve.
export function lineupsFromMatchSeed(
  seed: string,
  rating: string,
): { home: Lineup; away: Lineup; nonce: number } | null {
  if (!seed.startsWith("m:")) return null;
  const body = seed.slice(2);
  const colon = body.lastIndexOf(":");
  if (colon < 0) return null;
  const nonce = Number(body.slice(colon + 1)) || 0;
  const [hPart, aPart] = body.slice(0, colon).split("|");
  if (!hPart || !aPart) return null;
  const build = (csv: string): Lineup | null => {
    const ids = csv.split(",");
    if (ids.length !== SLOTS.length) return null;
    const out: Lineup = {};
    for (let i = 0; i < SLOTS.length; i++) {
      const base = PLAYER_BY_ID.get(ids[i]);
      if (!base) return null;
      out[SLOTS[i].id] = rating === "prime" ? primeOf(base) : base;
    }
    return out;
  };
  const home = build(hPart);
  const away = build(aPart);
  if (!home || !away) return null;
  return { home, away, nonce };
}

export function matchResultLink(m: MatchResultLink): string {
  return `${BASE}?mr=${encodeMatchResult(m)}&utm_source=share&utm_medium=result`;
}

// ---- Combined "Challenge a friend" link (the unified loop, `?x=`) ----
// One link that carries EVERYTHING both response modes need, so the recipient
// picks how to reply:
//   • Beat their score  — a SOLO run of the challenger's exact draft (seed +
//     settings), aiming to top their /35.
//   • Play their XV      — a head-to-head match against the challenger's 15-man
//     lineup (Quick Play auto-draft or full draft).
// It's a superset of `Challenge` (seed/settings/score) and `MatchChallenge`
// (lineup ids/name/overall); the sub-objects below let us reuse the existing
// accept + kickoff code paths verbatim.
export interface CombinedChallenge {
  seed: string;
  era: string;
  rating: string;
  diff: string;
  score: number; // challenger's /35 (0 when created from a context without one)
  verdict: string;
  champion: boolean;
  ids: string[]; // 15 player ids in SLOTS order (the challenger's XV)
  name: string; // challenger's label
  overall: number; // challenger team rating
}

export function encodeCombined(c: CombinedChallenge): string {
  const o = {
    s: c.seed,
    e: c.era,
    r: c.rating,
    d: c.diff,
    sc: c.score,
    v: c.verdict,
    c: c.champion ? 1 : 0,
    i: c.ids,
    n: c.name,
    o: Math.round(c.overall),
  };
  return b64urlEncode(JSON.stringify(o));
}

export function decodeCombined(str: string): CombinedChallenge | null {
  try {
    const o = JSON.parse(b64urlDecode(str)) as Record<string, unknown>;
    if (!o || typeof o.s !== "string") return null;
    const ids = Array.isArray(o.i) ? (o.i as unknown[]).map(String) : [];
    return {
      seed: o.s,
      era: String(o.e ?? "all"),
      rating: String(o.r ?? "seasonal"),
      diff: String(o.d ?? "medium"),
      score: Number(o.sc) || 0,
      verdict: String(o.v ?? ""),
      champion: !!o.c,
      ids,
      name: String(o.n ?? "A friend"),
      overall: Number(o.o) || 0,
    };
  } catch {
    return null;
  }
}

// Project a combined challenge onto the existing `Challenge` shape so the solo
// "beat their score" run reuses `startRun({ accept })` unchanged.
export function challengeFromCombined(c: CombinedChallenge): Challenge {
  return {
    seed: c.seed,
    era: c.era,
    rating: c.rating,
    diff: c.diff,
    score: c.score,
    verdict: c.verdict,
    champion: c.champion,
  };
}

// Project onto `MatchChallenge` so "play their XV" reuses the head-to-head
// accept path unchanged. Returns null if the lineup can't be represented (e.g.
// the link predates the current dataset / has the wrong number of ids).
export function matchFromCombined(c: CombinedChallenge): MatchChallenge | null {
  if (c.ids.length !== SLOTS.length) return null;
  return {
    ids: c.ids,
    rating: c.rating,
    era: c.era,
    diff: c.diff,
    name: c.name,
    overall: c.overall,
  };
}

export function combinedLink(c: CombinedChallenge): string {
  return `${BASE}?x=${encodeCombined(c)}&utm_source=share&utm_medium=challenge`;
}

// Reads an incoming combined challenge and scrubs the `x` param so a reload
// doesn't re-trigger it (utm params are left intact for attribution).
export function readIncomingCombined(): CombinedChallenge | null {
  try {
    const p = new URLSearchParams(location.search);
    const raw = p.get("x");
    if (!raw) return null;
    const parsed = decodeCombined(raw);
    p.delete("x");
    history.replaceState(null, "", scrubbedUrl(p));
    return parsed;
  } catch {
    return null;
  }
}

export function readIncomingMatchResult(): MatchResultLink | null {
  try {
    const p = new URLSearchParams(location.search);
    const raw = p.get("mr");
    if (!raw) return null;
    const parsed = decodeMatchResult(raw);
    p.delete("mr");
    history.replaceState(null, "", scrubbedUrl(p));
    return parsed;
  } catch {
    return null;
  }
}
