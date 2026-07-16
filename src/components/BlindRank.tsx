import { useEffect, useMemo, useState } from "react";
import type { Player } from "../types";
import { positionLabel } from "../data/slots";
import { track } from "../analytics";
import { shareOrCopy } from "../share";
import { recordPlay } from "../streak";
import { flagFor } from "../blindrank/themes";
import {
  loadResult,
  puzzleForDay,
  saveResult,
  scorePlacements,
  SELECTION_VERSION,
  shareLink,
  shareText,
  surnameOf,
  type DailyPuzzle,
  type StoredResult,
} from "../blindrank/daily";

interface Props {
  onHome: () => void;
  onPlayed?: () => void; // fired after a completion so home can refresh the streak
  // When the player has a past solo run, an aligned "Challenge a friend" action
  // is offered that shares the unified combined link. Null hides it.
  prepareChallengeLink?: (() => Promise<string | null>) | null;
  onChallengeSent?: () => void;
}

// Build a display-label function for a puzzle's 8 players: surname only, but
// disambiguate when different people would otherwise read alike:
//   • shared surname (e.g. the two Taylors) → prefix the first initial;
//   • identical full name (e.g. two Jonathan Davies) → also tag the era year,
//     since the initial can't separate them.
function makeLabeler(players: Player[]): (p: Player) => string {
  const surnameCounts = new Map<string, number>();
  const initialCounts = new Map<string, number>();
  for (const p of players) {
    const sname = surnameOf(p.name).toLowerCase();
    surnameCounts.set(sname, (surnameCounts.get(sname) ?? 0) + 1);
    const initialKey = `${p.name.trim().charAt(0).toLowerCase()}|${sname}`;
    initialCounts.set(initialKey, (initialCounts.get(initialKey) ?? 0) + 1);
  }
  return (p: Player) => {
    const sname = surnameOf(p.name);
    if ((surnameCounts.get(sname.toLowerCase()) ?? 0) <= 1) return sname;
    const initial = p.name.trim().charAt(0);
    const initialKey = `${initial.toLowerCase()}|${sname.toLowerCase()}`;
    // Same first initial AND surname → the initial won't help; tag the year.
    if ((initialCounts.get(initialKey) ?? 0) > 1) return `${sname} ’${String(p.year).slice(2)}`;
    return initial ? `${initial}. ${sname}` : sname;
  };
}

function scoreVerdict(score: number): string {
  if (score === 100) return "Perfect ranking — flawless.";
  if (score >= 90) return "Elite eye for talent.";
  if (score >= 75) return "Sharp — a proper selector.";
  if (score >= 55) return "Solid instincts.";
  if (score >= 35) return "Room to grow.";
  return "Back to the drawing board.";
}

export function BlindRank({
  onHome,
  onPlayed,
  prepareChallengeLink,
  onChallengeSent,
}: Props) {
  const puzzle = useMemo<DailyPuzzle>(() => puzzleForDay(), []);
  const label = useMemo(() => makeLabeler(puzzle.players), [puzzle]);
  const [stored] = useState<StoredResult | null>(() => loadResult(puzzle.day));
  const [challengeCopied, setChallengeCopied] = useState(false);

  // Live game state (only used when there's no stored result yet).
  const [placements, setPlacements] = useState<(Player | null)[]>(
    () => Array.from({ length: puzzle.players.length }, () => null),
  );
  const [revealIndex, setRevealIndex] = useState(0);
  const [live, setLive] = useState<StoredResult | null>(null); // set on completion
  const [shared, setShared] = useState(false);

  // Fire the opened event once on mount.
  useEffect(() => {
    track("blindrank_opened", {
      puzzle: puzzle.puzzle,
      theme: puzzle.theme.title,
      replay: !!loadResult(puzzle.day),
      selection: SELECTION_VERSION,
    });
  }, [puzzle]);

  const result = stored ?? live;
  const n = puzzle.players.length;

  const place = (slot: number) => {
    if (placements[slot]) return; // locked, no takebacks
    const current = puzzle.players[revealIndex];
    if (!current) return;
    const next = placements.slice();
    next[slot] = current;
    setPlacements(next);
    const nextIndex = revealIndex + 1;
    setRevealIndex(nextIndex);
    if (nextIndex >= n) finish(next as Player[]);
  };

  const finish = (final: Player[]) => {
    const s = scorePlacements(final, puzzle.trueOrder);
    const rec: StoredResult = {
      puzzle: puzzle.puzzle,
      day: puzzle.day,
      theme: puzzle.theme.title,
      score: s.score,
      grid: s.grid,
      placed: final.map((p) => p.id),
    };
    saveResult(rec);
    recordPlay();
    onPlayed?.();
    track("blindrank_completed", {
      puzzle: puzzle.puzzle,
      theme: puzzle.theme.title,
      score: s.score,
      exact: s.exact,
    });
    setLive(rec);
  };

  const share = async () => {
    if (!result) return;
    const text = shareText(result);
    const res = await shareOrCopy({
      title: `XV Blind Rank #${result.puzzle}`,
      text,
      url: shareLink(),
    });
    track("blindrank_shared", { method: res, puzzle: result.puzzle, score: result.score });
    if (res === "copied") {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Aligned unified challenge: share the player's last XV so a mate can beat the
  // score or play it head-to-head. Only shown when a past run exists.
  const challengeFriend = async () => {
    if (!prepareChallengeLink) return;
    const url = await prepareChallengeLink();
    if (!url) return;
    const res = await shareOrCopy({
      title: "XV — challenge a friend",
      text: "I've been playing XV 🏉 — beat my score, or take on my XV head-to-head.",
      url,
    });
    onChallengeSent?.();
    track("combined_challenge_created", { from: "blindrank", method: res, has_score: true });
    if (res === "copied") {
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 2000);
    }
  };

  // ---------- COMPLETED / REVEAL ----------
  if (result) {
    // Which slot did the user put each player in? (rank of player id in `placed`)
    const placedSlot = new Map<string, number>();
    result.placed.forEach((id, slot) => placedSlot.set(id, slot));

    return (
      <div className="brank">
        <header className="brank-head">
          <div className="logo-sm" onClick={onHome}>XV</div>
          <div className="brank-head-mid">
            <span className="brank-kicker">Blind Rank</span>
            <span className="brank-puzzle">#{result.puzzle}</span>
          </div>
          <div />
        </header>

        <div className="brank-reveal">
          <div className="brank-scorecard">
            <div className="brank-score-num">{result.score}<span>/100</span></div>
            <div className="brank-score-verdict">{scoreVerdict(result.score)}</div>
            <div className="brank-grid">
              {result.grid.map((t, i) => (
                <span key={i} className="brank-tile">{t}</span>
              ))}
            </div>
            <div className="brank-theme muted">{result.theme}</div>
          </div>

          <h3 className="brank-reveal-title">True rank vs. your pick</h3>
          <ol className="brank-truelist">
            {puzzle.trueOrder.map((p, trueRank) => {
              const yourSlot = placedSlot.get(p.id);
              const offset = yourSlot != null ? yourSlot - trueRank : null;
              const mag = offset == null ? 0 : Math.abs(offset);
              // Consistent with the emoji grid: exact=🟩, off-by-one=🟨, else=⬜.
              const acc = mag === 0 ? "exact" : mag === 1 ? "near" : "off";
              const delta =
                offset == null ? "" : offset === 0 ? "✓" : offset < 0 ? `▲${mag}` : `▼${mag}`;
              return (
                <li key={p.id} className="brank-truerow">
                  <span className="brank-truerank">{trueRank + 1}</span>
                  <span className="brank-flag">{flagFor(p.nation)}</span>
                  <span className="brank-tp-name">
                    <span className="brank-tp-surname">{label(p)}</span>
                    <span className="brank-tp-sub muted">
                      {positionLabel(p)} · {p.year}
                    </span>
                  </span>
                  <span className="brank-tp-ovr">{p.ovr}</span>
                  <span className={`brank-tp-result ${acc}`}>
                    <span className="brank-tp-pick">
                      {yourSlot != null ? `Your pick: #${yourSlot + 1}` : "—"}
                    </span>
                    <span className="brank-tp-delta">{delta}</span>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="brank-share">
            <button className="btn primary big" onClick={share}>
              {shared ? "Copied!" : "Share result"}
            </button>
            {prepareChallengeLink && (
              <button className="btn gold" onClick={challengeFriend}>
                {challengeCopied ? "Link copied — send it!" : "🏉 Challenge a friend to XV"}
              </button>
            )}
            <button className="btn ghost" onClick={onHome}>Back home</button>
            <p className="brank-comeback muted">
              A fresh Blind Rank drops every day — come back tomorrow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- PLAYING ----------
  const current = puzzle.players[revealIndex];
  return (
    <div className="brank">
      <header className="brank-head">
        <div
          className="logo-sm"
          onClick={() => {
            track("blindrank_abandoned", { placed: revealIndex, puzzle: puzzle.puzzle });
            onHome();
          }}
        >
          XV
        </div>
        <div className="brank-head-mid">
          <span className="brank-kicker">Blind Rank</span>
          <span className="brank-puzzle">#{puzzle.puzzle}</span>
        </div>
        <div />
      </header>

      <div className="brank-play">
        <div className="brank-prompt">
          <div className="brank-theme-title">{puzzle.theme.title}</div>
          <div className="brank-theme-blurb muted">
            Rank {puzzle.theme.blurb} — best (1) to worst ({n}). One at a time, no takebacks.
          </div>
        </div>

        {current && (
          <div className="brank-card reveal" key={revealIndex}>
            <div className="brank-card-count">Player {revealIndex + 1} of {n}</div>
            <div className="brank-card-flag">{flagFor(current.nation)}</div>
            <div className="brank-card-name">{label(current)}</div>
            <div className="brank-card-meta">
              <span>{positionLabel(current)}</span>
              <span className="dot">·</span>
              <span>{current.nation}</span>
              <span className="dot">·</span>
              <span>{current.year}</span>
            </div>
            <div className="brank-card-hint muted">Rating hidden — trust your gut.</div>
          </div>
        )}

        <div className="brank-slots">
          {placements.map((p, slot) => (
            <button
              key={slot}
              className={`brank-slot ${p ? "filled" : "open"}`}
              onClick={() => place(slot)}
              disabled={!!p || !current}
            >
              <span className="brank-slot-rank">{slot + 1}</span>
              {p ? (
                <span className="brank-slot-name">
                  {flagFor(p.nation)} {label(p)}
                </span>
              ) : (
                <span className="brank-slot-empty">
                  {current ? "Place here" : "—"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
