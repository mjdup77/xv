// Season review: outcome banner, trophies won (title, leaders, Shields), the
// development report ("who grew, who declined"), retirements, youth intake,
// and the next-season hook. Competition-themed — a URC review looks URC.

import { CLUB_BY_ID, COMPETITIONS, seasonLabel } from "../../data/manager";
import { ROLE_LABEL } from "../../data/slots";
import { actions, useManagerStore } from "../store";
import { userSeason } from "../engine/season";
import { userLeague } from "../world";
import { BottomCta, ScreenHead } from "./bits";
import { nav, ordinal } from "./util";

export function Review() {
  const { career } = useManagerStore();
  if (!career) return null;

  const s = career.season;
  const lg = userLeague(career);
  const comp = COMPETITIONS[lg];
  const ls = userSeason(career);
  const record = career.history.find((h) => h.year === s.year);
  const club = CLUB_BY_ID[career.clubId];
  const champion = ls.championId === career.clubId;
  const leader = ls.leaderId === career.clubId;
  const shieldsWon = (comp.shields ?? []).filter(
    (sh) => ls.shieldWinners?.[sh.id] === career.clubId,
  );
  const inKnockouts = (fs?: { homeId: string; awayId: string }[]) =>
    (fs ?? []).some((f) => f.homeId === career.clubId || f.awayId === career.clubId);
  const madeFinal =
    ls.final && (ls.final.homeId === career.clubId || ls.final.awayId === career.clubId);
  const madeSemis = inKnockouts(ls.semis);
  const madeQuarters = inKnockouts(ls.quarters);
  const prog = career.progression;

  const verdict = record?.sacked
    ? "SACKED"
    : champion
      ? comp.trophyName.toUpperCase()
      : madeFinal
        ? "Beaten finalists"
        : madeSemis
          ? "Out in the semi-finals"
          : madeQuarters
            ? "Out in the quarter-finals"
            : record && record.position <= comp.playoffTeams
              ? "Playoffs"
              : "Season over";

  return (
    <div className="mgr comp-scene">
      <ScreenHead title="Season review" sub={`${comp.name} ${seasonLabel(s.year)}`} back="" />

      <div className={`mgr-review-banner${champion ? " champion" : ""}${record?.sacked ? " sacked" : ""}`}>
        {champion && <div className="rv-kicker">🏆 CHAMPIONS 🏆</div>}
        <h2>{champion ? club.name : verdict}</h2>
        <p>
          {record
            ? `Finished ${ordinal(record.position)} · ${record.wins}W ${record.losses}L`
            : club.name}
          {leader ? ` · ${comp.leaderTrophy ?? "League Leaders"}` : ""}
          {shieldsWon.length ? ` · ${shieldsWon.map((sh) => sh.label).join(" · ")}` : ""}
        </p>
        {!champion && ls.championId && (
          <p>
            {CLUB_BY_ID[ls.championId].name} are champions
            {ls.final?.result
              ? ` — ${ls.final.result.homePts}–${ls.final.result.awayPts} in the final`
              : ""}
            .
          </p>
        )}
        {record?.sacked && <p>The board acted. The job hunt starts in your inbox.</p>}
      </div>

      {(champion || (leader && comp.leaderTrophy) || shieldsWon.length > 0) && (
        <div className="mcard">
          <h3 className="mcard-kicker">Added to your cabinet</h3>
          <div className="mgr-trophies">
            {champion && (
              <div className={`mgr-trophy t-${lg}`}>
                <span className="t-icon">🏆</span>
                <span>
                  <span className="t-name">{comp.trophyName}</span>
                  <br />
                  <span className="t-sub">
                    {club.name} · {seasonLabel(s.year)}
                  </span>
                </span>
              </div>
            )}
            {leader && comp.leaderTrophy && (
              <div className={`mgr-trophy t-${lg}`}>
                <span className="t-icon">🛡️</span>
                <span>
                  <span className="t-name">{comp.leaderTrophy}</span>
                  <br />
                  <span className="t-sub">
                    {club.name} · {seasonLabel(s.year)}
                  </span>
                </span>
              </div>
            )}
            {shieldsWon.map((sh) => (
              <div className={`mgr-trophy t-${lg}`} key={sh.id}>
                <span className="t-icon">🏅</span>
                <span>
                  <span className="t-name">{sh.label}</span>
                  <br />
                  <span className="t-sub">
                    {club.name} · {seasonLabel(s.year)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {prog && (
        <div className="mcard">
          <h3 className="mcard-kicker">Your season: who grew, who declined</h3>
          {prog.grew.length > 0 && (
            <div className="mgr-prog-block">
              {prog.grew.slice(0, 8).map((e) => (
                <p key={e.playerId} className="mgr-prog-row">
                  <b>{e.name}</b>
                  <span>
                    {e.age} · {e.minutes}′
                  </span>
                  <em className="tone-good">
                    {e.from} → {e.to}
                  </em>
                </p>
              ))}
            </div>
          )}
          {prog.declined.length > 0 && (
            <div className="mgr-prog-block">
              {prog.declined.slice(0, 6).map((e) => (
                <p key={e.playerId} className="mgr-prog-row">
                  <b>{e.name}</b>
                  <span>{e.age}</span>
                  <em className="tone-bad">
                    {e.from} → {e.to}
                  </em>
                </p>
              ))}
            </div>
          )}
          {prog.retired.length > 0 && (
            <p className="mcard-muted">
              Retired: {prog.retired.map((r) => `${r.name} (${r.age})`).join(", ")}.
            </p>
          )}
          {prog.grew.length === 0 && prog.declined.length === 0 && (
            <p className="mcard-muted">A quiet year on the training pitch.</p>
          )}
        </div>
      )}

      {prog && prog.youth.length > 0 && (
        <div className="mcard">
          <h3 className="mcard-kicker">Academy intake</h3>
          {prog.youth.map((y, i) => (
            <p key={i} className="mgr-prog-row">
              <b>{y.name}</b>
              <span>
                {y.age} · {ROLE_LABEL[y.role]}
              </span>
              <em>{y.ovr}</em>
            </p>
          ))}
        </div>
      )}

      <div className="mgr-menu">
        <button className="mgr-menu-row" onClick={() => nav("table")}>
          <span className="mm-icon">📊</span> Final table
          <span className="mm-chev">›</span>
        </button>
        <button className="mgr-menu-row" onClick={() => nav("inbox")}>
          <span className="mm-icon">✉️</span> Inbox
          <span className="mm-chev">›</span>
        </button>
        <button className="mgr-menu-row" onClick={() => nav("")}>
          <span className="mm-icon">🏠</span> Trophy cabinet & home
          <span className="mm-chev">›</span>
        </button>
      </div>

      {career.history.length > 1 && (
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

      <BottomCta
        label={
          career.unemployed
            ? "Continue — find a new job"
            : `Start the ${seasonLabel(s.year + 1)} season`
        }
        onClick={() => {
          actions.nextSeason();
          nav("home");
        }}
      />
    </div>
  );
}
