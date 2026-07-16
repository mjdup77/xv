// The most recent completed SOLO run, stored locally so the unified "Challenge
// a friend" action can be offered where there's no run in progress — the home
// screen (always-available secondary entry) and the Blind Rank result (an
// aligned extra action). Saved on every solo kick-off; carries everything a
// combined `?x=` link needs. Name is applied at share time (we may not have it
// yet when the run finishes).
import type { CombinedChallenge } from "./challenge";

const KEY = "xv_last_challenge";

// Everything a combined link needs except the challenger's display name.
export type LastChallenge = Omit<CombinedChallenge, "name">;

export function saveLastChallenge(c: LastChallenge): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable */
  }
}

export function getLastChallenge(): LastChallenge | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as LastChallenge;
    if (!o || typeof o.seed !== "string" || !Array.isArray(o.ids)) return null;
    return o;
  } catch {
    return null;
  }
}
