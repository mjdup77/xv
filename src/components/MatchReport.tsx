import { useState } from "react";
import type { H2HResult, Lineup } from "../types";
import { Pitch } from "./Pitch";
import { track } from "../analytics";

interface Props {
  result: H2HResult;
  homeLineup: Lineup;
  challengeBackUrl: string;
  onRematch: () => void;
  onNewRun: () => void;
}

function TeamScore({
  team,
  won,
  align,
}: {
  team: H2HResult["home"];
  won: boolean;
  align: "left" | "right";
}) {
  return (
    <div className={`mr-team ${align} ${won ? "win" : ""}`}>
      <div className="mr-team-name">{team.label}</div>
      <div className="mr-team-ovr">Rating {team.overall}</div>
      <div className="mr-team-pts">{team.points}</div>
    </div>
  );
}

function tryScorerLine(scorers: string[]): string {
  if (!scorers.length) return "No tries";
  const counts = new Map<string, number>();
  for (const n of scorers) counts.set(n, (counts.get(n) ?? 0) + 1);
  return [...counts.entries()]
    .map(([n, c]) => (c > 1 ? `${n} ×${c}` : n))
    .join(", ");
}

export function MatchReport({
  result,
  homeLineup,
  challengeBackUrl,
  onRematch,
  onNewRun,
}: Props) {
  const [shared, setShared] = useState(false);
  const { home, away, homeWon, motm } = result;

  const share = async () => {
    const line = homeWon
      ? `My XV won ${home.points}–${away.points} on XV 🏉. Draft your team and face mine!`
      : `My XV lost ${home.points}–${away.points} — draft a team and take me on at XV 🏉.`;
    const canNativeShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";
    track("match_share_clicked", {
      method: canNativeShare ? "native" : "copy",
      home_won: homeWon,
      home_points: home.points,
      away_points: away.points,
    });
    try {
      if (canNativeShare) {
        await navigator.share({ title: "XV — face my XV", text: line, url: challengeBackUrl });
        return;
      }
    } catch {
      // dismissed — fall through to copy
    }
    try {
      await navigator.clipboard?.writeText(`${line}\n${challengeBackUrl}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="result match-report">
      <div className="mr-kicker">Head-to-Head · 80 minutes</div>

      <div className={`mr-scoreboard ${homeWon ? "home-win" : "away-win"}`}>
        <TeamScore team={home} won={homeWon} align="left" />
        <div className="mr-vs">
          <span className="mr-dash">–</span>
          <span className="mr-ft">FT</span>
        </div>
        <TeamScore team={away} won={!homeWon} align="right" />
      </div>

      <div className="mr-headline">{result.headline}</div>
      <div className="mr-motm">
        <span className="motm-tag">PLAYER OF THE MATCH</span> {motm.name}
        <span className="muted"> · {motm.team}</span>
      </div>

      <div className="mr-stats">
        <div className="mr-stat-row mr-stat-head">
          <span>{home.label}</span>
          <span />
          <span>{away.label}</span>
        </div>
        {(
          [
            ["Tries", home.tries, away.tries],
            ["Conversions", home.cons, away.cons],
            ["Penalties", home.pens, away.pens],
            ["Drop goals", home.drops, away.drops],
          ] as [string, number, number][]
        ).map(([label, h, a]) => (
          <div className="mr-stat-row" key={label}>
            <span className={h >= a ? "lead" : ""}>{h}</span>
            <span className="mr-stat-label">{label}</span>
            <span className={a >= h ? "lead" : ""}>{a}</span>
          </div>
        ))}
        <div className="mr-stat-row">
          <span className="mr-unit">
            {home.topUnit.name} {home.topUnit.value}
          </span>
          <span className="mr-stat-label">Top unit</span>
          <span className="mr-unit">
            {away.topUnit.name} {away.topUnit.value}
          </span>
        </div>
      </div>

      <div className="mr-scorers">
        <div>
          <span className="muted">{home.label} tries:</span> {tryScorerLine(home.tryScorers)}
        </div>
        <div>
          <span className="muted">{away.label} tries:</span> {tryScorerLine(away.tryScorers)}
        </div>
      </div>

      <div className="mr-timeline">
        <h3>How it unfolded</h3>
        <ol>
          {result.timeline.map((m, i) => (
            <li key={i} className={`tl-${m.side} tl-${m.kind}`}>
              <span className="tl-min">{m.minute}'</span>
              <span className="tl-text">{m.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="result-pitch">
        <h3>Your XV</h3>
        <Pitch lineup={homeLineup} />
      </div>

      <div className="result-actions">
        <button className="btn primary" onClick={onRematch}>
          Rematch
        </button>
        <button className="btn ghost" onClick={share}>
          {shared ? "Link copied!" : "Challenge a friend with your XV"}
        </button>
        <button className="btn ghost" onClick={onNewRun}>
          New Run
        </button>
      </div>
    </div>
  );
}
