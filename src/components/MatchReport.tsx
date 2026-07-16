import { useState } from "react";
import type { H2HResult, Lineup } from "../types";
import { Pitch } from "./Pitch";
import { track } from "../analytics";
import { shareOrCopy } from "../share";

interface Props {
  result: H2HResult;
  homeLineup: Lineup;
  record?: string;
  prepareCombinedLink: () => Promise<string>;
  prepareResultLink: () => Promise<string>;
  onChallengeSent?: () => void;
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
  record,
  prepareCombinedLink,
  prepareResultLink,
  onChallengeSent,
  onRematch,
  onNewRun,
}: Props) {
  const [shared, setShared] = useState(false);
  const [sentResult, setSentResult] = useState(false);
  const { home, away, homeWon, motm } = result;

  // Unified "Challenge a friend": one link where the recipient can play this XV
  // head-to-head, or run the same draft settings solo.
  const share = async () => {
    const line = homeWon
      ? `My XV won ${home.points}–${away.points} on XV 🏉. Take on my team, or beat my draft!`
      : `My XV lost ${home.points}–${away.points} on XV 🏉. Think you can do better? Take me on.`;
    const url = await prepareCombinedLink();
    const res = await shareOrCopy({
      title: "XV — challenge a friend",
      text: line,
      url,
    });
    onChallengeSent?.();
    track("combined_challenge_created", {
      method: res,
      from: "match",
      has_score: false,
      home_won: homeWon,
      home_points: home.points,
      away_points: away.points,
    });
    if (res === "copied") {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Send the OTHER player a link that replays this exact match, so they see the
  // same simulation and result instead of only hearing about it.
  const shareResult = async () => {
    const line = homeWon
      ? `${home.label} beat ${away.label} ${home.points}–${away.points} on XV 🏉. Watch the match:`
      : `${away.label} beat ${home.label} ${away.points}–${home.points} on XV 🏉. Watch the match:`;
    const url = await prepareResultLink();
    const res = await shareOrCopy({ title: "XV — match result", text: line, url });
    track("match_result_shared", { method: res, home_won: homeWon });
    if (res === "copied") {
      setSentResult(true);
      setTimeout(() => setSentResult(false), 2000);
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
      {record && (
        <div className="mr-record">
          Your head-to-head record: <b>{record}</b>
        </div>
      )}

      <div className="mr-send mr-send-top">
        <button className="btn primary big" onClick={shareResult}>
          {sentResult ? "Link copied — now send it! ✅" : "📲 Send the result to your opponent"}
        </button>
        <p className="mr-send-note">
          They watch the exact same 80 minutes — no re-draft needed. This is how
          they find out you played.
        </p>
      </div>

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
        <h3>{result.home.label}</h3>
        <Pitch lineup={homeLineup} />
      </div>

      <div className="result-actions">
        <button className="btn ghost" onClick={onRematch}>
          Rematch
        </button>
        <button className="btn ghost" onClick={share}>
          {shared ? "Link copied — send it!" : "🏉 Challenge a friend"}
        </button>
        <button className="btn ghost" onClick={onNewRun}>
          New Run
        </button>
      </div>
    </div>
  );
}
