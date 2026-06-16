import { useEffect, useState } from "react";
import type { TournamentResult } from "../types";
import { track } from "../analytics";

interface Props {
  result: TournamentResult;
  onDone: () => void;
}

export function SimPlayback({ result, onDone }: Props) {
  const total = result.matches.length;
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (n >= total) {
      const t = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((x) => x + 1), n === 0 ? 450 : 820);
    return () => clearTimeout(t);
  }, [n, total]);

  const skip = () => {
    track("sim_skipped", { at_match: n });
    setN(total);
    setDone(true);
  };

  const shown = result.matches.slice(0, n);
  let w = 0;
  let d = 0;
  let l = 0;
  for (const m of shown) {
    if (m.won) w++;
    else if (m.draw) d++;
    else l++;
  }

  return (
    <div className="sim">
      <div className="sim-head">
        <div className="sim-ball" aria-hidden>
          🏉
        </div>
        <h2>{done ? "Full Time" : "Simulating the World Cup…"}</h2>
        <div className="sim-tally">
          {w}W · {d}D · {l}L
        </div>
      </div>

      <div className="sim-list">
        {shown.map((m, i) => (
          <div key={i} className={`sim-row reveal ${m.won ? "won" : m.draw ? "drew" : "lost"}`}>
            <div className="sim-row-top">
              <span className="sim-round">{m.round}</span>
              <span className="sim-opp">
                {m.oppFlag} {m.opponent}
              </span>
              <span className="sim-score">
                {m.pf}–{m.pa}
              </span>
              <span className="sim-res">
                {m.won ? "W" : m.draw ? "D" : "L"}
                {m.bonusPoint && <span className="bp" title="Try bonus point"> ★</span>}
              </span>
            </div>
            <div className="sim-motm">
              <span className="motm-tag">MOTM</span> {m.motm}
            </div>
          </div>
        ))}
      </div>

      <div className="sim-actions">
        {done ? (
          <button
            className="btn primary big"
            onClick={() => {
              track("result_viewed", {});
              onDone();
            }}
          >
            See the Full Breakdown →
          </button>
        ) : (
          <button className="btn ghost" onClick={skip}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
