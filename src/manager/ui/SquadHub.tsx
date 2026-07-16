// Squad hub: the full playing roster with three lenses — List (ratings &
// condition), Contracts (wage/expiry pressure), Development (age, potential,
// minutes) — plus the injury list up top. Rows open the player detail screen.

import { useState } from "react";
import { ROLE_ABBR, ROLE_ORDER } from "../../data/slots";
import type { PlayerRec } from "../types";
import { useManagerStore } from "../store";
import { rosterOf } from "../world";
import { effOvrOf } from "../engine/selection";
import { potentialRange } from "../engine/growth";
import { fmtMoney, wageBill, wageCapFor } from "../engine/finance";
import { FatigueBar, FormArrow, MoraleDot, ScreenHead, StatusTag } from "./bits";
import { nav } from "./util";

type Lens = "list" | "contracts" | "development";

export function SquadHub() {
  const { career } = useManagerStore();
  const [lens, setLens] = useState<Lens>("list");
  if (!career) return null;

  const roster = rosterOf(career, career.clubId).sort(
    (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.ovr - a.ovr,
  );
  const injured = roster.filter((p) => p.injury && p.injury.weeks > 0);
  const bill = wageBill(career, career.clubId);

  return (
    <div className="mgr">
      <ScreenHead
        title="Squad"
        sub={`${roster.length} players · wages ${fmtMoney(bill)} / ceiling ${fmtMoney(wageCapFor(career.clubId))}`}
      />

      {injured.length > 0 && (
        <div className="mcard mgr-injury-list">
          <h3 className="mcard-kicker">Treatment room</h3>
          {injured.map((p) => (
            <button key={p.id} className="mgr-inj-row" onClick={() => nav(`player/${p.id}`)}>
              <b>{p.name}</b>
              <span>
                {p.injury!.label} · {p.injury!.weeks}w
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mseg" style={{ marginBottom: 10 }}>
        {(["list", "contracts", "development"] as Lens[]).map((l) => (
          <button
            key={l}
            className={`mseg-btn${lens === l ? " active" : ""}`}
            onClick={() => setLens(l)}
          >
            {l === "list" ? "Squad" : l === "contracts" ? "Contracts" : "Development"}
          </button>
        ))}
      </div>

      <div className="mgr-sheet">
        {roster.map((p) =>
          lens === "list" ? (
            <ListRow key={p.id} p={p} />
          ) : lens === "contracts" ? (
            <ContractRow key={p.id} p={p} year={career.season.year} />
          ) : (
            <DevRow key={p.id} p={p} />
          ),
        )}
      </div>
      <div style={{ height: 90 }} />
    </div>
  );
}

function ListRow({ p }: { p: PlayerRec }) {
  return (
    <button className="mgr-player-row" onClick={() => nav(`player/${p.id}`)}>
      <span className="pr-slot">{ROLE_ABBR[p.role]}</span>
      <span className="pr-nm">
        <b>{p.name}</b>
        <span>
          {p.age} · <StatusTag p={p} />
          {!p.injury && !p.listed && !p.loan ? `form ${p.form > 0 ? "+" : ""}${p.form.toFixed(0)}` : ""}
        </span>
      </span>
      <MoraleDot morale={p.morale} />
      <FormArrow form={p.form} />
      <FatigueBar fatigue={p.fatigue} />
      <span className="pr-ovr2">{effOvrOf(p)}</span>
    </button>
  );
}

function ContractRow({ p, year }: { p: PlayerRec; year: number }) {
  const yearsLeft = p.expiry - year;
  const tone = yearsLeft <= 0 ? "tone-bad" : yearsLeft === 1 ? "tone-ok" : "";
  return (
    <button className="mgr-player-row" onClick={() => nav(`player/${p.id}`)}>
      <span className="pr-slot">{ROLE_ABBR[p.role]}</span>
      <span className="pr-nm">
        <b>{p.name}</b>
        <span>
          {p.age} · {fmtMoney(p.wage)}/yr
        </span>
      </span>
      <span className={`pr-expiry ${tone}`}>
        {yearsLeft <= 0 ? "expiring" : `${yearsLeft}yr${yearsLeft === 1 ? "" : "s"}`}
      </span>
      <span className="pr-ovr2">{p.ovr}</span>
    </button>
  );
}

function DevRow({ p }: { p: PlayerRec }) {
  const [lo, hi] = potentialRange(p);
  const young = p.age <= 26 && hi > p.ovr;
  return (
    <button className="mgr-player-row" onClick={() => nav(`player/${p.id}`)}>
      <span className="pr-slot">{ROLE_ABBR[p.role]}</span>
      <span className="pr-nm">
        <b>{p.name}</b>
        <span>
          {p.age} · {p.minutes}′ this season
        </span>
      </span>
      <span className={`pr-pot${young ? " tone-good" : ""}`}>
        {young ? (lo === hi ? `→ ${hi}` : `${lo}–${hi}`) : "peak"}
      </span>
      <span className="pr-ovr2">{p.ovr}</span>
    </button>
  );
}
