// League table for the user's competition (both leagues use rugby bonus
// points), user row highlighted, playoff line after the last qualifying spot.
// URC careers also get the four regional Shield races. The Standings block is
// shared with the Season tab.

import { CLUB_BY_ID, COMPETITIONS } from "../../data/manager";
import type { Career } from "../types";
import { useManagerStore } from "../store";
import { userSeason, userTable } from "../engine/season";
import { computeShields } from "../engine/table";
import { userLeague } from "../world";
import { ScreenHead } from "./bits";

export function TableScreen() {
  const { career } = useManagerStore();
  if (!career) return null;
  const comp = COMPETITIONS[userLeague(career)];

  return (
    <div className="mgr comp-scene">
      <ScreenHead
        title={`${comp.shortName} table`}
        sub={`Top ${comp.playoffTeams} reach the playoffs`}
      />
      <Standings career={career} />
      <div style={{ height: 90 }} />
    </div>
  );
}

/** Full standings + (URC) shield races. Used by the Table route and the
 *  Season tab. */
export function Standings({ career }: { career: Career }) {
  const lg = userLeague(career);
  const comp = COMPETITIONS[lg];
  const ls = userSeason(career);
  const table = userTable(career);
  const playoffIdx = comp.playoffTeams - 1;
  const anyPlayed = ls.fixtures.some((f) => f.result);
  const shieldLead = comp.shields && anyPlayed ? computeShields(comp.shields, ls.fixtures) : null;

  return (
    <>
      <table className="mgr-table">
        <thead>
          <tr>
            <th className="cl" colSpan={2}>
              Club
            </th>
            <th>P</th>
            <th>W</th>
            <th>L</th>
            <th>+/−</th>
            <th>BP</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {table.map((r, i) => (
            <tr
              key={r.clubId}
              className={`${!career.unemployed && r.clubId === career.clubId ? "me " : ""}${i === playoffIdx ? "playoff-line" : ""}`}
            >
              <td className="pos">{i + 1}</td>
              <td className="cl">{CLUB_BY_ID[r.clubId].shortName}</td>
              <td>{r.played}</td>
              <td>{r.won}</td>
              <td>{r.lost}</td>
              <td>{r.pf - r.pa}</td>
              <td>{r.tryBonus + r.loseBonus}</td>
              <td className="pts">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {comp.shields && shieldLead && (
        <div className="mcard">
          <h3 className="mcard-kicker">
            {ls.phase === "regular" ? "Shield races (pool games only)" : "Shield winners"}
          </h3>
          {comp.shields.map((s) => (
            <p className="mgr-shield-row" key={s.id}>
              <b>{s.label}</b>
              <span>
                {CLUB_BY_ID[ls.shieldWinners?.[s.id] ?? shieldLead[s.id]].shortName}
                {ls.phase === "regular" ? " leads" : " 🏅"}
              </span>
            </p>
          ))}
        </div>
      )}
    </>
  );
}
