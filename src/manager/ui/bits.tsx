// Small shared UI pieces for manager mode (components only — helpers live in
// util.ts so fast refresh stays happy).

import type { ReactNode } from "react";
import { CLUB_BY_ID } from "../../data/manager";
import type { Career, ClubId, PlayerRec } from "../types";
import { fatiguePenalty } from "../engine/tactics";
import { openDecisions, unreadCount } from "../store";
import { nav } from "./util";

export function ScreenHead({
  title,
  sub,
  back,
  right,
}: {
  title: string;
  sub?: string;
  back?: string; // route to go back to; undefined hides the button
  right?: ReactNode;
}) {
  return (
    <div className="mgr-head">
      {back !== undefined && (
        <button className="mgr-back" onClick={() => nav(back)} aria-label="Back">
          ‹
        </button>
      )}
      <div className="mgr-head-title">
        <h1>{title}</h1>
        {sub && <span>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

export function BottomCta({
  label,
  onClick,
  disabled,
  tone,
}: {
  label: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "accent" | "plain";
}) {
  return (
    <div className="mgr-cta">
      <button
        className={`mbtn ${tone === "plain" ? "" : "primary"}`}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
    </div>
  );
}

export function ClubStripe({ clubId }: { clubId: ClubId }) {
  const c = CLUB_BY_ID[clubId];
  return (
    <span
      className="mgr-club-stripe"
      style={{ background: `linear-gradient(180deg, ${c.colors[0]}, ${c.colors[1]})` }}
    />
  );
}

export function FormArrow({ form }: { form: number }) {
  if (form >= 1) return <span className="pr-form tone-good">▲</span>;
  if (form <= -1) return <span className="pr-form tone-bad">▼</span>;
  return <span className="pr-form muted">–</span>;
}

export function FatigueBar({ fatigue }: { fatigue: number }) {
  const pct = Math.round(fatigue);
  const color = pct >= 60 ? "var(--m-red)" : pct >= 35 ? "var(--m-amber)" : "var(--m-green)";
  return (
    <span
      className="pr-fat"
      title={`Fatigue ${pct}${fatiguePenalty(fatigue) > 0 ? " (rating reduced)" : ""}`}
    >
      <i style={{ width: `${pct}%`, background: color }} />
    </span>
  );
}

export function MoraleDot({ morale }: { morale: number }) {
  const tone = morale >= 68 ? "good" : morale >= 45 ? "ok" : "bad";
  return <span className={`pr-morale tone-${tone}`} title={`Morale ${Math.round(morale)}`} />;
}

/** Injury tag / availability marker for a player row. */
export function StatusTag({ p }: { p: PlayerRec }) {
  if (p.injury && p.injury.weeks > 0)
    return (
      <span className="pr-status inj" title={p.injury.label}>
        ✚ {p.injury.weeks}w
      </span>
    );
  if (p.loan) return <span className="pr-status loan">LOAN</span>;
  if (p.listed) return <span className="pr-status listed">LISTED</span>;
  return null;
}

// In-game IA (CEO playtest, July 2026): Home is the default screen — the hub
// where the next fixture, the primary action, and pending decisions live.
// Club moved off the bar (reachable from Home); Season keeps the detail.
const TABS: { id: string; route: string; label: string; icon: string }[] = [
  { id: "home", route: "home", label: "Home", icon: "⌂" },
  { id: "inbox", route: "inbox", label: "Inbox", icon: "✉" },
  { id: "squad", route: "squad", label: "Squad", icon: "👥" },
  { id: "plan", route: "plan", label: "Tactics", icon: "▦" },
  { id: "season", route: "season", label: "Season", icon: "🏉" },
];

export function TabBar({ route, career }: { route: string; career: Career | null }) {
  const unread = unreadCount(career);
  const decisions = openDecisions(career);
  const active = (t: (typeof TABS)[number]) =>
    route === t.route ||
    (t.route === "squad" && route.startsWith("player")) ||
    (t.route === "home" && route === "hub") ||
    (t.route === "home" && route === "club");
  return (
    <nav className="mgr-tabs">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`mgr-tab${active(t) ? " active" : ""}`}
          onClick={() => nav(t.route)}
        >
          <span className="mgr-tab-icon">
            {t.icon}
            {t.id === "inbox" && unread > 0 && (
              <span className="mgr-tab-badge">{unread > 9 ? "9+" : unread}</span>
            )}
            {t.id === "home" && decisions > 0 && (
              <span className="mgr-tab-badge decisions">{decisions > 9 ? "9+" : decisions}</span>
            )}
          </span>
          <span className="mgr-tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
