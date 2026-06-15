import type { Lineup, MatchResult, Player, TournamentResult } from "../types";
import { computeFacets, type Facets } from "./ratings";
import { Rng } from "./rng";

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

function powers(f: Facets) {
  const attack =
    f.attack * 0.5 + f.control * 0.2 + f.setPiece * 0.15 + f.goalKick * 0.15 + f.chemistry * 0.6;
  const defence =
    f.defence * 0.55 + f.breakdown * 0.2 + f.setPiece * 0.15 + f.discipline * 0.1 + f.chemistry * 0.4;
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

  return {
    matches,
    advancedFromPool,
    champion,
    perfect35,
    perfectScore,
    facets,
    chemistry: f.chemistry,
    overall: f.overall,
    verdict,
    identity: deriveIdentity(f),
    triesFor,
    triesAgainst,
    stalwarts,
    advice,
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
