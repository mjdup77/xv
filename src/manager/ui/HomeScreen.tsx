// The XV home page. XV Manager's landing doubles as the site's front door
// (the CEO's call: manager landing = home, the other games live behind the
// corner XV menu). Kept deliberately spare: wordmark, one contextual card
// stack (career, trophy cabinet), one primary action, and a quiet footer.
// New players get the pitch; returning managers land straight on their club.

import { CLUB_BY_ID, COMPETITIONS, seasonLabel } from "../../data/manager";
import type { Cabinet, Career } from "../types";
import { actions } from "../store";
import { userLeague } from "../world";
import { EcosystemMenu } from "../../components/EcosystemMenu";
import { BottomCta, ClubStripe } from "./bits";
import { trophyMeta } from "./theme";
import { nav } from "./util";

export function HomeScreen({
  career,
  cabinet,
  staleSave,
}: {
  career: Career | null;
  cabinet: Cabinet;
  staleSave: boolean;
}) {
  const hasCareer = !!career;

  const resume = () => {
    if (!career) return null;
    const lg = userLeague(career);
    const ls = career.season.leagues[lg];
    const compName = COMPETITIONS[lg].name;
    const status =
      career.season.phase === "preseason"
        ? "Pre-season"
        : career.season.phase === "offseason"
          ? "Season complete"
          : ls.phase === "regular"
            ? `Week ${career.season.week} of ${COMPETITIONS[lg].rounds}`
            : "Playoffs";
    return `${compName} ${seasonLabel(career.season.year)} · ${status}`;
  };

  return (
    <div className="mgr mgr-home">
      <EcosystemMenu current="manager" />

      <h1 className="mgr-logo">
        XV<em>MANAGER</em>
      </h1>
      {!hasCareer && (
        <p className="mgr-tagline">
          Take charge of a real Premiership or URC club. Run the squad, work the
          market, survive the board — one week at a time.
        </p>
      )}

      <div className="mgr-home-body">
        {staleSave && (
          <div className="mcard mgr-stale">
            <h3 className="mcard-kicker">Save from an earlier build</h3>
            <p className="mcard-muted">
              XV Manager now runs a two-league world (Premiership + URC) and your
              old career save can't come along. Your trophy cabinet is safe —
              start a fresh career to continue.
            </p>
            <button className="mbtn" onClick={() => actions.dismissStaleSave()}>
              Understood — clear the old save
            </button>
          </div>
        )}

        {career && (
          <div className="mcard mgr-resume">
            {!career.unemployed && <ClubStripe clubId={career.clubId} />}
            <div className="mgr-resume-body">
              <b>{career.unemployed ? "Unemployed" : CLUB_BY_ID[career.clubId].name}</b>
              <p>{resume()}</p>
            </div>
          </div>
        )}

        <div className="mcard">
          <h3 className="mcard-kicker">Trophy cabinet</h3>
          {cabinet.trophies.length === 0 ? (
            <p className="mcard-muted">
              Empty… for now. Win the Premiership or the URC and it lives here forever.
            </p>
          ) : (
            <div className="mgr-trophies">
              {cabinet.trophies.map((t, i) => {
                const meta = trophyMeta(t.trophyId);
                return (
                  <div className={`mgr-trophy t-${meta.league}`} key={i}>
                    <span className="t-icon">{meta.icon}</span>
                    <span>
                      <span className="t-name">{meta.name}</span>
                      <br />
                      <span className="t-sub">
                        {CLUB_BY_ID[t.clubId].name} · {seasonLabel(t.year)}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {cabinet.matchesPlayed > 0 && (
            <p className="mcard-muted" style={{ marginTop: 10 }}>
              {cabinet.seasonsCompleted} season{cabinet.seasonsCompleted === 1 ? "" : "s"} ·{" "}
              {cabinet.matchesWon}W–{cabinet.matchesPlayed - cabinet.matchesWon}L career record
            </p>
          )}
        </div>
      </div>

      <BottomCta
        label={hasCareer ? "Continue career" : "Start a career"}
        onClick={() =>
          nav(hasCareer ? (career?.season.phase === "offseason" ? "review" : "home") : "pick")
        }
      />

      {hasCareer && (
        <div className="mgr-home-alt">
          <button
            onClick={() => {
              if (confirm("Abandon this career? Your trophy cabinet is kept.")) {
                actions.abandonCareer();
              }
            }}
          >
            Start over with a new club
          </button>
        </div>
      )}

      <p className="mgr-disclaimer">
        XV Manager is a free, unofficial fan-made game. It is not affiliated
        with, endorsed by, or connected to Premiership Rugby, the United Rugby
        Championship, any club, or any player. Club and player names are used
        in a spirit of celebration of the sport.
      </p>
    </div>
  );
}
