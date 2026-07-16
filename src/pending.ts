// Persist an opened-but-unfinished head-to-head challenge so we can nudge the
// player to pick it back up on their next visit. This is the single biggest
// leak in the H2H funnel: people tap a match link, see the size of the ask,
// and bounce — with nothing to pull them back. Stored locally, no account.
import type { MatchChallenge } from "./challenge";

const KEY = "xv_pending_match";

export function savePendingMatch(m: MatchChallenge): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* storage unavailable */
  }
}

export function getPendingMatch(): MatchChallenge | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as MatchChallenge;
    if (!o || !Array.isArray(o.ids)) return null;
    return o;
  } catch {
    return null;
  }
}

export function clearPendingMatch(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
