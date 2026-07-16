// A local "career" record — the player's lifetime XV stats, kept in
// localStorage. It powers the home trophy cabinet and the return nudges that
// pull players back (best score to beat, head-to-head record, etc.). No
// account needed; this is deliberately first-party and private.

export interface Career {
  runs: number; // finished World Cup runs
  champions: number; // cups won
  perfect35s: number; // Perfect 35s achieved
  bestScore: number; // best /35 score
  h2hWins: number;
  h2hLosses: number;
  h2hDraws: number;
  challengesSent: number; // challenge/match links created to share
}

const KEY = "xv_career";

const EMPTY: Career = {
  runs: 0,
  champions: 0,
  perfect35s: 0,
  bestScore: 0,
  h2hWins: 0,
  h2hLosses: 0,
  h2hDraws: 0,
  challengesSent: 0,
};

export function getCareer(): Career {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<Career>) };
  } catch {
    /* ignore */
  }
  return { ...EMPTY };
}

function save(c: Career): Career {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
  return c;
}

export function recordRun(r: {
  champion: boolean;
  perfect35: boolean;
  score: number;
}): Career {
  const c = getCareer();
  c.runs += 1;
  if (r.champion) c.champions += 1;
  if (r.perfect35) c.perfect35s += 1;
  if (r.score > c.bestScore) c.bestScore = r.score;
  return save(c);
}

// Records a head-to-head from the LOCAL player's perspective (they drafted and
// kicked off). Watching a friend's returned result does not touch the record.
export function recordMatch(homeWon: boolean, draw: boolean): Career {
  const c = getCareer();
  if (draw) c.h2hDraws += 1;
  else if (homeWon) c.h2hWins += 1;
  else c.h2hLosses += 1;
  return save(c);
}

export function recordChallengeSent(): Career {
  const c = getCareer();
  c.challengesSent += 1;
  return save(c);
}

export interface CareerChip {
  value: string;
  label: string;
}

// Compact highlights for the home trophy cabinet. Only returns the chips that
// are meaningful (non-zero), so a brand-new player sees nothing.
export function careerChips(c: Career = getCareer()): CareerChip[] {
  const chips: CareerChip[] = [];
  if (c.runs > 0) chips.push({ value: String(c.runs), label: c.runs === 1 ? "run" : "runs" });
  if (c.bestScore > 0) chips.push({ value: `${c.bestScore}`, label: "best /35" });
  if (c.champions > 0)
    chips.push({ value: `${c.champions}🏆`, label: c.champions === 1 ? "cup" : "cups" });
  if (c.perfect35s > 0) chips.push({ value: `${c.perfect35s}`, label: "Perfect 35" });
  if (c.h2hWins + c.h2hLosses + c.h2hDraws > 0)
    chips.push({ value: `${c.h2hWins}-${c.h2hLosses}`, label: "H2H" });
  return chips;
}

export function h2hRecord(c: Career = getCareer()): string {
  const played = c.h2hWins + c.h2hLosses + c.h2hDraws;
  if (played === 0) return "";
  const parts = [`${c.h2hWins}W`, `${c.h2hLosses}L`];
  if (c.h2hDraws > 0) parts.push(`${c.h2hDraws}D`);
  return parts.join("–");
}
