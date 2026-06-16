import type { Lineup, MatchResult, Player, SlotId, TournamentResult } from "../types";
import { computeFacets, getAttrs, type Facets } from "./ratings";
import { Rng } from "./rng";

// Most tries by one player in a single Rugby World Cup tournament.
const RWC_TRY_RECORD = 8; // Jonah Lomu (1999) & Bryan Habana (2007)

const BACK_ROLES = ["scrumhalf", "flyhalf", "centre", "wing", "fullback"];

interface RoundCfg {
  round: string;
  rating: number; // opponent strength
  pool: { name: string; flag: string }[];
}

const ROUNDS: RoundCfg[] = [
  { round: "Pool Match 1", rating: 70, pool: [
    { name: "Namibia", flag: "🇳🇦" }, { name: "Uruguay", flag: "🇺🇾" }, { name: "Romania", flag: "🇷🇴" } ] },
  { round: "Pool Match 2", rating: 77, pool: [
    { name: "Georgia", flag: "🇬🇪" }, { name: "Tonga", flag: "🇹🇴" }, { name: "Samoa", flag: "🇼🇸" } ] },
  { round: "Pool Match 3", rating: 81, pool: [
    { name: "Japan", flag: "🇯🇵" }, { name: "Fiji", flag: "🇫🇯" }, { name: "Italy", flag: "🇮🇹" } ] },
  { round: "Pool Match 4", rating: 84, pool: [
    { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" }, { name: "Argentina", flag: "🇦🇷" }, { name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" } ] },
  { round: "Quarter-final", rating: 85, pool: [
    { name: "Australia", flag: "🇦🇺" }, { name: "Argentina", flag: "🇦🇷" }, { name: "Ireland", flag: "☘️" } ] },
  { round: "Semi-final", rating: 87, pool: [
    { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, { name: "France", flag: "🇫🇷" }, { name: "Ireland", flag: "☘️" } ] },
  { round: "Final", rating: 90, pool: [
    { name: "New Zealand", flag: "🇳🇿" }, { name: "South Africa", flag: "🇿🇦" } ] },
];

// Attacking & defensive output of the XV. Pure player quality — no cohesion
// bonus, since this is a draft game built from players across every era.
// The flat constants preserve the historical difficulty curve after removing
// the old chemistry term.
function powers(f: Facets) {
  const attack =
    f.attack * 0.5 + f.control * 0.2 + f.setPiece * 0.15 + f.goalKick * 0.15 + 6;
  const defence =
    f.defence * 0.55 + f.breakdown * 0.2 + f.setPiece * 0.15 + f.discipline * 0.1 + 4;
  return { attack, defence };
}

function pickMotm(players: Player[], m: MatchResult, rng: Rng): string {
  const attackingGame = m.tries >= 3 || m.pf >= 30;
  const tight = m.triesAg <= 1 || Math.abs(m.pf - m.pa) <= 7;
  const weights = players.map((p) => {
    let w = Math.pow(p.ovr, 2.4);
    const isBack = BACK_ROLES.includes(p.role);
    if (attackingGame && (isBack || p.role === "number8")) w *= 1.8;
    if (tight && !isBack) w *= 1.5;
    return w;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < players.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return players[i].name;
  }
  return players[players.length - 1].name;
}

function simMatch(
  cfg: RoundCfg,
  attack: number,
  defence: number,
  isKnockout: boolean,
  players: Player[],
  rng: Rng,
): MatchResult {
  const opp = rng.pick(cfg.pool);
  const R = cfg.rating;

  const base = 17;
  const k = 0.62;
  let pf = base + k * (attack - R) + rng.normal(0, 7);
  let pa = base + k * (R - defence) + rng.normal(0, 7);
  pf = Math.max(0, Math.round(pf));
  pa = Math.max(0, Math.round(pa));

  let tries = Math.round((attack - R) * 0.09 + 2.4 + rng.normal(0, 1.0));
  tries = Math.max(0, Math.min(9, tries));
  let triesAg = Math.round((R - defence) * 0.09 + 2.0 + rng.normal(0, 1.0));
  triesAg = Math.max(0, Math.min(9, triesAg));

  let won = pf > pa;
  let draw = pf === pa;

  // Knockouts cannot end level — settle in extra time.
  if (draw && isKnockout) {
    const edge = (attack + defence) / 2 - R + rng.normal(0, 6);
    if (edge >= 0) {
      pf += 3;
      won = true;
    } else {
      pa += 3;
    }
    draw = false;
  }

  const bonusPoint = won && tries >= 4;

  const m: MatchResult = {
    round: cfg.round,
    opponent: opp.name,
    oppFlag: opp.flag,
    pf,
    pa,
    tries,
    triesAg,
    won,
    draw,
    bonusPoint,
    motm: "",
  };
  m.motm = pickMotm(players, m, rng);
  return m;
}

function matchPoints(m: MatchResult): number {
  if (m.won) return m.bonusPoint ? 5 : 4;
  if (m.draw) return 2;
  return m.pa - m.pf <= 7 ? 1 : 0;
}

function deriveIdentity(f: Facets): string {
  const entries: [string, number][] = [
    ["Pack of Monsters", f.setPiece],
    ["Breakdown Bandits", f.breakdown],
    ["Iron Curtain", f.defence],
    ["Running Rugby", f.attack],
    ["Masters of Tempo", f.control],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  const [top, second] = entries;
  if (top[1] - second[1] < 2.5) return "Total Rugby";
  return top[0];
}

function deriveStats(
  lineup: Lineup,
  matches: MatchResult[],
  triesFor: number,
  seed: string,
): {
  topScorer: { name: string; points: number; goalPct: number };
  topTryScorer: { name: string; tries: number; note: string };
  funFacts: string[];
} {
  const rng = new Rng(seed + ":stats");
  const ents = (Object.keys(lineup) as SlotId[])
    .filter((s) => lineup[s])
    .map((s) => ({ slot: s, p: lineup[s]!, a: getAttrs(lineup[s]!) }));
  if (ents.length === 0) {
    return {
      topScorer: { name: "", points: 0, goalPct: 0 },
      topTryScorer: { name: "", tries: 0, note: "" },
      funFacts: [],
    };
  }
  const totalPF = matches.reduce((s, m) => s + m.pf, 0);

  // Goal-kicker → tournament points (conversions + penalties + drops).
  const kicker = ents.reduce((b, c) => (c.a.goalKick > b.a.goalKick ? c : b));
  const kickPoints = Math.max(0, totalPF - triesFor * 5);
  const goalPct = Math.max(
    60,
    Math.min(96, Math.round(68 + (kicker.a.goalKick - 80) * 1.05 + rng.normal(0, 1.2))),
  );
  const topScorer = { name: kicker.p.name, points: Math.round(kickPoints), goalPct };

  // Top try-scorer among the finishers.
  const finisherSlots: SlotId[] = ["LW", "RW", "FB", "OC", "IC", "N8"];
  const fins = ents.filter((e) => finisherSlots.includes(e.slot));
  const pool = fins.length ? fins : ents;
  let top = pool[0];
  let topW = -1;
  for (const e of pool) {
    const w =
      e.a.pace * 0.5 +
      e.a.carry * 0.3 +
      e.p.ovr * 0.2 +
      (["LW", "RW", "FB"].includes(e.slot) ? 6 : 0);
    if (w > topW) {
      topW = w;
      top = e;
    }
  }
  let tt = Math.round(triesFor * (0.3 + rng.next() * 0.07));
  tt = Math.max(2, Math.min(triesFor, tt));
  let note: string;
  if (tt > RWC_TRY_RECORD) note = "a brand-new single-tournament World Cup record!";
  else if (tt === RWC_TRY_RECORD) note = "equalling the all-time World Cup record!";
  else if (tt === RWC_TRY_RECORD - 1)
    note = `one shy of the all-time World Cup record (${RWC_TRY_RECORD}).`;
  else note = "your tournament's top finisher.";
  const topTryScorer = { name: top.p.name, tries: tt, note };

  const wall = ents.reduce((b, c) => (c.a.defence > b.a.defence ? c : b));
  const tacklePct = Math.max(
    78,
    Math.min(97, Math.round(82 + (wall.a.defence - 80) * 0.7 + rng.normal(0, 1))),
  );
  const horse = ents.reduce((b, c) => (c.a.carry > b.a.carry ? c : b));
  const carries = Math.max(
    40,
    Math.round(58 + (horse.a.carry - 80) * 2.2 + rng.normal(0, 4)),
  );
  const villain = ents.reduce((b, c) => (c.a.discipline < b.a.discipline ? c : b));
  const pens = Math.max(
    4,
    Math.round(6 + (84 - villain.a.discipline) * 0.28 + rng.normal(0, 1)),
  );

  const funFacts = [
    `${topScorer.name} top-scored the campaign with ${topScorer.points} points, ${goalPct}% off the tee.`,
    `${top.p.name} bagged ${tt} tries — ${note}`,
    `${wall.p.name} was a brick wall: ${tacklePct}% tackle success across the run.`,
    `${horse.p.name} did the hard yards with a squad-high ${carries} carries.`,
    `${villain.p.name} tested the ref's patience — ${pens} penalties conceded.`,
  ];
  return { topScorer, topTryScorer, funFacts };
}

function deriveReview(
  f: Facets,
  matches: MatchResult[],
  flags: { advancedFromPool: boolean; champion: boolean; perfect35: boolean },
  triesFor: number,
  triesAgainst: number,
): { wentWell: string[]; lessons: string[] } {
  const named: [string, number][] = [
    ["set-piece", f.setPiece],
    ["breakdown work", f.breakdown],
    ["defence", f.defence],
    ["attack", f.attack],
    ["midfield control", f.control],
    ["goal-kicking", f.goalKick],
  ];
  const byVal = [...named].sort((a, b) => b[1] - a[1]);
  const best = byVal[0];
  const weakest = byVal[byVal.length - 1];
  const flavour: Record<string, string> = {
    "set-piece": "your scrum and lineout gave a rock-solid platform",
    "breakdown work": "you owned the breakdown and feasted on turnover ball",
    defence: `you strangled teams — only ${triesAgainst} tries conceded all tournament`,
    attack: `you played with width and pace — ${triesFor} tries in 7 matches`,
    "midfield control": "your 9-10 axis dictated tempo and territory",
    "goal-kicking": "you punished every infringement off the tee",
  };

  const wentWell: string[] = [];
  wentWell.push(
    `Your ${best[0]} (${Math.round(best[1])}) was the standout — ${flavour[best[0]]}.`,
  );
  const bp = matches.filter((m) => m.bonusPoint).length;
  if (bp >= 4) wentWell.push(`You racked up ${bp} bonus-point wins — relentless scoring.`);
  else if (byVal[1][1] >= 86)
    wentWell.push(`Your ${byVal[1][0]} (${Math.round(byVal[1][1])}) backed it up nicely.`);

  const lessons: string[] = [];
  if (flags.perfect35) {
    lessons.push("Flawless. There is no level beyond this.");
    return { wentWell, lessons };
  }
  if (flags.champion) {
    const noBp = matches.filter((m) => !m.bonusPoint).length;
    lessons.push(`World Cup won — but the 4-try bonus escaped you in ${noBp} of 7 games.`);
    lessons.push(
      `Your ${weakest[0]} (${Math.round(weakest[1])}) is the unit holding back a Perfect 35 — load up there and hunt four tries a game.`,
    );
    return { wentWell, lessons };
  }
  if (!flags.advancedFromPool) {
    lessons.push("You couldn't escape the pool — the results just didn't fall your way.");
    lessons.push(
      `Your ${weakest[0]} (${Math.round(weakest[1])}) was the softest link — prioritise it next draft.`,
    );
    return { wentWell, lessons };
  }
  const loss = matches[matches.length - 1];
  const margin = loss.pa - loss.pf;
  lessons.push(
    `Your run ended in the ${loss.round.toLowerCase()}, ${loss.pf}–${loss.pa} to ${loss.opponent}.`,
  );
  if (loss.triesAg >= 3)
    lessons.push(
      `They crossed ${loss.triesAg} times — a meaner defensive spine (back row & centres) is the fix.`,
    );
  else if (loss.tries <= 1)
    lessons.push("You couldn't break them down — add a genuine strike finisher out wide.");
  else if (margin <= 4 && f.goalKick < 88)
    lessons.push("Decided by a kick or two — an elite goal-kicker (10 or 15) wins these.");
  else
    lessons.push(
      `Marginal gains in your ${weakest[0]} (${Math.round(weakest[1])}) would have tipped it.`,
    );
  return { wentWell, lessons };
}

export function simulate(lineup: Lineup, seed: string): TournamentResult {
  const f = computeFacets(lineup);
  const { attack, defence } = powers(f);
  const rng = new Rng(seed);
  const players = Object.values(lineup).filter(Boolean) as Player[];

  const matches: MatchResult[] = [];
  let poolWins = 0;

  // Pool stage (first 4).
  for (let i = 0; i < 4; i++) {
    const m = simMatch(ROUNDS[i], attack, defence, false, players, rng);
    matches.push(m);
    if (m.won) poolWins++;
  }
  const advancedFromPool = poolWins >= 2;

  let champion = false;
  if (advancedFromPool) {
    let alive = true;
    for (let i = 4; i < 7; i++) {
      const m = simMatch(ROUNDS[i], attack, defence, true, players, rng);
      matches.push(m);
      if (!m.won) {
        alive = false;
        break;
      }
    }
    champion = alive;
  }

  const playedAll = matches.length === 7;
  const perfect35 =
    champion && playedAll && matches.every((m) => m.won && m.bonusPoint);
  const perfectScore = matches.reduce((s, m) => s + matchPoints(m), 0);

  let verdict: string;
  if (perfect35) verdict = "THE PERFECT 35 — Immortal";
  else if (champion) verdict = "World Champions 🏆";
  else if (!advancedFromPool) verdict = "Eliminated in the Pool Stage";
  else {
    const lastRound = matches[matches.length - 1].round;
    verdict = `Knocked out — ${lastRound}`;
  }

  const facets: Record<string, number> = {
    "Set-piece": f.setPiece,
    Breakdown: f.breakdown,
    Defence: f.defence,
    Attack: f.attack,
    Control: f.control,
    "Goal-kicking": f.goalKick,
  };

  const triesFor = matches.reduce((s, m) => s + m.tries, 0);
  const triesAgainst = matches.reduce((s, m) => s + m.triesAg, 0);

  const awardCount = new Map<string, number>();
  for (const m of matches) awardCount.set(m.motm, (awardCount.get(m.motm) ?? 0) + 1);
  const stalwarts = [...awardCount.entries()]
    .map(([name, awards]) => ({
      name,
      awards,
      ovr: players.find((p) => p.name === name)?.ovr ?? 0,
    }))
    .sort((a, b) => (b.awards !== a.awards ? b.awards - a.awards : b.ovr - a.ovr))
    .slice(0, 3);

  const advice = deriveAdvice(f, matches, {
    advancedFromPool,
    champion,
    perfect35,
    triesAgainst,
  });
  const stats = deriveStats(lineup, matches, triesFor, seed);
  const review = deriveReview(
    f,
    matches,
    { advancedFromPool, champion, perfect35 },
    triesFor,
    triesAgainst,
  );

  return {
    matches,
    advancedFromPool,
    champion,
    perfect35,
    perfectScore,
    facets,
    overall: f.overall,
    verdict,
    identity: deriveIdentity(f),
    triesFor,
    triesAgainst,
    stalwarts,
    advice,
    topScorer: stats.topScorer,
    topTryScorer: stats.topTryScorer,
    funFacts: stats.funFacts,
    review,
  };
}

function deriveAdvice(
  f: Facets,
  matches: MatchResult[],
  flags: { advancedFromPool: boolean; champion: boolean; perfect35: boolean; triesAgainst: number },
): string[] {
  if (flags.perfect35) return ["Flawless. There is no level beyond this."];

  const named: [string, number][] = [
    ["set-piece", f.setPiece],
    ["breakdown", f.breakdown],
    ["defence", f.defence],
    ["attack", f.attack],
    ["midfield control", f.control],
    ["goal-kicking", f.goalKick],
  ];
  named.sort((a, b) => a[1] - b[1]);
  const weakest = named[0][0];

  const out: string[] = [];

  if (flags.champion) {
    const noBp = matches.filter((m) => !m.bonusPoint).length;
    out.push(
      `World Champions — but you missed the 4-try bonus in ${noBp} of 7 games, so the Perfect 35 slipped away.`,
    );
    out.push(
      `To go perfect, draft more attacking punch (weakest unit: ${weakest}) and chase four tries in every match.`,
    );
    return out;
  }

  if (!flags.advancedFromPool) {
    out.push(`You couldn't escape the pool — too many results went against you.`);
    out.push(`Your ${weakest} was your softest unit. Prioritise it on your next draft.`);
    return out;
  }

  // Knocked out of a knockout: the decisive defeat is the final match played.
  const loss = matches[matches.length - 1];
  const margin = loss.pa - loss.pf;
  out.push(
    `Your run ended in the ${loss.round.toLowerCase()}, losing ${loss.pf}–${loss.pa} to ${loss.opponent}.`,
  );

  if (loss.triesAg >= 3 || f.defence <= f.attack - 3) {
    out.push(`You shipped ${loss.triesAg} tries that day — a tougher defensive spine (back row & centres) is the fix.`);
  } else if (loss.tries <= 1 || f.attack <= f.defence - 3) {
    out.push(`You couldn't break them down — add a genuine strike threat out wide to manufacture tries.`);
  } else if (margin <= 4 && f.goalKick < 86) {
    out.push(`It came down to the wire — a top goal-kicker (10 or 15) wins games this tight.`);
  } else {
    out.push(`Marginal gains in your ${weakest} would have tipped it your way.`);
  }
  return out;
}
