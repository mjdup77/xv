// Matchday 23 editor: starters by slot, bench, live cohesion meter, and a
// bottom-sheet swap picker. Injured players are flagged and unpickable.

import { useState } from "react";
import type { SlotId } from "../../types";
import { SLOTS, ROLE_LABEL } from "../../data/slots";
import type { PlayerRec } from "../types";
import { actions, useManagerStore } from "../store";
import { rosterOf } from "../world";
import { effOvrOf, isAvailable, selectionCohesion, slotCandidates } from "../engine/selection";
import { cohesionMod, familiarity } from "../engine/tactics";
import { BottomCta, FatigueBar, FormArrow, ScreenHead, StatusTag } from "./bits";
import { nav } from "./util";

type PickTarget = { kind: "slot"; slot: SlotId } | { kind: "bench"; index: number };

export function TeamSheet() {
  const { career } = useManagerStore();
  const [target, setTarget] = useState<PickTarget | null>(null);
  if (!career) return null;

  const roster = rosterOf(career, career.clubId);
  const byId = career.players;
  const sel = career.clubs[career.clubId].selection;

  const cohesion = selectionCohesion(sel, byId);
  const cMod = cohesionMod(cohesion);
  const starterIds = new Set(Object.values(sel.starters));
  const benchIds = new Set(sel.bench);

  const playerRow = (p: PlayerRec | undefined, label: string, onClick: () => void, key: string) => {
    if (!p) {
      return (
        <button key={key} className="mgr-player-row empty" onClick={onClick}>
          <span className="pr-slot">{label}</span>
          <span className="pr-nm">
            <b>— select —</b>
          </span>
          <span />
          <span />
          <span />
        </button>
      );
    }
    const fam = familiarity(p.window);
    const hurt = !isAvailable(p);
    return (
      <button key={key} className={`mgr-player-row${hurt ? " hurt" : ""}`} onClick={onClick}>
        <span className="pr-slot">{label}</span>
        <span className="pr-nm">
          <b>{p.name}</b>
          <span>
            {ROLE_LABEL[p.role]} · {p.age} ·{" "}
            {hurt ? <StatusTag p={p} /> : fam >= 0.75 ? "settled" : fam >= 0.4 ? "bedding in" : "new to XV"}
          </span>
        </span>
        <FormArrow form={p.form} />
        <FatigueBar fatigue={p.fatigue} />
        <span className="pr-ovr2">{effOvrOf(p)}</span>
      </button>
    );
  };

  // Candidates for the open picker.
  let pickTitle = "";
  let candidates: PlayerRec[] = [];
  if (target?.kind === "slot") {
    const slot = SLOTS.find((s) => s.id === target.slot)!;
    pickTitle = `${slot.number}. ${slot.label}`;
    candidates = slotCandidates(target.slot, roster).filter(
      (p) => sel.starters[target.slot] !== p.id && isAvailable(p),
    );
  } else if (target?.kind === "bench") {
    pickTitle = `Bench ${target.index + 16}`;
    candidates = roster
      .filter((p) => !starterIds.has(p.id) && sel.bench[target.index] !== p.id && isAvailable(p))
      .sort((a, b) => effOvrOf(b) - effOvrOf(a));
  }

  const pick = (p: PlayerRec) => {
    if (!target) return;
    if (target.kind === "slot") actions.setStarter(target.slot, p.id);
    else actions.setBench(target.index, p.id);
    setTarget(null);
  };

  const startersCount = Object.values(sel.starters).filter(Boolean).length;

  return (
    <div className="mgr">
      <ScreenHead
        title="Team sheet"
        sub={`${startersCount}/15 starters · ${sel.bench.length}/8 bench`}
        back="home"
      />

      <div className="mcard">
        <div className="mgr-meter-top">
          <b>Cohesion</b>
          <span className={cMod >= 0.5 ? "tone-good" : cMod <= -0.5 ? "tone-bad" : "tone-ok"}>
            {Math.round(cohesion * 100)}% ({cMod >= 0 ? "+" : ""}
            {cMod.toFixed(1)})
          </span>
        </div>
        <div className="mgr-meter-track">
          <div
            className="mgr-meter-fill"
            style={{
              width: `${Math.round(cohesion * 100)}%`,
              background:
                cMod >= 0.5 ? "var(--m-green)" : cMod <= -0.5 ? "var(--m-red)" : "var(--m-amber)",
            }}
          />
        </div>
        <div className="mgr-meter-note">
          A settled XV earns up to +2.5; wholesale changes cost up to −2.5. Fatigue and
          injuries pull the other way — that's the job.
        </div>
      </div>

      <button className="mbtn" style={{ marginBottom: 4 }} onClick={() => actions.suggestXV()}>
        ✨ Suggest a 23 (rests tired legs, covers injuries)
      </button>

      <div className="mgr-sheet-section">Starting XV</div>
      <div className="mgr-sheet">
        {SLOTS.map((s) => {
          const pid = sel.starters[s.id];
          const p = pid ? byId[pid] : undefined;
          return playerRow(p, String(s.number), () => setTarget({ kind: "slot", slot: s.id }), s.id);
        })}
      </div>

      <div className="mgr-sheet-section">Bench</div>
      <div className="mgr-sheet">
        {Array.from({ length: 8 }, (_, i) => {
          const pid = sel.bench[i];
          const p = pid ? byId[pid] : undefined;
          return playerRow(p, String(16 + i), () => setTarget({ kind: "bench", index: i }), `b${i}`);
        })}
      </div>

      <div className="mgr-sheet-section">Not in the 23</div>
      <div className="mgr-sheet">
        {roster
          .filter((p) => !starterIds.has(p.id) && !benchIds.has(p.id))
          .sort((a, b) => b.ovr - a.ovr)
          .map((p) => (
            <button
              key={p.id}
              className="mgr-player-row"
              style={{ opacity: 0.65 }}
              onClick={() => nav(`player/${p.id}`)}
            >
              <span className="pr-slot">–</span>
              <span className="pr-nm">
                <b>{p.name}</b>
                <span>
                  {ROLE_LABEL[p.role]} · {p.age} · <StatusTag p={p} />
                </span>
              </span>
              <FormArrow form={p.form} />
              <FatigueBar fatigue={p.fatigue} />
              <span className="pr-ovr2">{effOvrOf(p)}</span>
            </button>
          ))}
      </div>

      <BottomCta label="Confirm team" onClick={() => nav("home")} />

      {target && (
        <div className="mgr-sheet-modal" onClick={() => setTarget(null)}>
          <div className="mgr-sheet-modal-inner" onClick={(e) => e.stopPropagation()}>
            <h3>{pickTitle}</h3>
            <div className="mgr-sheet-modal-list">
              {candidates.map((p) => {
                const isStarter = starterIds.has(p.id);
                const isBench = benchIds.has(p.id);
                return (
                  <button key={p.id} className="mgr-player-row" onClick={() => pick(p)}>
                    <span className="pr-slot">{isStarter ? "XV" : isBench ? "B" : ""}</span>
                    <span className="pr-nm">
                      <b>{p.name}</b>
                      <span>
                        {ROLE_LABEL[p.role]} · {p.age} · fatigue {Math.round(p.fatigue)}
                      </span>
                    </span>
                    <FormArrow form={p.form} />
                    <FatigueBar fatigue={p.fatigue} />
                    <span className="pr-ovr2">{effOvrOf(p)}</span>
                  </button>
                );
              })}
            </div>
            <button className="mbtn ghost" onClick={() => setTarget(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
