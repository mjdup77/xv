// Match-generated injuries: severity 1-10 weeks with rugby flavour.
// Spec: docs/manager/DESIGN-management.md §5.
//
// Tuning (July 2026, after the CEO's week-4 playtest): the original rates
// produced 0.74 new injuries per club per match with P(2+ in a match) at 17%
// — matches felt like casualty lists — while short layoffs (mean 2.9 weeks)
// kept the treatment room nearly empty. Retuned to FEWER, LONGER injuries:
// ~0.5 per club per match, P(2+) < 10%, mean layoff ~4.5 weeks, so a squad
// carries a meaningful injury list mid-season without every report reading
// like a disaster. Verified by `scripts/mgr-sim.ts injuries`.

import { Rng } from "../../engine/rng";
import type { Role } from "../../types";
import type { PlayerRec } from "../types";

/** Expected injuries per club per match: ~0.44 fresh, rising to ~0.55 with
 *  mid-season fatigue — an injury list of ~2 (often 2-4) in mid-season. */
const INJURY_RATE_STARTER = 0.022; // per starter per match
const INJURY_RATE_BENCH = 0.01;

interface InjuryDef {
  label: string;
  weeks: [number, number];
  roles?: Role[]; // flavour restricted to these roles
  w: number;
}

const INJURY_TABLE: InjuryDef[] = [
  { label: "HIA protocol", weeks: [1, 2], w: 10 },
  { label: "dead leg", weeks: [1, 2], w: 6 },
  { label: "rib cartilage", weeks: [2, 4], w: 8 },
  { label: "shoulder stinger", weeks: [2, 4], w: 7 },
  { label: "ankle sprain", weeks: [3, 6], w: 11 },
  { label: "hamstring strain", weeks: [3, 6], w: 12 },
  { label: "knee ligament strain", weeks: [4, 8], w: 11 },
  { label: "calf tear", weeks: [4, 7], w: 9 },
  { label: "neck compression", weeks: [3, 8], roles: ["prop", "hooker", "lock"], w: 7 },
  { label: "broken hand", weeks: [5, 8], w: 8 },
  { label: "syndesmosis damage", weeks: [6, 10], w: 7 },
];

function rollInjury(rng: Rng, p: PlayerRec): { label: string; weeks: number } {
  const eligible = INJURY_TABLE.filter((d) => !d.roles || d.roles.includes(p.role));
  const total = eligible.reduce((s, d) => s + d.w, 0);
  let roll = rng.next() * total;
  let def = eligible[0];
  for (const d of eligible) {
    roll -= d.w;
    if (roll <= 0) {
      def = d;
      break;
    }
  }
  // Older + heavily fatigued players trend to the longer end of the band.
  const skew = Math.min(1, Math.max(0, (p.fatigue - 40) / 80 + (p.age - 27) * 0.03));
  const span = def.weeks[1] - def.weeks[0];
  const weeks = Math.round(def.weeks[0] + span * Math.min(1, rng.next() * 0.8 + skew * 0.5));
  return { label: def.label, weeks: Math.max(1, weeks) };
}

/**
 * Roll post-match injuries for one club's matchday squad (mutates players).
 * Fatigue raises risk — the mechanic that gives rotation teeth.
 */
export function rollMatchInjuries(
  starters: PlayerRec[],
  bench: PlayerRec[],
  seed: string,
): { player: PlayerRec; label: string; weeks: number }[] {
  const rng = new Rng(seed + ":inj");
  const out: { player: PlayerRec; label: string; weeks: number }[] = [];
  const roll = (p: PlayerRec, baseRate: number) => {
    const fatigueMult = 1 + Math.max(0, p.fatigue - 45) / 55; // up to 2x when gassed
    if (rng.next() < baseRate * fatigueMult) {
      const inj = rollInjury(rng, p);
      p.injury = { weeks: inj.weeks, label: inj.label };
      out.push({ player: p, ...inj });
    }
  };
  for (const p of starters) roll(p, INJURY_RATE_STARTER);
  for (const p of bench) roll(p, INJURY_RATE_BENCH);
  return out;
}

/** Weekly tick: injured players heal one week; returns players now fit. */
export function tickInjuries(players: PlayerRec[]): PlayerRec[] {
  const recovered: PlayerRec[] = [];
  for (const p of players) {
    if (!p.injury) continue;
    p.injury.weeks -= 1;
    if (p.injury.weeks <= 0) {
      delete p.injury;
      recovered.push(p);
    }
  }
  return recovered;
}
