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
    const qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
    return parsed;
  } catch {
    return null;
  }
}
