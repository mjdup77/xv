// The Season tab: season DETAIL — your fixtures & results round by round,
// the full standings (with URC shield races), and the season's story so far.
// The "what do I do next" job moved to the Home tab (HubScreen); this screen
// is where you come to study the campaign.

import { CLUB_BY_ID, COMPETITIONS, seasonLabel } from "../../data/manager";
import type { Fixture } from "../types";
import { useManagerStore } from "../store";
import { userSeason, userTable } from "../engine/season";
import { roundLabel } from "../engine/schedule";
import { tablePosition } from "../engine/table";
import { userLeague } from "../world";
import { ClubStripe, ScreenHead } from "./bits";
import { Standings } from "./TableScreen";
import { ordinal } from "./util";

export function SeasonScreen() {
  const { career } = useManagerStore();
  if (!career) return null;

  const s = career.season;
  const lg = userLeague(career);
  const comp = COMPETITIONS[lg];
  const ls = userSeason(career);
  const table = userTable(career);

  const weekName =
    s.phase === "preseason"
      ? "Pre-season"
      : s.phase === "offseason"
        ? "Off-season"
        : ls.phase === "regular"
          ? `Week ${s.week} of ${comp.rounds}`
          : ls.phase === "done"
            ? "Season played"
            : "Playoffs";

  // The user's campaign, round by round (regular season + any knockouts).
  const all: Fixture[] = [
    ...ls.fixtures,
    ...(ls.quarters ?? []),
    ...(ls.semis ?? []),
    ...(ls.final ? [ls.final] : []),
  ];
  const mine = career.unemployed
    ? []
    : all
        .filter((f) => f.homeId === career.clubId || f.awayId === career.clubId)
        .sort((a, b) => a.round - b.round);
  const nextIdx = mine.findIndex((f) => !f.result);

  return (
    <div className="mgr comp-scene">
      <ScreenHead
        title="Season"
        sub={`${comp.name} ${seasonLabel(s.year)} · ${weekName}`}
      />

      {!career.unemployed && (
        <div className="mgr-club-banner">
          <ClubStripe clubId={career.clubId} />
          <span>
            <b>{CLUB_BY_ID[career.clubId].shortName}</b>
            <span>
              {table.find((r) => r.clubId === career.clubId)?.won ?? 0}W ·{" "}
              {table.find((r) => r.clubId === career.clubId)?.lost ?? 0}L ·{" "}
              {table.find((r) => r.clubId === career.clubId)?.points ?? 0} pts
            </span>
          </span>
          <span className="cb-pos">
            <b>{ordinal(tablePosition(table, career.clubId))}</b>
            <br />
            <span>in the {comp.shortName}</span>
          </span>
        </div>
      )}

      {mine.length > 0 && (
        <>
          <h4 className="mgr-sheet-section">Fixtures & results</h4>
          <div className="mgr-fixlist">
            {mine.map((f, i) => (
              <FixtureRow
                key={f.id}
                fixture={f}
                clubId={career.clubId}
                next={i === nextIdx}
              />
            ))}
          </div>
        </>
      )}

      <h4 className="mgr-sheet-section">Standings</h4>
      <Standings career={career} />
      <div style={{ height: 90 }} />
    </div>
  );
}

function FixtureRow({
  fixture,
  clubId,
  next,
}: {
  fixture: Fixture;
  clubId: string;
  next: boolean;
}) {
  const isHome = fixture.homeId === clubId;
  const oppId = isHome ? fixture.awayId : fixture.homeId;
  const r = fixture.result;
  const us = r ? (isHome ? r.homePts : r.awayPts) : 0;
  const them = r ? (isHome ? r.awayPts : r.homePts) : 0;
  const tone = !r ? "" : us > them ? "tone-good" : us === them ? "" : "tone-bad";
  const comp = COMPETITIONS[fixture.league];
  const knockout = fixture.round > comp.rounds;

  return (
    <div className={`mgr-fix-row${next ? " next" : ""}`}>
      <span className="fx-rd">{knockout ? roundLabel(fixture) : `R${fixture.round}`}</span>
      <span className="fx-opp">
        {isHome ? "vs" : "at"} {CLUB_BY_ID[oppId].shortName}
      </span>
      {r ? (
        <span className={`fx-score ${tone}`}>
          {us > them ? "W" : us === them ? "D" : "L"} {us}–{them}
        </span>
      ) : (
        <span className="fx-score muted">{next ? "next" : "—"}</span>
      )}
    </div>
  );
}
