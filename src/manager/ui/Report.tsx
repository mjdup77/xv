// Post-match report for the user's fixture: scoreboard, timeline, tactics
// transparency, injuries sustained, league points banked, and the rest of the
// round's results.

import { useEffect } from "react";
import { CLUB_BY_ID, COMPETITIONS } from "../../data/manager";
import type { Fixture, ReportTeam } from "../types";
import { useManagerStore } from "../store";
import { userSeason, userTable } from "../engine/season";
import { tablePosition } from "../engine/table";
import { EMPHASES, GAME_PLANS } from "../engine/tactics";
import { userLeague } from "../world";
import { BottomCta, ScreenHead } from "./bits";
import { nav, ordinal } from "./util";

function TacticsRows({ team, you }: { team: ReportTeam; you: boolean }) {
  return (
    <>
      <div className="mgr-tactics-row">
        <span>{you ? "Your" : `${team.label}'s`} plan</span>
        <span>
          {GAME_PLANS[team.tactics.plan].label}
          {team.tactics.emphasis !== "balanced" ? ` · ${EMPHASES[team.tactics.emphasis].label}` : ""}
        </span>
      </div>
      <div className="mgr-tactics-row">
        <span>Squad fit</span>
        <span className={team.tactics.fitMod >= 0.5 ? "tone-good" : team.tactics.fitMod <= -0.75 ? "tone-bad" : ""}>
          {team.tactics.fitMod >= 0 ? "+" : ""}
          {team.tactics.fitMod.toFixed(1)}
        </span>
      </div>
      <div className="mgr-tactics-row">
        <span>Cohesion ({Math.round(team.tactics.cohesion * 100)}%)</span>
        <span className={team.tactics.cohesionMod >= 0.5 ? "tone-good" : team.tactics.cohesionMod <= -0.5 ? "tone-bad" : ""}>
          {team.tactics.cohesionMod >= 0 ? "+" : ""}
          {team.tactics.cohesionMod.toFixed(1)}
        </span>
      </div>
    </>
  );
}

export function Report() {
  const { career } = useManagerStore();
  const rep = career?.lastReport;
  useEffect(() => {
    if (career && !rep) nav("home");
  }, [career, rep]);
  if (!career || !rep) return null;

  const s = career.season;
  const complete = s.phase === "offseason";
  const comp = COMPETITIONS[userLeague(career)];
  const ls = userSeason(career);

  // The rest of the round (user's league only), for "around the grounds".
  const all: Fixture[] = [
    ...ls.fixtures,
    ...(ls.quarters ?? []),
    ...(ls.semis ?? []),
    ...(ls.final ? [ls.final] : []),
  ];
  const thisFx = all.find((f) => f.id === rep.fixtureId);
  const others = thisFx
    ? all.filter((f) => f.round === thisFx.round && f.id !== thisFx.id && f.result)
    : [];

  const userIsHome = rep.home.clubId === career.clubId;
  const us = userIsHome ? rep.home : rep.away;
  const them = userIsHome ? rep.away : rep.home;
  const won = !rep.draw && (userIsHome ? rep.homeWon : !rep.homeWon);

  const table = userTable(career);
  const pos = tablePosition(table, career.clubId);
  const isLeague = thisFx ? thisFx.round <= comp.rounds : true;

  return (
    <div className="mgr comp-scene">
      <ScreenHead title={rep.roundLabel} sub={rep.headline} back="home" />

      <div className="mr-scoreboard">
        <div className={`mr-team left${rep.homeWon && !rep.draw ? " win" : ""}`}>
          <span className="mr-team-name">{rep.home.label}</span>
          <span className="mr-team-pts">{rep.home.points}</span>
          <span className="mr-team-ovr">
            {rep.home.tries}T {rep.home.cons}C {rep.home.pens}P
            {rep.home.drops ? ` ${rep.home.drops}DG` : ""}
          </span>
        </div>
        <div className="mr-vs">
          <span className="mr-dash">–</span>
          <span className="mr-ft">{rep.draw ? "DRAW" : "FT"}</span>
        </div>
        <div className={`mr-team right${!rep.homeWon && !rep.draw ? " win" : ""}`}>
          <span className="mr-team-name">{rep.away.label}</span>
          <span className="mr-team-pts">{rep.away.points}</span>
          <span className="mr-team-ovr">
            {rep.away.tries}T {rep.away.cons}C {rep.away.pens}P
            {rep.away.drops ? ` ${rep.away.drops}DG` : ""}
          </span>
        </div>
      </div>

      {isLeague && rep.userLeaguePoints !== undefined && (
        <p className="mgr-report-league">
          <b>+{rep.userLeaguePoints} league points</b>
          {rep.bonuses?.map((b) => ` · ${b}`)}
          {" · "}you sit <b>{ordinal(pos)}</b>
        </p>
      )}

      <div className="mr-motm" style={{ textAlign: "center", marginBottom: 16 }}>
        <span className="motm-tag">MOTM</span>
        {rep.motm.name} ({rep.motm.team})
      </div>

      {rep.injuries && rep.injuries.length > 0 && (
        <div className="mcard mgr-report-inj">
          <h3 className="mcard-kicker">Casualties</h3>
          {rep.injuries.map((i, idx) => (
            <p key={idx}>
              <b>{i.name}</b> — {i.label}, out {i.weeks} week{i.weeks === 1 ? "" : "s"}
            </p>
          ))}
        </div>
      )}

      <div className="mcard">
        <h3 className="mcard-kicker">How the tactics played out</h3>
        <TacticsRows team={us} you={true} />
        <TacticsRows team={them} you={false} />
      </div>

      <div className="mr-timeline">
        <h4 className="mgr-sheet-section" style={{ margin: "0 0 8px" }}>
          Timeline
        </h4>
        <ol>
          {rep.timeline.map((m, i) => (
            <li key={i} className={`tl-${m.side} tl-${m.kind}`}>
              <span className="tl-min">{m.minute}'</span>
              <span className="tl-text">{m.text}</span>
            </li>
          ))}
          {rep.timeline.length === 0 && (
            <li>
              <span className="tl-text muted">A scoreless arm-wrestle. They happen.</span>
            </li>
          )}
        </ol>
      </div>

      {others.length > 0 && (
        <div className="mgr-round-results">
          <h4>Around the grounds</h4>
          <div className="mgr-mini-results">
            {others.map((f) => (
              <div className="mgr-mini-result" key={f.id}>
                <span>{CLUB_BY_ID[f.homeId].shortName}</span>
                <b>
                  {f.result!.homePts}–{f.result!.awayPts}
                </b>
                <span>{CLUB_BY_ID[f.awayId].shortName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomCta
        label={complete ? "Season review" : won ? "On to the next one" : "Continue"}
        onClick={() => nav(complete ? "review" : "home")}
      />
    </div>
  );
}
