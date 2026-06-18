import { useState } from "react";
import type { Lineup, TournamentResult } from "../types";
import { Pitch } from "./Pitch";
import { track } from "../analytics";
import { challengeLink, type Challenge } from "../challenge";

interface Props {
  result: TournamentResult;
  lineup: Lineup;
  seed: string;
  settings: { era: string; rating: string; diff: string };
  challenge?: Challenge | null;
  matchUrl: string;
  streakNote?: string;
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

export function Result({
  result,
  lineup,
  seed,
  settings,
  challenge,
  matchUrl,
  streakNote,
  onPlayAgain,
}: Props) {
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

  const [shared, setShared] = useState(false);
  const [sharedMatch, setSharedMatch] = useState(false);

  // Beat-my-score comparison when this run was an accepted challenge.
  const beat = challenge ? result.perfectScore - challenge.score : null;

  const shareMatch = async () => {
    const line = result.champion
      ? `I won the Rugby World Cup on XV 🏉 — now draft your own XV and face mine over 80 minutes.`
      : `I drafted an XV on XV 🏉 — draft yours and let's settle it over 80 minutes.`;
    const canNativeShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";
    track("match_share_clicked", { method: canNativeShare ? "native" : "copy", from: "result" });
    try {
      if (canNativeShare) {
        await navigator.share({ title: "XV — face my XV", text: line, url: matchUrl });
        return;
      }
    } catch {
      /* dismissed — fall through to copy */
    }
    try {
      await navigator.clipboard?.writeText(`${line}\n${matchUrl}`);
      setSharedMatch(true);
      setTimeout(() => setSharedMatch(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const share = async () => {
    const headline = result.perfect35
      ? `I built the PERFECT 35 on XV 🏉🏆 — beat that if you can.`
      : result.champion
        ? `I won the Rugby World Cup on XV 🏉 with ${result.perfectScore}/35.`
        : `I scored ${result.perfectScore}/35 on XV 🏉.`;
    const line = `${headline} Same draft — can you beat me?`;
    const link = challengeLink({
      seed,
      era: settings.era,
      rating: settings.rating,
      diff: settings.diff,
      score: result.perfectScore,
      verdict: result.verdict,
      champion: result.champion,
    });
    const text = `${line}\n${link}`;

    const canNativeShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";
    track("share_clicked", {
      method: canNativeShare ? "native" : "copy",
      champion: result.champion,
      perfect35: result.perfect35,
      perfect_score: result.perfectScore,
      is_challenge: true,
    });

    try {
      if (canNativeShare) {
        await navigator.share({ title: "XV — beat my draft", text: line, url: link });
        return;
      }
    } catch {
      // User dismissed the share sheet, or it failed — fall back to copy.
    }
    try {
      await navigator.clipboard?.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="result">
      {challenge && beat !== null && (
        <div
          className={`challenge-result ${beat > 0 ? "win" : beat === 0 ? "tie" : "loss"}`}
        >
          {beat > 0
            ? `🏆 You beat the challenge! ${result.perfectScore} vs their ${challenge.score}.`
            : beat === 0
              ? `🤝 Dead heat — ${result.perfectScore} apiece!`
              : `So close — ${result.perfectScore} vs their ${challenge.score}. Re-spin and run it back.`}
        </div>
      )}
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

      <div className="share-prompt">
        <div className="share-prompt-title">
          {result.perfect35
            ? "🏉 The Perfect 35 — surely unbeatable. Dare a mate to try."
            : result.champion
              ? `🏉 World Cup won with ${result.perfectScore}/35 — challenge a mate to top it.`
              : `🏉 You scored ${result.perfectScore}/35 — challenge a mate to beat it.`}
        </div>
        <div className="share-prompt-actions">
          <button className="btn primary" onClick={share}>
            {shared ? "Link copied!" : "Beat my score"}
          </button>
          <button className="btn primary" onClick={shareMatch}>
            {sharedMatch ? "Link copied!" : "⚔️ Play my XV (head-to-head)"}
          </button>
        </div>
        <div className="share-prompt-sub muted">
          “Beat my score” = same draft, your shot at a higher total. “Play my XV”
          = they draft their own team and the two sides play a match.
        </div>
      </div>

      {streakNote && <div className="streak-note">{streakNote}</div>}

      <div className="result-actions">
        <button
          className="btn ghost"
          onClick={() => {
            track("play_again_clicked", { from: "result" });
            onPlayAgain();
          }}
        >
          New Run
        </button>
      </div>
    </div>
  );
}
