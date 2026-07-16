// Club tab: board confidence & objective, finances, trophy cabinet, career
// history, and the exits (home / abandon).

import { CLUB_BY_ID, COMPETITIONS, seasonLabel } from "../../data/manager";
import { actions, useManagerStore } from "../store";
import { fmtMoney, wageBill, wageCapFor } from "../engine/finance";
import { userLeague } from "../world";
import { ClubStripe, ScreenHead } from "./bits";
import { trophyMeta } from "./theme";
import { nav, ordinal } from "./util";

export function ClubScreen() {
  const { career, cabinet } = useManagerStore();
  if (!career) return null;

  const club = CLUB_BY_ID[career.clubId];
  const comp = COMPETITIONS[userLeague(career)];
  const b = career.board;
  const bill = wageBill(career, career.clubId);
  const cash = career.clubs[career.clubId].cash;
  const confTone = b.confidence >= 60 ? "good" : b.confidence >= 30 ? "ok" : "bad";

  return (
    <div className="mgr">
      <ScreenHead
        title={career.unemployed ? "Between jobs" : club.name}
        sub={`${comp.name} ${seasonLabel(career.season.year)}`}
      />

      {!career.unemployed && (
        <>
          <div className="mgr-club-banner">
            <ClubStripe clubId={career.clubId} />
            <span>
              <b>{club.name}</b>
              <span>{club.stadium}</span>
            </span>
          </div>

          <div className="mcard">
            <h3 className="mcard-kicker">The board</h3>
            <div className="mgr-meter-top">
              <b>Confidence</b>
              <span className={`tone-${confTone}`}>{Math.round(b.confidence)}/100</span>
            </div>
            <div className="mgr-meter-track">
              <div
                className="mgr-meter-fill"
                style={{
                  width: `${Math.round(b.confidence)}%`,
                  background:
                    confTone === "good"
                      ? "var(--m-green)"
                      : confTone === "ok"
                        ? "var(--m-amber)"
                        : "var(--m-red)",
                }}
              />
            </div>
            <p className="mcard-muted" style={{ marginTop: 8 }}>
              Objective: <b>{b.objectiveLabel}</b>. Fall far enough below it for long
              enough and you're gone — boards here don't do patience.
            </p>
          </div>

          <div className="mcard">
            <h3 className="mcard-kicker">Finances</h3>
            <div className="mgr-fin-row">
              <span>Transfer kitty</span>
              <b>{fmtMoney(cash)}</b>
            </div>
            <div className="mgr-fin-row">
              <span>Wage bill</span>
              <b>
                {fmtMoney(bill)} <em className="mcard-muted">/ {fmtMoney(wageCapFor(career.clubId))} ceiling</em>
              </b>
            </div>
            <div className="mgr-mail-actions" style={{ marginTop: 8 }}>
              <button className="mbtn tiny" onClick={() => nav("market")}>
                Transfer market
              </button>
            </div>
          </div>
        </>
      )}

      <div className="mcard">
        <h3 className="mcard-kicker">Trophy cabinet</h3>
        {cabinet.trophies.length === 0 ? (
          <p className="mcard-muted">Empty. For now.</p>
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
      </div>

      {career.history.length > 0 && (
        <div className="mcard">
          <h3 className="mcard-kicker">Career history</h3>
          {[...career.history].reverse().map((h) => (
            <p className="mcard-muted" key={h.year}>
              {seasonLabel(h.year)} · {COMPETITIONS[h.league].shortName} ·{" "}
              {CLUB_BY_ID[h.clubId].shortName} · {ordinal(h.position)}
              {h.champion ? " · 🏆 Champions" : h.leader ? " · 🛡️ Leaders" : ""}
              {h.shields?.length ? ` · 🏅×${h.shields.length}` : ""}
              {h.sacked ? " · sacked" : ""}
            </p>
          ))}
        </div>
      )}

      <div className="mgr-home-alt" style={{ marginBottom: 90 }}>
        <button onClick={() => nav("")}>Career home & trophy cabinet</button>
        <button
          onClick={() => {
            if (confirm("Abandon this career? Your trophy cabinet is kept.")) {
              actions.abandonCareer();
              nav("");
            }
          }}
        >
          Abandon career
        </button>
      </div>
    </div>
  );
}
