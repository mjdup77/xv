// League table computation from played fixtures (rugby bonus points — both
// launch leagues use 4/2/0 +4-try +7-point-losing), plus the URC's regional
// Shield races (pool games only).

import type { ClubId, Fixture, ShieldDef, TableRow } from "../types";
import { leaguePoints } from "./simFixture";

export function computeTable(clubIds: ClubId[], fixtures: Fixture[]): TableRow[] {
  const rows = new Map<ClubId, TableRow>(
    clubIds.map((id) => [
      id,
      { clubId: id, played: 0, won: 0, drawn: 0, lost: 0, pf: 0, pa: 0, triesFor: 0, tryBonus: 0, loseBonus: 0, points: 0 },
    ]),
  );

  for (const fx of fixtures) {
    if (!fx.result) continue;
    const { homePts, awayPts, homeTries, awayTries } = fx.result;
    const apply = (id: ClubId, pf: number, pa: number, tries: number) => {
      const r = rows.get(id)!;
      r.played++;
      r.pf += pf;
      r.pa += pa;
      r.triesFor += tries;
      if (pf > pa) r.won++;
      else if (pf === pa) r.drawn++;
      else r.lost++;
      const lp = leaguePoints(pf, pa, tries);
      r.points += lp.points;
      if (lp.tryBonus) r.tryBonus++;
      if (lp.loseBonus) r.loseBonus++;
    };
    apply(fx.homeId, homePts, awayPts, homeTries);
    apply(fx.awayId, awayPts, homePts, awayTries);
  }

  return [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.pf - b.pa - (a.pf - a.pa) ||
      b.triesFor - a.triesFor ||
      a.clubId.localeCompare(b.clubId),
  );
}

export function tablePosition(table: TableRow[], clubId: ClubId): number {
  return table.findIndex((r) => r.clubId === clubId) + 1;
}

/**
 * Shield winners from the regular-season fixtures: each shield is a mini
 * table over pool games only (both clubs in the pool). No playoff effect.
 */
export function computeShields(
  shields: readonly ShieldDef[],
  fixtures: Fixture[],
): Record<string, ClubId> {
  const out: Record<string, ClubId> = {};
  for (const s of shields) {
    const ids = new Set(s.clubIds);
    const poolGames = fixtures.filter((f) => ids.has(f.homeId) && ids.has(f.awayId));
    out[s.id] = computeTable([...s.clubIds], poolGames)[0].clubId;
  }
  return out;
}
