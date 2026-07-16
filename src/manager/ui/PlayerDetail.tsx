// Player detail: attribute sheet (facet system), condition, contract, and —
// depending on whose player he is — squad actions (renew, list, loan out,
// release) or market actions (bid, loan in).

import { useState } from "react";
import { getAttrs } from "../../engine/ratings";
import type { Attr } from "../../types";
import { ROLE_LABEL } from "../../data/slots";
import { CLUB_BY_ID } from "../../data/manager";
import { actions, useManagerStore } from "../store";
import { playingClub, toEngine } from "../world";
import { effOvrOf } from "../engine/selection";
import { potentialRange } from "../engine/growth";
import { askingPrice, fmtMoney, renewalDemand, valuation } from "../engine/finance";
import { isFringe, loanDestinations, windowOpen } from "../engine/transfers";
import { FatigueBar, ScreenHead, StatusTag } from "./bits";

const ATTR_LABEL: Record<Attr, string> = {
  setPiece: "Set piece",
  breakdown: "Breakdown",
  carry: "Carrying",
  defence: "Defence",
  handling: "Handling",
  kick: "Kicking",
  goalKick: "Goal kicking",
  pace: "Pace",
  gameManage: "Game mgmt",
  discipline: "Discipline",
};

export function PlayerDetail({ playerId }: { playerId: string }) {
  const { career } = useManagerStore();
  const [bidMsg, setBidMsg] = useState<string | null>(null);
  const [bid, setBid] = useState<number | null>(null);
  if (!career) return null;
  const p = career.players[playerId];
  if (!p)
    return (
      <div className="mgr">
        <ScreenHead title="Player not found" back="squad" />
      </div>
    );

  const mine = p.clubId === career.clubId;
  const playsFor = playingClub(p);
  const attrs = getAttrs(toEngine(p, career.season.year));
  const [lo, hi] = potentialRange(p);
  const showPotential = p.age <= 26;
  const yearsLeft = p.expiry - career.season.year;
  const demand = renewalDemand(p);
  const open = windowOpen(career.season.week);
  const value = valuation(p);

  const ask = !mine && p.clubId ? askingPrice(p, isFringe(career, p)) : 0;
  const startBid = () => {
    setBid(Math.round(ask * 0.85));
    setBidMsg(null);
  };
  const placeBid = () => {
    if (bid == null) return;
    const outcome = actions.bidForPlayer(p.id, bid);
    if (!outcome) return;
    if (outcome.ok) {
      setBidMsg(`Done. ${p.name} signs for ${fmtMoney(outcome.fee)} on ${fmtMoney(outcome.wage)}/yr.`);
      setBid(null);
    } else if (outcome.kind === "counter") {
      setBidMsg(outcome.note);
      setBid(outcome.counter);
    } else {
      setBidMsg(outcome.note);
      setBid(null);
    }
  };

  const cash = career.clubs[career.clubId].cash;
  const canLoanOut = mine && p.age <= 23 && isFringe(career, p) && !p.loan && open;
  const canLoanIn = !mine && !!p.clubId && p.age <= 26 && isFringe(career, p) && !p.loan && open;

  return (
    <div className="mgr">
      <ScreenHead
        title={p.name}
        sub={`${ROLE_LABEL[p.role]}${p.alt?.length ? ` / ${p.alt.map((r) => ROLE_LABEL[r]).join(", ")}` : ""} · ${p.age} · ${p.nation}`}
        back={mine ? "squad" : "market"}
      />

      <div className="mgr-pd-top mcard">
        <div className="mgr-pd-ovr">
          <b>{effOvrOf(p)}</b>
          <span>current</span>
        </div>
        {showPotential && (
          <div className="mgr-pd-ovr pot">
            <b>{lo === hi ? hi : `${lo}–${hi}`}</b>
            <span>potential</span>
          </div>
        )}
        <div className="mgr-pd-facts">
          <span>
            {playsFor ? CLUB_BY_ID[playsFor].name : "Free agent"}
            {p.loan && p.clubId ? ` (on loan from ${CLUB_BY_ID[p.clubId].shortName})` : ""}
          </span>
          <span>
            {p.clubId
              ? `${fmtMoney(p.wage)}/yr · ${yearsLeft <= 0 ? "expiring" : `${yearsLeft} yr${yearsLeft === 1 ? "" : "s"} left`}`
              : "No contract"}
          </span>
          <span>Value ~{fmtMoney(value)}</span>
          <StatusTag p={p} />
        </div>
      </div>

      <div className="mcard">
        <h3 className="mcard-kicker">This season</h3>
        <div className="mgr-pd-stats">
          <span>
            <b>{p.starts}</b> starts
          </span>
          <span>
            <b>{p.benchApps}</b> bench
          </span>
          <span>
            <b>{p.minutes}′</b> minutes
          </span>
          <span>
            <b>{p.tries}</b> tries
          </span>
        </div>
        <div className="mgr-pd-cond">
          <span className="mgr-pd-cond-item">
            Fatigue <FatigueBar fatigue={p.fatigue} />
          </span>
          <span className="mgr-pd-cond-item">
            Morale <Meter value={p.morale} />
          </span>
          <span className="mgr-pd-cond-item">
            Form{" "}
            <b className={p.form >= 1 ? "tone-good" : p.form <= -1 ? "tone-bad" : ""}>
              {p.form > 0 ? "+" : ""}
              {p.form.toFixed(1)}
            </b>
          </span>
        </div>
      </div>

      <div className="mcard">
        <h3 className="mcard-kicker">Attributes</h3>
        <div className="mgr-attrs">
          {(Object.keys(ATTR_LABEL) as Attr[]).map((a) => (
            <div key={a} className="mgr-attr">
              <span>{ATTR_LABEL[a]}</span>
              <i>
                <b style={{ width: `${attrs[a]}%` }} className={attrs[a] >= 84 ? "hot" : ""} />
              </i>
              <em>{attrs[a]}</em>
            </div>
          ))}
        </div>
      </div>

      {bidMsg && <div className="mcard mgr-bid-msg">{bidMsg}</div>}

      {mine ? (
        <div className="mgr-mail-actions" style={{ marginBottom: 90 }}>
          {yearsLeft <= 1 && (
            <button className="mbtn tiny primary" onClick={() => actions.renewPlayerContract(p.id)}>
              Renew: {fmtMoney(demand.wage)}/yr × {demand.years}
            </button>
          )}
          <button className="mbtn tiny" onClick={() => actions.toggleTransferList(p.id)}>
            {p.listed ? "Remove from transfer list" : "Transfer-list"}
          </button>
          {canLoanOut && (
            <button
              className="mbtn tiny"
              onClick={() => {
                const dest = loanDestinations(career)[0];
                if (dest) actions.loanOutPlayer(p.id, dest);
              }}
            >
              Loan out (development)
            </button>
          )}
          <button
            className="mbtn tiny danger"
            onClick={() => {
              if (confirm(`Release ${p.name}? He walks for free.`)) actions.releasePlayerNow(p.id);
            }}
          >
            Release
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 90 }}>
          {!p.clubId ? (
            <button className="mbtn primary wide" onClick={() => actions.signFreeAgent(p.id)}>
              Sign free agent ({fmtMoney(demand.wage)}/yr)
            </button>
          ) : open ? (
            bid == null ? (
              <div className="mgr-mail-actions">
                <button className="mbtn tiny primary" onClick={startBid} disabled={cash < ask * 0.8}>
                  Make a bid (ask ~{fmtMoney(ask)})
                </button>
                {canLoanIn && (
                  <button className="mbtn tiny" onClick={() => actions.loanInPlayer(p.id)}>
                    Loan in (half wages)
                  </button>
                )}
              </div>
            ) : (
              <div className="mcard mgr-bid-box">
                <div className="mgr-bid-row">
                  <button className="mbtn tiny" onClick={() => setBid(Math.max(10, Math.round(bid * 0.9)))}>
                    −10%
                  </button>
                  <b>{fmtMoney(bid)}</b>
                  <button
                    className="mbtn tiny"
                    onClick={() => setBid(Math.min(cash, Math.round(bid * 1.1)))}
                  >
                    +10%
                  </button>
                </div>
                <p className="mcard-muted">Kitty: {fmtMoney(cash)}</p>
                <div className="mgr-mail-actions">
                  <button className="mbtn tiny primary" onClick={placeBid} disabled={bid > cash}>
                    Submit bid
                  </button>
                  <button className="mbtn tiny" onClick={() => setBid(null)}>
                    Walk away
                  </button>
                </div>
              </div>
            )
          ) : (
            <p className="mcard-muted" style={{ textAlign: "center" }}>
              The transfer window is closed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Meter({ value }: { value: number }) {
  const tone = value >= 68 ? "var(--m-green)" : value >= 45 ? "var(--m-amber)" : "var(--m-red)";
  return (
    <span className="pr-fat">
      <i style={{ width: `${Math.round(value)}%`, background: tone }} />
    </span>
  );
}

