import { useEffect, useState } from "react";
import type { H2HResult } from "../types";
import { track } from "../analytics";

interface Props {
  result: H2HResult;
  onDone: () => void;
}

const KIND_ICON: Record<string, string> = { try: "🏉", pen: "🎯", drop: "🦶" };

export function MatchPlayback({ result, onDone }: Props) {
  const tl = result.timeline;
  const total = tl.length;
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (n >= total) {
      const t = setTimeout(() => setDone(true), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((x) => x + 1), n === 0 ? 600 : 950);
    return () => clearTimeout(t);
  }, [n, total]);

  const skip = () => {
    track("match_sim_skipped", { at_moment: n });
    setN(total);
    setDone(true);
  };

  const shown = tl.slice(0, n);
  let hs = 0;
  let as = 0;
  for (const m of shown) {
    if (m.side === "home") hs += m.points;
    else as += m.points;
  }
  const clock = done ? 80 : shown.length ? shown[shown.length - 1].minute : 0;

  return (
    <div className="sim msim">
      <div className="msim-clock">{done ? "FULL TIME" : `${clock}'`}</div>

      <div className="msim-board">
        <div className={`msim-team ${done && result.homeWon ? "win" : ""}`}>
          <div className="msim-name">{result.home.label}</div>
          <div className="msim-score">{hs}</div>
        </div>
        <div className="msim-sep">–</div>
        <div className={`msim-team ${done && !result.homeWon ? "win" : ""}`}>
          <div className="msim-name">{result.away.label}</div>
          <div className="msim-score">{as}</div>
        </div>
      </div>

      <div className="msim-feed">
        {shown.length === 0 && !done && (
          <div className="msim-kickoff">Kick-off! 🏉</div>
        )}
        {shown.map((m, i) => (
          <div key={i} className={`msim-moment reveal side-${m.side}`}>
            <span className="msim-min">{m.minute}'</span>
            <span className="msim-icon" aria-hidden>
              {KIND_ICON[m.kind] ?? "•"}
            </span>
            <span className="msim-text">{m.text}</span>
            <span className="msim-pts">+{m.points}</span>
          </div>
        ))}
      </div>

      <div className="sim-actions">
        {done ? (
          <button
            className="btn primary big"
            onClick={() => {
              track("match_result_viewed", {});
              onDone();
            }}
          >
            See the Full Breakdown →
          </button>
        ) : (
          <button className="btn ghost" onClick={skip}>
            Skip to full time
          </button>
        )}
      </div>
    </div>
  );
}
