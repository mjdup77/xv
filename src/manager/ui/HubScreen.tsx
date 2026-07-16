// The HOME tab — the default in-game screen (CEO playtest, July 2026: "big
// things should happen in a home screen of sorts"). The FIFA-manager-mode
// hub: next fixture with the primary action in the thumb zone, league
// position + last result at a glance, pending decisions as actionable cards,
// unread mail, treatment room, and the transfer window when it's open.
// Season detail (table, fixtures, history) lives on the Season tab.

import { CLUB_BY_ID, COMPETITIONS, seasonLabel } from "../../data/manager";
import type { Career, EmphasisId, Fixture, InboxItem, TableRow } from "../types";
import { actions, unreadCount, useManagerStore } from "../store";
import { nextUserFixture, pendingFixtures, userSeason, userTable } from "../engine/season";
import { roundLabel } from "../engine/schedule";
import { tablePosition } from "../engine/table";
import { rosterOf, userLeague } from "../world";
import { EMPHASES } from "../engine/tactics";
import { windowOpen, windowLabel } from "../engine/transfers";
import { BottomCta, ClubStripe, ScreenHead } from "./bits";
import { nav, ordinal } from "./util";

const DECISION_ICON: Record<string, string> = {
  offer: "💷",
  contract: "✍️",
  unhappy: "⚠️",
  job: "💼",
};

export function HubScreen() {
  const { career } = useManagerStore();
  if (!career) return null;

  const s = career.season;
  const lg = userLeague(career);
  const comp = COMPETITIONS[lg];
  const ls = userSeason(career);

  if (s.phase === "offseason") {
    return (
      <div className="mgr comp-scene">
        <ScreenHead title="Season complete" sub={`${comp.name} ${seasonLabel(s.year)}`} />
        <div className="mgr-fixture-card">
          <div className="mgr-fixture-kicker">{comp.shortName} · {seasonLabel(s.year)}</div>
          <div className="mgr-fixture-opp">The dust has settled</div>
          <div className="mgr-fixture-sub">Take stock, then roll into next season.</div>
        </div>
        <BottomCta label="Season review" onClick={() => nav("review")} />
      </div>
    );
  }

  if (career.unemployed) return <UnemployedHub />;

  const club = CLUB_BY_ID[career.clubId];
  const table = userTable(career);
  const pos = tablePosition(table, career.clubId);
  const row = table.find((r) => r.clubId === career.clubId);

  const fixture = nextUserFixture(career);
  const pending = pendingFixtures(career);
  const pendingHere = pending.filter((f) => f.league === lg);
  const matchWeek = pending.length > 0;

  const isHome = fixture?.homeId === career.clubId;
  const oppId = fixture ? (isHome ? fixture.awayId : fixture.homeId) : null;
  const opp = oppId ? CLUB_BY_ID[oppId] : null;
  const oppPos = oppId ? tablePosition(table, oppId) : 0;

  const roster = rosterOf(career, career.clubId);
  const injured = roster.filter((p) => p.injury && p.injury.weeks > 0);
  const decisions = career.inbox.filter((it) => it.decision && !it.resolved);
  const unread = unreadCount(career);
  const last = lastUserResult(career);

  const finalRound = comp.rounds + (comp.playoffTeams === 8 ? 3 : 2);
  const weekName =
    s.phase === "preseason"
      ? "Pre-season"
      : ls.phase === "regular"
        ? `Week ${s.week} of ${comp.rounds}`
        : ls.phase === "done"
          ? "Season played"
          : `${ls.phase === "quarters" ? "Quarter-final" : ls.phase === "semis" ? "Semi-final" : "Final"} week`;

  const ctaLabel = matchWeek
    ? fixture
      ? fixture.round === finalRound
        ? "Matchday: THE FINAL"
        : `Matchday: ${roundLabel(fixture)}`
      : "Sim the round"
    : s.phase === "preseason"
      ? "Start the season"
      : "Continue";

  const onCta = () => {
    if (matchWeek) {
      const involved = !!fixture;
      actions.playMatchday();
      nav(involved ? "report" : "home");
    } else {
      actions.continueWeek();
    }
  };

  return (
    <div className="mgr comp-scene">
      <ScreenHead title={club.name} sub={`${comp.name} ${seasonLabel(s.year)} · ${weekName}`} />

      {/* At a glance: position + last result. */}
      <div className="mgr-club-banner">
        <ClubStripe clubId={career.clubId} />
        <span>
          <b>{ordinal(pos)}</b>
          <span>
            {row?.won ?? 0}W · {row?.lost ?? 0}L · {row?.points ?? 0} pts
          </span>
        </span>
        <span className="cb-pos">
          {last ? (
            <>
              <b className={last.won ? "tone-good" : last.draw ? "" : "tone-bad"}>
                {last.won ? "W" : last.draw ? "D" : "L"} {last.score}
              </b>
              <br />
              <span>last: {last.label}</span>
            </>
          ) : (
            <>
              <b>—</b>
              <br />
              <span>no games yet</span>
            </>
          )}
        </span>
      </div>

      {/* The next fixture — the hub's occasion card. */}
      {matchWeek && fixture && opp ? (
        <div className="mgr-fixture-card">
          <div className="mgr-fixture-kicker">
            {comp.shortName} · {roundLabel(fixture)}
          </div>
          <div className="mgr-fixture-opp">
            {isHome ? "vs" : "at"} {opp.name}
          </div>
          <div className="mgr-fixture-sub">
            {fixture.round === finalRound && comp.finalHosting === "neutral"
              ? comp.finalVenueName
              : isHome
                ? `${club.stadium} · they sit ${ordinal(oppPos)}`
                : `${opp.stadium} · they sit ${ordinal(oppPos)}`}
          </div>
        </div>
      ) : matchWeek ? (
        <div className="mgr-fixture-card">
          <div className="mgr-fixture-kicker">
            {pendingHere.length ? `${comp.shortName} · ${roundLabel(pendingHere[0])}s` : "Around the leagues"}
          </div>
          <div className="mgr-fixture-opp">Season over for {club.shortName}</div>
          <div className="mgr-fixture-sub">
            {(pendingHere.length ? pendingHere : pending)
              .map((f) => `${CLUB_BY_ID[f.homeId].shortName} v ${CLUB_BY_ID[f.awayId].shortName}`)
              .join(" · ")}
          </div>
        </div>
      ) : (
        <div className="mgr-fixture-card quiet">
          <div className="mgr-fixture-kicker">
            {s.phase === "preseason" ? "Pre-season" : "Between rounds"}
          </div>
          <div className="mgr-fixture-opp">
            {s.phase === "preseason" ? "The new season awaits" : "The week rolls on"}
          </div>
          <div className="mgr-fixture-sub">
            {nextFixtureBlurb(career, table)}
          </div>
        </div>
      )}

      {/* Matchday emphasis lives beside the matchday button. */}
      {matchWeek && fixture && (
        <div className="mgr-emphasis">
          <span className="mgr-label">This match: emphasis</span>
          <div className="mseg">
            {(Object.keys(EMPHASES) as EmphasisId[]).map((e) => (
              <button
                key={e}
                className={`mseg-btn${career.emphasis === e ? " active" : ""}`}
                onClick={() => actions.setEmphasis(e)}
              >
                {EMPHASES[e].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Decisions waiting: act from here, one tap deep. */}
      {decisions.length > 0 && (
        <>
          <h4 className="mgr-sheet-section">Needs your decision</h4>
          <div className="mgr-menu">
            {decisions.slice(0, 4).map((it) => (
              <DecisionCard key={it.id} item={it} />
            ))}
            {decisions.length > 4 && (
              <button className="mgr-menu-row" onClick={() => nav("inbox")}>
                <span className="mm-icon">✉</span> {decisions.length - 4} more waiting
                <span className="mm-chev">›</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* The desk: everything else worth a glance. */}
      <div className="mgr-menu">
        {unread > 0 && (
          <button className="mgr-menu-row" onClick={() => nav("inbox")}>
            <span className="mm-icon">✉</span> Inbox
            <span className="mm-note">{unread} unread</span>
            <span className="mm-chev">›</span>
          </button>
        )}
        {injured.length > 0 && (
          <button className="mgr-menu-row" onClick={() => nav("squad")}>
            <span className="mm-icon">✚</span> Treatment room
            <span className="mm-note">
              {injured.length} out — {injured
                .slice(0, 2)
                .map((p) => p.name.split(" ").slice(-1)[0])
                .join(", ")}
              {injured.length > 2 ? "…" : ""}
            </span>
            <span className="mm-chev">›</span>
          </button>
        )}
        {windowOpen(s.week) && (
          <button className="mgr-menu-row" onClick={() => nav("market")}>
            <span className="mm-icon">💷</span> Transfer market
            <span className="mm-note">{windowLabel(s.week)} open</span>
            <span className="mm-chev">›</span>
          </button>
        )}
        <button className="mgr-menu-row" onClick={() => nav("team")}>
          <span className="mm-icon">🏉</span> Team sheet
          <span className="mm-chev">›</span>
        </button>
        <button className="mgr-menu-row" onClick={() => nav("club")}>
          <span className="mm-icon">★</span> Club & board
          <span className="mm-note">confidence {Math.round(career.board.confidence)}</span>
          <span className="mm-chev">›</span>
        </button>
      </div>

      <BottomCta label={ctaLabel} onClick={onCta} />
    </div>
  );
}

/** One pending decision, as a card that jumps straight to the opened mail. */
function DecisionCard({ item }: { item: InboxItem }) {
  return (
    <button className="mgr-menu-row decision" onClick={() => nav(`inbox?open=${item.id}`)}>
      <span className="mm-icon">{DECISION_ICON[item.kind] ?? "✉"}</span>
      <span className="mm-decision-subject">{item.subject}</span>
      <span className="mm-chev">›</span>
    </button>
  );
}

/** The user's most recent played fixture, for the at-a-glance strip. */
function lastUserResult(career: Career) {
  const ls = userSeason(career);
  const all: Fixture[] = [
    ...ls.fixtures,
    ...(ls.quarters ?? []),
    ...(ls.semis ?? []),
    ...(ls.final ? [ls.final] : []),
  ];
  const mine = all
    .filter((f) => f.result && (f.homeId === career.clubId || f.awayId === career.clubId))
    .sort((a, b) => b.round - a.round);
  const f = mine[0];
  if (!f) return null;
  const isHome = f.homeId === career.clubId;
  const us = isHome ? f.result!.homePts : f.result!.awayPts;
  const them = isHome ? f.result!.awayPts : f.result!.homePts;
  const oppId = isHome ? f.awayId : f.homeId;
  return {
    won: us > them,
    draw: us === them,
    score: `${us}–${them}`,
    label: `${isHome ? "vs" : "at"} ${CLUB_BY_ID[oppId].shortName}`,
  };
}

function nextFixtureBlurb(career: Career, table: TableRow[]): string {
  const next = upcomingUserFixture(career);
  if (!next) return "Training ground's quiet. Continue when ready.";
  const isHome = next.homeId === career.clubId;
  const oppId = isHome ? next.awayId : next.homeId;
  const oppPos = tablePosition(table, oppId);
  return `Next up: ${isHome ? "vs" : "at"} ${CLUB_BY_ID[oppId].shortName}, who sit ${ordinal(oppPos)}.`;
}

/** The user's next unplayed fixture, even when it isn't due this week. */
function upcomingUserFixture(career: Career): Fixture | undefined {
  const ls = userSeason(career);
  const all: Fixture[] = [
    ...ls.fixtures,
    ...(ls.quarters ?? []),
    ...(ls.semis ?? []),
    ...(ls.final ? [ls.final] : []),
  ];
  return all
    .filter((f) => !f.result && (f.homeId === career.clubId || f.awayId === career.clubId))
    .sort((a, b) => a.round - b.round)[0];
}

function UnemployedHub() {
  const { career } = useManagerStore();
  if (!career) return null;
  const s = career.season;
  const comp = COMPETITIONS[userLeague(career)];
  const offers = career.inbox.filter((it) => it.kind === "job" && !it.resolved);

  return (
    <div className="mgr comp-scene">
      <ScreenHead
        title="Unemployed"
        sub={`${comp.name} ${seasonLabel(s.year)} · Week ${s.week}`}
      />
      <div className="mgr-fixture-card sacked">
        <div className="mgr-fixture-kicker">Out of work</div>
        <div className="mgr-fixture-opp">The phone will ring</div>
        <div className="mgr-fixture-sub">
          {offers.length > 0
            ? `${offers.length} club${offers.length === 1 ? " is" : "s are"} interested`
            : "No offers this week. Both leagues move on without you."}
        </div>
      </div>
      {offers.length > 0 && (
        <div className="mgr-menu">
          {offers.map((it) => (
            <DecisionCard key={it.id} item={it} />
          ))}
        </div>
      )}
      <div className="mgr-menu">
        <button className="mgr-menu-row" onClick={() => nav("season")}>
          <span className="mm-icon">📊</span> League table
          <span className="mm-chev">›</span>
        </button>
      </div>
      <BottomCta
        label={s.phase === "preseason" ? "Start the season" : "Continue"}
        onClick={() => actions.continueWeek()}
      />
    </div>
  );
}
