// Transfer market: search the league's players by position group, see values
// and availability, tap through to bid. Free agents included.

import { useMemo, useState } from "react";
import { ROLE_ABBR, ROLE_ORDER } from "../../data/slots";
import type { Role } from "../../types";
import { CLUB_BY_ID } from "../../data/manager";
import type { PlayerRec } from "../types";
import { useManagerStore } from "../store";
import { playingClub } from "../world";
import { fmtMoney, valuation, wageBill, wageCapFor } from "../engine/finance";
import { isFringe, windowLabel, windowOpen } from "../engine/transfers";
import { potentialRange } from "../engine/growth";
import { ScreenHead } from "./bits";
import { nav } from "./util";

type Group = "all" | "front" | "second" | "back" | "half" | "mid" | "back3" | "free" | "u23";

const GROUPS: { id: Group; label: string; roles?: Role[] }[] = [
  { id: "all", label: "All" },
  { id: "front", label: "Front row", roles: ["prop", "hooker"] },
  { id: "second", label: "Locks", roles: ["lock"] },
  { id: "back", label: "Back row", roles: ["flanker", "number8"] },
  { id: "half", label: "Half-backs", roles: ["scrumhalf", "flyhalf"] },
  { id: "mid", label: "Centres", roles: ["centre"] },
  { id: "back3", label: "Back three", roles: ["wing", "fullback"] },
  { id: "u23", label: "U23 gems" },
  { id: "free", label: "Free agents" },
];

export function MarketScreen() {
  const { career } = useManagerStore();
  const [group, setGroup] = useState<Group>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!career) return [] as PlayerRec[];
    const g = GROUPS.find((x) => x.id === group)!;
    let list = Object.values(career.players).filter((p) => playingClub(p) !== career.clubId);
    if (group === "free") list = list.filter((p) => !p.clubId);
    else list = list.filter((p) => p.clubId);
    if (g.roles) list = list.filter((p) => g.roles!.includes(p.role) || (p.alt ?? []).some((r) => g.roles!.includes(r)));
    if (group === "u23") list = list.filter((p) => p.age <= 23 && p.pot - p.ovr >= 5);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    return list
      .sort((a, b) => b.ovr - a.ovr || ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
      .slice(0, 60);
  }, [career, group, query]);

  if (!career) return null;
  const open = windowOpen(career.season.week);
  const cash = career.clubs[career.clubId].cash;
  const capLeft = wageCapFor(career.clubId) - wageBill(career, career.clubId);

  return (
    <div className="mgr">
      <ScreenHead
        title="Transfer market"
        sub={
          open
            ? `${windowLabel(career.season.week)} · kitty ${fmtMoney(cash)} · cap room ${fmtMoney(Math.max(0, capLeft))}/yr`
            : "Window closed — browse and plan"
        }
      />

      <input
        className="mgr-search"
        placeholder="Search players…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="mgr-chips">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            className={`mgr-chip${group === g.id ? " active" : ""}`}
            onClick={() => setGroup(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="mgr-sheet">
        {rows.map((p) => {
          const [lo, hi] = potentialRange(p);
          const gem = p.age <= 23 && hi - p.ovr >= 5;
          return (
            <button key={p.id} className="mgr-player-row" onClick={() => nav(`player/${p.id}`)}>
              <span className="pr-slot">{ROLE_ABBR[p.role]}</span>
              <span className="pr-nm">
                <b>{p.name}</b>
                <span>
                  {p.age} · {p.clubId ? CLUB_BY_ID[p.clubId].shortName : "Free agent"}
                  {p.listed ? " · LISTED" : career && p.clubId && isFringe(career, p) ? " · fringe" : ""}
                </span>
              </span>
              {gem ? <span className="pr-pot tone-good">{lo}–{hi}</span> : <span className="pr-pot" />}
              <span className="pr-fee">{p.clubId ? fmtMoney(valuation(p)) : "free"}</span>
              <span className="pr-ovr2">{p.ovr}</span>
            </button>
          );
        })}
        {rows.length === 0 && (
          <p className="mcard-muted" style={{ padding: 12 }}>
            Nobody matches that search.
          </p>
        )}
      </div>
      <div style={{ height: 90 }} />
    </div>
  );
}
