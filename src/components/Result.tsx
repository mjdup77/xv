import type { Lineup, TournamentResult } from "../types";
import { Pitch } from "./Pitch";
import { track } from "../analytics";

interface Props {
  result: TournamentResult;
  lineup: Lineup;
  seed: string;
  onPlayAgain: () => void;
}

function FacetBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(4, Math.min(100, value));
  return (
    <div className="facet">
      <span className="facet-label">{label}</span>
      <div className="facet-track">
        <div className="facet-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="facet-val">{Math.round(value)}</span>
    </div>
  );
}

export function Result({ result, lineup, seed, onPlayAgain }: Props) {
  const klass = result.perfect35
    ? "perfect"
    : result.champion
      ? "champion"
      : result.advancedFromPool
        ? "knockout"
        : "pool";

  const lessonsTitle = result.perfect35
    ? "Immortal"
    : result.champion
      ? "Chasing the Perfect 35"
      : "Where it slipped";

  const share = () => {
    const line = result.perfect35
      ? `I built the PERFECT 35 on XV 🏆 — bonus-point wins in all 7 games to win the World Cup.`
      : result.champion
        ? `I won the Rugby World Cup on XV 🏆 (Perfect score ${result.perfectScore}/35).`
        : `${result.verdict} on XV. My run scored ${result.perfectScore}/35. Can you go all the way?`;
    const text = `${line}\nPlay: https://xv.app  (seed ${seed})`;
    navigator.clipboard?.writeText(text);
    track("share_clicked", {
      method: "copy",
      champion: result.champion,
      perfect35: result.perfect35,
      perfect_score: result.perfectScore,
    });
  };

  return (
    <div className="result">
      <div className={`verdict ${klass}`}>
        {result.perfect35 && <div className="verdict-crown">PERFECT 35</div>}
        <h1>{result.verdict}</h1>
        <div className="verdict-sub">
          <span>{result.identity}</span>
          <span className="dot">•</span>
          <span>Perfect-run score {result.perfectScore}/35</span>
          <span className="dot">•</span>
          <span>Squad rating {Math.round(result.overall)}</span>
        </div>
      </div>

      <div className="stat-strip">
        <div className="stat">
          <b>{result.triesFor}</b>
          <span>Tries scored</span>
        </div>
        <div className="stat">
          <b>{result.triesAgainst}</b>
          <span>Tries conceded</span>
        </div>
        <div className="stat">
          <b>{result.triesFor - result.triesAgainst >= 0 ? "+" : ""}{result.triesFor - result.triesAgainst}</b>
          <span>Try difference</span>
        </div>
        <div className="stat">
          <b>{result.matches.filter((m) => m.bonusPoint).length}/7</b>
          <span>Bonus-point wins</span>
        </div>
      </div>

      <div className="result-grid">
        <div className="result-col">
          <h3>The Road to the Final</h3>
          <ol className="matches">
            {result.matches.map((m, i) => (
              <li key={i} className={m.won ? "won" : m.draw ? "drew" : "lost"}>
                <div className="m-top">
                  <span className="m-round">{m.round}</span>
                  <span className="m-opp">
                    {m.oppFlag} {m.opponent}
                  </span>
                  <span className="m-score">
                    {m.pf}–{m.pa}
                  </span>
                  <span className="m-flags">
                    {m.won ? "W" : m.draw ? "D" : "L"}
                    {m.bonusPoint && <span className="bp" title="Try bonus point">★</span>}
                  </span>
                </div>
                <div className="m-motm">
                  <span className="motm-tag">MOTM</span> {m.motm}
                </div>
              </li>
            ))}
          </ol>
          {!result.advancedFromPool && (
            <p className="muted">Win at least 2 pool games to reach the knockouts.</p>
          )}
        </div>

        <div className="result-col">
          <h3>Squad Profile</h3>
          <div className="facets">
            {Object.entries(result.facets).map(([k, v]) => (
              <FacetBar key={k} label={k} value={v} />
            ))}
          </div>

          <h3 className="mt">Your Stalwarts</h3>
          <ul className="stalwarts">
            {result.stalwarts.map((s) => (
              <li key={s.name}>
                <span className="st-name">{s.name}</span>
                <span className="st-awards">
                  {"★".repeat(s.awards)} <em>{s.awards} MOTM</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="headlines">
        <h3>Tournament Headlines</h3>
        <ul className="fun-facts">
          {result.funFacts.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="review-cols">
        <div className="review-card good">
          <h4>What went well</h4>
          <ul>
            {result.review.wentWell.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className={`review-card ${result.perfect35 ? "good" : "work"}`}>
          <h4>{lessonsTitle}</h4>
          <ul>
            {result.review.lessons.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="result-pitch">
        <Pitch lineup={lineup} />
      </div>

      <div className="result-actions">
        <button
          className="btn primary"
          onClick={() => {
            track("play_again_clicked", { from: "result" });
            onPlayAgain();
          }}
        >
          New Run
        </button>
        <button className="btn ghost" onClick={share}>
          Copy Challenge
        </button>
      </div>
    </div>
  );
}
