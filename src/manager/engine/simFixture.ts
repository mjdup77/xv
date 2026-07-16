// League match engine — a parameterised port of the guts of simH2H
// (src/engine/sim.ts), per scoping §1: the manager module re-implements the
// wrapper rather than editing the shared engine. Facet math (computeFacets /
// getAttrs) is imported unchanged; what differs here: home advantage, draws
// allowed in league play, game-plan power blends, squad fit, cohesion,
// emphasis, and bench quality (docs/manager/DESIGN-tactics.md).

import type { Lineup, SlotId } from "../../types";
import { computeFacets, getAttrs } from "../../engine/ratings";
import { Rng } from "../../engine/rng";
import type { ClubId, EmphasisId, GamePlanId, ReportMoment } from "../types";
import {
  DAY_FORM_SD,
  EMPHASES,
  GAME_PLANS,
  HOME_ADVANTAGE,
  benchMod,
  cohesionMod,
  fitMod,
} from "./tactics";

const clampN = (lo: number, hi: number, v: number) => Math.max(lo, Math.min(hi, v));

export interface SideInput {
  clubId: ClubId;
  label: string;
  /** Effective lineup — players already adjusted for form/fatigue. */
  lineup: Lineup;
  /** Average effective ovr of the (up to 8) bench players. */
  benchAvg: number;
  plan: GamePlanId;
  emphasis: EmphasisId;
  /** Team cohesion C, 0..1. */
  cohesion: number;
}

export interface SideResult {
  clubId: ClubId;
  label: string;
  tries: number;
  cons: number;
  pens: number;
  drops: number;
  points: number;
  tryScorers: string[];
  fitMod: number;
  cohesionMod: number;
}

export interface FixtureSim {
  home: SideResult;
  away: SideResult;
  draw: boolean;
  homeWon: boolean; // false on draw
  timeline: ReportMoment[];
  motm: { name: string; team: string };
  headline: string;
}

function kickPct(gk: number): number {
  return clampN(0.5, 0.92, 0.5 + (gk - 72) * 0.013);
}

// Same weighting as the engine's pickScorers: finishers first, carriers next.
function pickScorers(lineup: Lineup, n: number, rng: Rng): string[] {
  const ents = (Object.keys(lineup) as SlotId[])
    .filter((s) => lineup[s])
    .map((s) => ({ s, p: lineup[s]!, a: getAttrs(lineup[s]!) }));
  if (!ents.length) return [];
  const wOf = (e: (typeof ents)[number]) => {
    const fin = ["LW", "RW", "FB"].includes(e.s)
      ? 8
      : ["OC", "IC", "N8", "F7", "F6"].includes(e.s)
        ? 3
        : 0.6;
    return (e.a.pace * 0.5 + e.a.carry * 0.3 + e.p.ovr * 0.2) * 0.05 + fin;
  };
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const total = ents.reduce((s, e) => s + wOf(e), 0);
    let roll = rng.next() * total;
    let chosen = ents[0];
    for (const e of ents) {
      roll -= wOf(e);
      if (roll <= 0) {
        chosen = e;
        break;
      }
    }
    out.push(chosen.p.name);
  }
  return out;
}

function bestKicker(lineup: Lineup): string {
  let name = "";
  let best = -1;
  for (const p of Object.values(lineup)) {
    if (!p) continue;
    const gk = getAttrs(p).goalKick;
    if (gk > best) {
      best = gk;
      name = p.name;
    }
  }
  return name;
}

function pickMotm(
  home: SideInput,
  away: SideInput,
  homeScorers: string[],
  awayScorers: string[],
  homeWon: boolean,
  draw: boolean,
  rng: Rng,
): { name: string; team: string } {
  const cands: { name: string; team: string; w: number }[] = [];
  const add = (side: SideInput, win: boolean, scorers: string[]) => {
    for (const p of Object.values(side.lineup)) {
      if (!p) continue;
      let w = Math.pow(p.ovr, 2.4);
      if (win && !draw) w *= 1.7;
      const scored = scorers.filter((nm) => nm === p.name).length;
      w *= 1 + scored * 0.9;
      cands.push({ name: p.name, team: side.label, w });
    }
  };
  add(home, homeWon, homeScorers);
  add(away, !homeWon, awayScorers);
  const total = cands.reduce((s, c) => s + c.w, 0);
  let roll = rng.next() * total;
  for (const c of cands) {
    roll -= c.w;
    if (roll <= 0) return { name: c.name, team: c.team };
  }
  return { name: cands[0].name, team: cands[0].team };
}

export function simFixture(
  home: SideInput,
  away: SideInput,
  opts: { seed: string; knockout: boolean; neutralVenue?: boolean },
): FixtureSim {
  const rng = new Rng(opts.seed + ":fx");

  const fh = computeFacets(home.lineup);
  const fa = computeFacets(away.lineup);

  const planH = GAME_PLANS[home.plan];
  const planA = GAME_PLANS[away.plan];

  // Powers: plan blend + flat modifiers (fit, cohesion, emphasis, home, bench).
  const fitH = fitMod(home.plan, fh);
  const fitA = fitMod(away.plan, fa);
  const cohH = cohesionMod(home.cohesion);
  const cohA = cohesionMod(away.cohesion);
  const homeBump = opts.neutralVenue ? 0 : HOME_ADVANTAGE;

  // Day form: any side can turn up flat or inspired — the upset generator
  // that keeps a strong squad from making every fixture a formality.
  const dayH = rng.normal(0, DAY_FORM_SD);
  const dayA = rng.normal(0, DAY_FORM_SD);

  const modH = fitH + cohH + benchMod(home.benchAvg) + homeBump + dayH;
  const modA = fitA + cohA + benchMod(away.benchAvg) + dayA;

  const attH = planH.attackPower(fh) + modH + EMPHASES[home.emphasis].attack;
  const defH = planH.defencePower(fh) + modH + EMPHASES[home.emphasis].defence;
  const attA = planA.attackPower(fa) + modA + EMPHASES[away.emphasis].attack;
  const defA = planA.defencePower(fa) + modA + EMPHASES[away.emphasis].defence;

  // Tries: engine curve + style deltas from both plans.
  const tryCount = (att: number, def: number, style: number) => {
    const t = Math.round(2.6 + (att - def) * 0.2 + style + rng.normal(0, 1.25));
    return Math.max(0, Math.min(9, t));
  };
  const styleH = planH.styleTryDelta + planA.styleTryDelta;
  const hTries = tryCount(attH, defA, styleH);
  const aTries = tryCount(attA, defH, styleH);

  const hKick = kickPct(fh.goalKick);
  const aKick = kickPct(fa.goalKick);
  const hCons = Math.round(hTries * hKick);
  const aCons = Math.round(aTries * aKick);

  const pens = (gk: number, oppDisc: number, planBonus: number) => {
    const chances = Math.max(
      0,
      Math.round(rng.normal(2.5 - (oppDisc - 80) * 0.05 + planBonus, 1.0)),
    );
    return Math.round(chances * Math.max(0.5, kickPct(gk)));
  };
  const hPens = pens(fh.goalKick, fa.discipline, planH.penChanceBonus);
  const aPens = pens(fa.goalKick, fh.discipline, planA.penChanceBonus);

  const hDrop = rng.next() < 0.1 ? 1 : 0;
  const aDrop = rng.next() < 0.1 ? 1 : 0;

  let hPts = hTries * 5 + hCons * 2 + hPens * 3 + hDrop * 3;
  let aPts = aTries * 5 + aCons * 2 + aPens * 3 + aDrop * 3;

  // League matches may draw; knockouts go to golden point.
  let golden = false;
  if (hPts === aPts && opts.knockout) {
    golden = true;
    const edge = attH + defH - (attA + defA) + rng.normal(0, 8);
    if (edge >= 0) hPts += 3;
    else aPts += 3;
  }
  const draw = hPts === aPts;
  const homeWon = hPts > aPts;

  const hScorers = pickScorers(home.lineup, hTries, rng);
  const aScorers = pickScorers(away.lineup, aTries, rng);

  // Scoring timeline (the first `cons` tries on each side are the converted ones).
  const raw: Omit<ReportMoment, "minute">[] = [];
  const hKicker = bestKicker(home.lineup);
  const aKicker = bestKicker(away.lineup);
  hScorers.forEach((nm, i) => {
    const conv = i < hCons;
    raw.push({ side: "home", kind: "try", text: `${nm} touches down for ${home.label}${conv ? " (converted)" : ""}`, points: conv ? 7 : 5 });
  });
  aScorers.forEach((nm, i) => {
    const conv = i < aCons;
    raw.push({ side: "away", kind: "try", text: `${nm} touches down for ${away.label}${conv ? " (converted)" : ""}`, points: conv ? 7 : 5 });
  });
  for (let i = 0; i < hPens; i++)
    raw.push({ side: "home", kind: "pen", text: `${hKicker} slots a penalty`, points: 3 });
  for (let i = 0; i < aPens; i++)
    raw.push({ side: "away", kind: "pen", text: `${aKicker} slots a penalty`, points: 3 });
  if (hDrop) raw.push({ side: "home", kind: "drop", text: `${hKicker} drops a goal`, points: 3 });
  if (aDrop) raw.push({ side: "away", kind: "drop", text: `${aKicker} drops a goal`, points: 3 });

  const minutes = rng
    .shuffle(Array.from({ length: 79 }, (_, i) => i + 1))
    .slice(0, raw.length)
    .sort((a, b) => a - b);
  const timeline: ReportMoment[] = raw
    .map((m, i) => ({ ...m, minute: minutes[i] ?? 80 }))
    .sort((a, b) => a.minute - b.minute);
  if (golden)
    timeline.push({
      minute: 80,
      side: homeWon ? "home" : "away",
      kind: "drop",
      text: `Extra time! ${homeWon ? home.label : away.label} land the golden-point winner`,
      points: 3,
    });

  const motm = pickMotm(home, away, hScorers, aScorers, homeWon, draw, rng);

  const margin = Math.abs(hPts - aPts);
  const winner = homeWon ? home.label : away.label;
  let headline: string;
  if (draw) headline = `All square — honours even`;
  else if (golden) headline = `${winner} steals it at the death!`;
  else if (margin <= 5) headline = `${winner} edges a nerve-shredding classic`;
  else if (margin >= 28) headline = `${winner} runs riot`;
  else if (margin >= 15) headline = `${winner} pulls clear for a statement win`;
  else headline = `${winner} proves a class apart`;

  return {
    home: { clubId: home.clubId, label: home.label, tries: hTries, cons: hCons, pens: hPens, drops: hDrop, points: hPts, tryScorers: hScorers, fitMod: fitH, cohesionMod: cohH },
    away: { clubId: away.clubId, label: away.label, tries: aTries, cons: aCons, pens: aPens, drops: aDrop, points: aPts, tryScorers: aScorers, fitMod: fitA, cohesionMod: cohA },
    draw,
    homeWon,
    timeline,
    motm,
    headline,
  };
}

/** Premiership league points: 4 win / 2 draw / 0 loss, +1 for 4+ tries (any
 *  result), +1 for losing by 7 or fewer. */
export function leaguePoints(
  pf: number,
  pa: number,
  tries: number,
): { points: number; tryBonus: boolean; loseBonus: boolean } {
  const tryBonus = tries >= 4;
  const loseBonus = pf < pa && pa - pf <= 7;
  let points = pf > pa ? 4 : pf === pa ? 2 : 0;
  if (tryBonus) points += 1;
  if (loseBonus) points += 1;
  return { points, tryBonus, loseBonus };
}
