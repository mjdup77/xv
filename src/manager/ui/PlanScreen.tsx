// Tactics tab: three game plans with a live squad-fit badge computed from the
// currently selected XV, so the fit mechanic is legible before committing.

import { computeFacets } from "../../engine/ratings";
import type { GamePlanId } from "../types";
import { actions, useManagerStore } from "../store";
import { lineupFromSelection } from "../engine/selection";
import { GAME_PLANS, fitLabel, fitMod } from "../engine/tactics";
import { ScreenHead } from "./bits";

export function PlanScreen() {
  const { career } = useManagerStore();
  if (!career) return null;

  const sel = career.clubs[career.clubId].selection;
  const facets = computeFacets(lineupFromSelection(sel, career.players, career.season.year));

  return (
    <div className="mgr">
      <ScreenHead title="Tactics" sub="Your team's identity — fit matters" />

      <div className="mgr-plans">
        {(Object.keys(GAME_PLANS) as GamePlanId[]).map((id) => {
          const plan = GAME_PLANS[id];
          const mod = fitMod(id, facets);
          const fit = fitLabel(mod);
          return (
            <button
              key={id}
              className={`mgr-plan-card${career.gamePlan === id ? " active" : ""}`}
              onClick={() => actions.setGamePlan(id)}
            >
              <div className="mgr-plan-top">
                <b>{plan.label}</b>
                <span className={`mgr-fit-badge ${fit.tone}`}>
                  {id === "balanced"
                    ? "Always neutral"
                    : `${fit.label} (${mod >= 0 ? "+" : ""}${mod.toFixed(1)})`}
                </span>
              </div>
              <p className="mgr-plan-blurb">{plan.blurb}</p>
              <div className="mgr-plan-key">
                Leans on <b>{plan.keyUnits}</b>
                {id === "forward" && " · fewer tries, more penalty pressure"}
                {id === "expansive" && " · more tries at both ends"}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mgr-explain" style={{ marginBottom: 90 }}>
        A plan only works if the squad backs it up: the fit badge compares the
        units the plan leans on against your XV's overall level, based on the
        team currently named on your sheet. A poor fit costs up to −3; a strong
        one earns up to +2. Balanced never swings either way — it's the safe
        floor, not the ceiling. The per-match emphasis dial lives on the Season
        tab in a match week.
      </p>
    </div>
  );
}
