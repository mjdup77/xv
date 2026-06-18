// Daily play streak — a lightweight retention hook stored in localStorage.
// A "day" is the player's local calendar day. Playing on consecutive days
// extends the streak; a missed day resets it.

export interface StreakState {
  current: number;
  best: number;
  lastDay: string | null; // YYYY-MM-DD of the last counted play
}

const KEY = "xv_streak";

function dayStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function today(): string {
  return dayStr(new Date());
}
function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayStr(d);
}

export function getStreak(): StreakState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as StreakState;
      if (typeof s.current === "number" && typeof s.best === "number") return s;
    }
  } catch {
    /* ignore */
  }
  return { current: 0, best: 0, lastDay: null };
}

// Call when the player completes a meaningful play (a finished run). Idempotent
// within a day. Returns the updated state.
export function recordPlay(): StreakState {
  const s = getStreak();
  const t = today();
  if (s.lastDay === t) return s; // already counted today
  if (s.lastDay === yesterday()) s.current += 1;
  else s.current = 1;
  s.best = Math.max(s.best, s.current);
  s.lastDay = t;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  return s;
}

export type StreakStatus = "kept" | "alive" | "none";

// How to present the streak right now, without mutating it.
export function streakStatus(s: StreakState = getStreak()): {
  status: StreakStatus;
  current: number;
  best: number;
} {
  const t = today();
  if (s.lastDay === t) return { status: "kept", current: s.current, best: s.best };
  if (s.lastDay === yesterday() && s.current > 0)
    return { status: "alive", current: s.current, best: s.best };
  return { status: "none", current: 0, best: s.best };
}
