// XV Manager shell: hash routing (#/manager/...), layered theming (base
// brand → competition accent → club colours), and the bottom tab bar.

import { useEffect, useMemo, useState } from "react";
import "./manager.css";
import { initAnalytics } from "../../analytics";
import { CLUB_BY_ID, COMPETITIONS, clubsOf, seasonLabel } from "../../data/manager";
import type { ClubId, LeagueId } from "../types";
import { actions, useManagerStore } from "../store";
import { userLeague } from "../world";
import { BottomCta, ClubStripe, ScreenHead, TabBar } from "./bits";
import { accentFor, BRAND_ACCENT, BRAND_ACCENT_SOFT, compVars } from "./theme";
import { nav } from "./util";
import { HomeScreen } from "./HomeScreen";
import { HubScreen } from "./HubScreen";
import { SeasonScreen } from "./SeasonScreen";
import { InboxScreen } from "./InboxScreen";
import { SquadHub } from "./SquadHub";
import { PlayerDetail } from "./PlayerDetail";
import { TeamSheet } from "./TeamSheet";
import { PlanScreen } from "./PlanScreen";
import { MarketScreen } from "./MarketScreen";
import { ClubScreen } from "./ClubScreen";
import { Report } from "./Report";
import { TableScreen } from "./TableScreen";
import { Review } from "./Review";

function parseRoute(): string {
  return location.hash.replace(/^#\/manager\/?/, "").split("?")[0];
}

function useRoute(): string {
  const [route, setRoute] = useState(parseRoute());
  useEffect(() => {
    const on = () => setRoute(parseRoute());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

const TABBED = new Set(["home", "hub", "inbox", "squad", "plan", "season", "club", "team", "market", "table"]);

export default function ManagerApp() {
  const { career, cabinet, staleSave } = useManagerStore();
  const route = useRoute();

  useEffect(() => initAnalytics(), []);

  // Route guards: no career → home/pick only.
  useEffect(() => {
    const needsCareer = !["", "pick"].includes(route);
    if (needsCareer && !career) nav("");
  }, [route, career]);

  const comp: LeagueId | null = career ? userLeague(career) : null;

  const theme = useMemo(() => {
    const id = career?.clubId ?? null;
    return id ? accentFor(id) : { accent: BRAND_ACCENT, accentSoft: BRAND_ACCENT_SOFT };
  }, [career?.clubId]);

  const style = {
    "--m-accent": theme.accent,
    "--m-accent-soft": theme.accentSoft,
    ...(comp ? compVars(comp) : {}),
  } as React.CSSProperties;

  const screen = () => {
    if (!career || route === "" || route === "pick") {
      if (route === "pick") return <ClubPick />;
      return <HomeScreen cabinet={cabinet} career={career} staleSave={staleSave} />;
    }
    if (route.startsWith("player/")) return <PlayerDetail playerId={route.slice(7)} />;
    switch (route) {
      case "home":
      case "hub":
        return <HubScreen />;
      case "inbox":
        return <InboxScreen />;
      case "squad":
        return <SquadHub />;
      case "plan":
        return <PlanScreen />;
      case "season":
        return <SeasonScreen />;
      case "club":
        return <ClubScreen />;
      case "team":
        return <TeamSheet />;
      case "market":
        return <MarketScreen />;
      case "report":
        return <Report />;
      case "table":
        return <TableScreen />;
      case "review":
        return <Review />;
      default:
        return <HubScreen />;
    }
  };

  const showTabs = !!career && (TABBED.has(route) || route.startsWith("player/"));

  return (
    <div
      className={`mgr-shell${showTabs ? " has-tabs" : ""}`}
      data-comp={comp ?? undefined}
      style={style}
    >
      {screen()}
      {showTabs && <TabBar route={route} career={career} />}
    </div>
  );
}

// ---------------------------------------------------------------- Club pick

function squadRating(clubId: ClubId): number {
  const players = CLUB_BY_ID[clubId].players;
  const top = [...players].sort((a, b) => b.ovr - a.ovr).slice(0, 23);
  return Math.round(top.reduce((s, p) => s + p.ovr, 0) / top.length);
}

const LEAGUE_BLURBS: Record<LeagueId, string> = {
  prem: "10 clubs · 18 rounds · top-4 playoffs · Twickenham final",
  urc: "16 clubs, four nations · 18 rounds · top-8 playoffs · four Shields",
};

function ClubPick() {
  const [league, setLeague] = useState<LeagueId | null>(null);
  const [selected, setSelected] = useState<ClubId | null>(null);

  const ratings = useMemo(() => {
    const m = new Map<ClubId, number>();
    if (league) for (const c of clubsOf(league)) m.set(c.id, squadRating(c.id));
    return m;
  }, [league]);

  // Step 1: choose your competition.
  if (!league) {
    return (
      <div className="mgr">
        <ScreenHead title="Choose your league" sub={`Season ${seasonLabel(2025)}`} back="" />
        <div className="mgr-leagues">
          {(Object.keys(COMPETITIONS) as LeagueId[]).map((lg) => {
            const comp = COMPETITIONS[lg];
            return (
              <button
                key={lg}
                className="mgr-league-card"
                style={compVars(lg) as React.CSSProperties}
                onClick={() => setLeague(lg)}
              >
                <span className="mgr-league-name">{comp.name}</span>
                <span className="mgr-league-sub">{LEAGUE_BLURBS[lg]}</span>
                <span className="mgr-league-count">{comp.clubIds.length} clubs →</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 2: choose a club within it.
  const comp = COMPETITIONS[league];
  return (
    <div className="mgr" style={compVars(league) as React.CSSProperties}>
      <ScreenHead
        title="Choose your club"
        sub={`${comp.name} · ${seasonLabel(comp.startYear)}`}
        back=""
      />
      <button className="mgr-league-back" onClick={() => { setLeague(null); setSelected(null); }}>
        ← All leagues
      </button>
      <div className="mgr-clubs">
        {clubsOf(league).map((c) => (
          <button
            key={c.id}
            className={`mgr-club-row${selected === c.id ? " selected" : ""}`}
            onClick={() => setSelected(c.id)}
          >
            <ClubStripe clubId={c.id} />
            <span>
              <span className="mgr-club-name">{c.name}</span>
              <br />
              <span className="mgr-club-sub">{c.stadium}</span>
            </span>
            <span className="mgr-club-ovr">{ratings.get(c.id)}</span>
          </button>
        ))}
      </div>
      <BottomCta
        label={selected ? `Take the ${CLUB_BY_ID[selected].shortName} job` : "Pick a club"}
        disabled={!selected}
        onClick={() => {
          if (!selected) return;
          actions.startCareer(selected);
          nav("home");
        }}
      />
    </div>
  );
}
