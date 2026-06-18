import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import {
  initAnalytics,
  startRunContext,
  endRunContext,
  track,
} from "./analytics";
import type { H2HResult, Lineup, Player, SlotId, Squad, TournamentResult } from "./types";
import { positionLabel, ROLE_ORDER, SLOTS } from "./data/slots";
import { SQUADS, type RatingMode } from "./data/squads";
import {
  applyMove,
  buildSpinSequence,
  eligibleOpenSlots,
  isPickable,
  moveTargets,
  openSlots,
  playerKey,
  squadHasPick,
} from "./engine/draft";
import { computeFacets } from "./engine/ratings";
import { Rng } from "./engine/rng";
import {
  readIncomingChallenge,
  readIncomingMatch,
  lineupFromMatch,
  matchLink,
  type Challenge,
  type MatchChallenge,
} from "./challenge";
import { recordPlay, streakStatus } from "./streak";
import { StrengthPanel } from "./components/StrengthPanel";
import { simulate, simH2H } from "./engine/sim";
import { Pitch } from "./components/Pitch";
import { Result } from "./components/Result";
import { MatchReport } from "./components/MatchReport";
import { SimPlayback } from "./components/SimPlayback";
import { Footer } from "./components/Footer";

type Phase = "home" | "draft" | "sim" | "result" | "match";

const DIFFICULTY = {
  easy: { label: "Easy", respins: 5, hideRatings: false, blurb: "5 re-spins · ratings shown" },
  medium: { label: "Medium", respins: 3, hideRatings: false, blurb: "3 re-spins · ratings shown" },
  hard: { label: "Difficult", respins: 1, hideRatings: true, blurb: "1 re-spin · ratings hidden" },
} as const;
type Diff = keyof typeof DIFFICULTY;

const ERA = {
  all: { label: "All-time", minYear: 0 },
  m2000: { label: "2000s+", minYear: 2000 },
  m2010: { label: "2010s+", minYear: 2010 },
} as const;
type Era = keyof typeof ERA;

const RATING = {
  seasonal: {
    label: "Seasonal",
    blurb: "Players rated at that World Cup",
  },
  prime: {
    label: "Prime",
    blurb: "Every player at their career peak",
  },
} as const satisfies Record<RatingMode, { label: string; blurb: string }>;

// Canonical settings for the shared Daily Challenge, so every player faces the
// identical draft regardless of their own toggle preferences.
const DAILY = { diff: "medium", era: "all", rating: "seasonal" } as const;

function todaySeed(): string {
  return "daily-" + new Date().toISOString().slice(0, 10);
}
function randomSeed(): string {
  return "run-" + Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("home");
  const [seed, setSeed] = useState("");
  const [spins, setSpins] = useState<Squad[]>([]);
  const [spinIndex, setSpinIndex] = useState(0);
  const [lineup, setLineup] = useState<Lineup>({});
  const [pickedKeys, setPickedKeys] = useState<Set<string>>(new Set());
  const [currentSquad, setCurrentSquad] = useState<Squad | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinLabel, setSpinLabel] = useState<Squad | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [movingSlot, setMovingSlot] = useState<SlotId | null>(null);
  const [respinsLeft, setRespinsLeft] = useState(3);
  const [difficulty, setDifficulty] = useState<Diff>("medium");
  const [era, setEra] = useState<Era>("all");
  const [ratingMode, setRatingMode] = useState<RatingMode>("prime");
  const [hideRatings, setHideRatings] = useState(false);
  const [result, setResult] = useState<TournamentResult | null>(null);
  const [incomingChallenge, setIncomingChallenge] = useState<Challenge | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  // Head-to-head: an opponent XV we're playing against, the match result, and a
  // nonce so "Rematch" produces a fresh 80 minutes.
  const [incomingMatch, setIncomingMatch] = useState<MatchChallenge | null>(null);
  const [opponentLineup, setOpponentLineup] = useState<Lineup | null>(null);
  const [matchResult, setMatchResult] = useState<H2HResult | null>(null);
  const [matchNonce, setMatchNonce] = useState(0);
  const [matchLinkCopied, setMatchLinkCopied] = useState(false);
  const [streak, setStreak] = useState(() => streakStatus());
  const animRef = useRef<number | null>(null);
  const lastSquadIdRef = useRef<string | null>(null);

  const remaining = openSlots(lineup);
  const isComplete = remaining.length === 0;
  const filled = 15 - remaining.length;
  const proj = useMemo(() => computeFacets(lineup), [lineup]);

  useEffect(() => {
    initAnalytics();
    const m = readIncomingMatch();
    if (m) {
      const opp = lineupFromMatch(m);
      if (opp) {
        setIncomingMatch(m);
        setOpponentLineup(opp);
        // Match the challenger's draft settings so both build comparable XVs.
        if (m.diff in DIFFICULTY) setDifficulty(m.diff as Diff);
        if (m.era in ERA) setEra(m.era as Era);
        if (m.rating in RATING) setRatingMode(m.rating as RatingMode);
        track("match_opened", { opponent_overall: m.overall });
        return;
      }
    }
    const c = readIncomingChallenge();
    if (c) {
      setIncomingChallenge(c);
      // Reflect the challenge's settings in the home selectors for clarity.
      if (c.diff in DIFFICULTY) setDifficulty(c.diff as Diff);
      if (c.era in ERA) setEra(c.era as Era);
      if (c.rating in RATING) setRatingMode(c.rating as RatingMode);
      track("challenge_opened", { score: c.score, champion: c.champion });
    }
  }, []);

  const startRun = useCallback(
    (opts?: { daily?: boolean; accept?: Challenge | null }) => {
      const accept = opts?.accept ?? null;
      const isDaily = !!opts?.daily;
      // Shared challenges must be airtight: everyone faces the SAME draft. A
      // friend-challenge replays the challenger's exact settings; the Daily uses
      // a fixed canonical set so toggles can't make two players' drafts differ.
      const useDiff = (
        accept && accept.diff in DIFFICULTY ? accept.diff : isDaily ? DAILY.diff : difficulty
      ) as Diff;
      const useEra = (
        accept && accept.era in ERA ? accept.era : isDaily ? DAILY.era : era
      ) as Era;
      const useRating = (
        accept && accept.rating in RATING ? accept.rating : isDaily ? DAILY.rating : ratingMode
      ) as RatingMode;
      const cfg = DIFFICULTY[useDiff];
      const s = accept ? accept.seed : isDaily ? todaySeed() : randomSeed();
      if (accept || isDaily) {
        setDifficulty(useDiff);
        setEra(useEra);
        setRatingMode(useRating);
      }
      setActiveChallenge(accept);
      startRunContext({ difficulty: useDiff, era: useEra, rating_mode: useRating });
      track("run_started", {
        mode: accept ? "challenge" : opts?.daily ? "daily" : "new",
        seed: s,
      });
      setSeed(s);
      setSpins(buildSpinSequence(s, 60, ERA[useEra].minYear, useRating));
      setSpinIndex(0);
      setLineup({});
      setPickedKeys(new Set());
      setCurrentSquad(null);
      lastSquadIdRef.current = null;
      setSelectedPlayer(null);
      setMovingSlot(null);
      setSpinning(false);
      setRespinsLeft(cfg.respins);
      setHideRatings(cfg.hideRatings);
      setResult(null);
      setPhase("draft");
    },
    [difficulty, era, ratingMode],
  );

  const landSquad = useCallback(
    (curLineup: Lineup, curPicked: Set<string>, fromIndex: number) => {
      const round = 15 - openSlots(curLineup).length + 1;
      // The squad currently shown (the one being re-spun away from). Never land
      // back on it unless it's the only option, so re-spins always feel fresh.
      const avoid = lastSquadIdRef.current;
      const landOn = (sq: Squad, nextIndex: number | null, fallback: boolean) => {
        lastSquadIdRef.current = sq.id;
        setCurrentSquad(sq);
        if (nextIndex !== null) setSpinIndex(nextIndex);
        track("wheel_spun", {
          round,
          squad_nation: sq.nation,
          squad_year: sq.year,
          ...(fallback ? { fallback: true } : {}),
        });
      };
      // Pass 1: next pickable squad in the pre-rolled sequence that differs from
      // the one we're leaving.
      for (let i = fromIndex; i < spins.length; i++) {
        if (spins[i].id !== avoid && squadHasPick(spins[i], curLineup, curPicked)) {
          landOn(spins[i], i + 1, false);
          return;
        }
      }
      // Pass 2: allow repeating the same id only if the sequence has nothing else.
      for (let i = fromIndex; i < spins.length; i++) {
        if (squadHasPick(spins[i], curLineup, curPicked)) {
          landOn(spins[i], i + 1, false);
          return;
        }
      }
      // Fallback (sequence exhausted): random pickable squad from the same
      // era/rating pool, avoiding the current one where possible.
      const pool = Array.from(new Map(spins.map((s) => [s.id, s])).values());
      const pickable = pool.filter((sq) => squadHasPick(sq, curLineup, curPicked));
      const preferred = pickable.filter((sq) => sq.id !== avoid);
      const choices = (preferred.length > 0 ? preferred : pickable).sort((a, b) =>
        a.id.localeCompare(b.id),
      );
      if (choices.length > 0) {
        // Deterministic pick (seed + round) so the fallback is reproducible too.
        const r = new Rng(seed + ":fb:" + round);
        landOn(choices[r.int(0, choices.length - 1)], null, true);
        return;
      }
      setCurrentSquad(null);
    },
    [spins, seed],
  );

  const doSpin = useCallback(() => {
    if (spinning) return;
    setSelectedPlayer(null);
    setMovingSlot(null);
    setSpinning(true);
    const start = performance.now();
    const dur = 850;
    const tick = () => {
      const t = performance.now() - start;
      setSpinLabel(SQUADS[Math.floor(Math.random() * SQUADS.length)]);
      if (t < dur) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setSpinning(false);
        setSpinLabel(null);
        landSquad(lineup, pickedKeys, spinIndex);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [spinning, lineup, pickedKeys, spinIndex, landSquad]);

  const assign = useCallback(
    (p: Player, slot: SlotId) => {
      const newLineup = { ...lineup, [slot]: p };
      const newPicked = new Set(pickedKeys);
      newPicked.add(playerKey(p));
      const newFilled = 15 - openSlots(newLineup).length;
      track("player_picked", {
        round: newFilled,
        slot,
        player_name: p.name,
        player_ovr: p.ovr,
        position: p.role,
        squad_nation: p.nation,
        squad_year: p.year,
      });
      if (newFilled === 15) {
        track("xv_completed", {
          squad_overall: Math.round(computeFacets(newLineup).overall),
          respins_left: respinsLeft,
        });
      }
      setLineup(newLineup);
      setPickedKeys(newPicked);
      setCurrentSquad(null);
      setSelectedPlayer(null);
      setMovingSlot(null);
    },
    [lineup, pickedKeys, respinsLeft],
  );

  const pickPlayer = useCallback(
    (p: Player) => {
      const slots = eligibleOpenSlots(p, lineup);
      if (slots.length === 0) return;
      setMovingSlot(null);
      if (slots.length === 1) assign(p, slots[0]);
      else setSelectedPlayer(p);
    },
    [lineup, assign],
  );

  // Highlighted target slots for whichever interaction is active.
  const highlightSlots = useMemo<SlotId[]>(() => {
    if (selectedPlayer) return eligibleOpenSlots(selectedPlayer, lineup);
    if (movingSlot) return moveTargets(movingSlot, lineup);
    return [];
  }, [selectedPlayer, movingSlot, lineup]);

  const onSlotClick = useCallback(
    (slot: SlotId) => {
      // Placing a freshly drafted player.
      if (selectedPlayer) {
        if (eligibleOpenSlots(selectedPlayer, lineup).includes(slot)) {
          assign(selectedPlayer, slot);
        }
        return;
      }
      // Mid-move: drop onto a valid target, or tap the same slot to cancel.
      if (movingSlot) {
        if (slot === movingSlot) {
          setMovingSlot(null);
        } else if (moveTargets(movingSlot, lineup).includes(slot)) {
          track("player_moved", {
            from_slot: movingSlot,
            to_slot: slot,
            is_swap: Boolean(lineup[slot]),
          });
          setLineup(applyMove(movingSlot, slot, lineup));
          setMovingSlot(null);
        }
        return;
      }
      // Idle: pick up an already-placed player to move them.
      if (lineup[slot]) setMovingSlot(slot);
    },
    [selectedPlayer, movingSlot, lineup, assign],
  );

  const reSpin = useCallback(() => {
    if (respinsLeft <= 0) return;
    track("respin_used", { round: filled + 1, respins_left: respinsLeft - 1 });
    setRespinsLeft((r) => r - 1);
    setCurrentSquad(null);
    doSpin();
  }, [respinsLeft, doSpin, filled]);

  const kickOff = useCallback(() => {
    track("kickoff_clicked", {});
    const r = simulate(lineup, seed);
    const st = streakStatus(recordPlay());
    setStreak(st);
    track("run_completed", {
      champion: r.champion,
      perfect35: r.perfect35,
      perfect_score: r.perfectScore,
      overall: Math.round(r.overall),
      advanced_from_pool: r.advancedFromPool,
      tries_for: r.triesFor,
      tries_against: r.triesAgainst,
      verdict: r.verdict,
      identity: r.identity,
      streak_day: st.current,
    });
    setResult(r);
    setPhase("sim");
  }, [lineup, seed]);

  // A match's outcome is seeded from both XVs (plus a nonce for rematches), so
  // it's deterministic for a given matchup but can be re-rolled.
  const matchSeed = useCallback(
    (home: Lineup, away: Lineup, nonce: number) =>
      "m:" +
      SLOTS.map((s) => home[s.id]?.id ?? "").join(",") +
      "|" +
      SLOTS.map((s) => away[s.id]?.id ?? "").join(",") +
      ":" +
      nonce,
    [],
  );

  const kickOffMatch = useCallback(
    (nonce = 0) => {
      if (!opponentLineup) return;
      const oppName = incomingMatch?.name || "Challenger";
      const r = simH2H(
        lineup,
        opponentLineup,
        { home: "Your XV", away: oppName },
        matchSeed(lineup, opponentLineup, nonce),
      );
      if (nonce === 0) setStreak(streakStatus(recordPlay()));
      track("match_played", {
        home_won: r.homeWon,
        home_points: r.home.points,
        away_points: r.away.points,
        overall: Math.round(proj.overall),
        opponent_overall: incomingMatch?.overall ?? 0,
        rematch: nonce > 0,
      });
      setMatchResult(r);
      setMatchNonce(nonce);
      setPhase("match");
    },
    [opponentLineup, incomingMatch, lineup, proj.overall, matchSeed],
  );

  const buildMatchChallenge = useCallback(
    (): MatchChallenge => ({
      ids: SLOTS.map((s) => lineup[s.id]?.id ?? ""),
      rating: ratingMode,
      era,
      diff: difficulty,
      name: "A friend",
      overall: proj.overall,
    }),
    [lineup, ratingMode, era, difficulty, proj.overall],
  );

  const shareMatchChallenge = useCallback(async () => {
    const url = matchLink(buildMatchChallenge());
    const line = `I drafted an XV on XV 🏉 — draft your own and let's settle it over 80 minutes.`;
    const canNativeShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";
    track("match_challenge_created", { overall: Math.round(proj.overall) });
    try {
      if (canNativeShare) {
        await navigator.share({ title: "XV — face my XV", text: line, url });
        return;
      }
    } catch {
      // dismissed — fall through to copy
    }
    try {
      await navigator.clipboard?.writeText(`${line}\n${url}`);
      setMatchLinkCopied(true);
      setTimeout(() => setMatchLinkCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [buildMatchChallenge, proj.overall]);

  // ---------- RENDER ----------
  if (phase === "home") {
    return (
      <div className="home">
        <div className="home-inner">
          <h1 className="logo">
            XV<span className="logo-dot" />
          </h1>
          <p className="tagline">
            Draft an all-time Rugby World Cup XV, one legend at a time.
            <br />
            Win the trophy. Then chase the impossible:{" "}
            <strong>the Perfect 35</strong>.
          </p>
          <div className="home-stats">
            <div>
              <b>{SQUADS.length}</b>
              <span>RWC squads</span>
            </div>
            <div>
              <b>{SQUADS.reduce((n, s) => n + s.players.length, 0)}</b>
              <span>legends</span>
            </div>
            <div>
              <b>7</b>
              <span>matches to glory</span>
            </div>
          </div>
          {(streak.status === "kept" || streak.status === "alive") && (
            <div className={`streak-badge ${streak.status}`}>
              <span className="streak-flame">🔥</span>
              <span className="streak-count">{streak.current}-day streak</span>
              {streak.status === "alive" && (
                <span className="streak-sub">play today to keep it alive</span>
              )}
            </div>
          )}
          {incomingMatch && opponentLineup && (
            <div className="challenge-banner match">
              <div className="cb-title">⚔️ Head-to-head challenge!</div>
              <div className="cb-detail">
                {incomingMatch.name} drafted an XV rated{" "}
                <b>{incomingMatch.overall}</b> and wants to play you.
              </div>
              <button className="btn primary big" onClick={() => startRun()}>
                Draft your XV to face them
              </button>
              <div className="cb-note muted">
                Build your best 15, then kick off an 80-minute match.
              </div>
            </div>
          )}
          {!incomingMatch && incomingChallenge && (
            <div className="challenge-banner">
              <div className="cb-title">🏉 You've been challenged!</div>
              <div className="cb-detail">
                A friend scored <b>{incomingChallenge.score}/35</b>
                {incomingChallenge.champion ? " 🏆" : ""} on this exact draft.
              </div>
              <button
                className="btn primary big"
                onClick={() => startRun({ accept: incomingChallenge })}
              >
                Accept Challenge
              </button>
              <div className="cb-note muted">
                Same squads, same settings — can you beat it?
              </div>
            </div>
          )}
          <div className="difficulty">
            <span className="difficulty-label">Difficulty</span>
            <div className="seg">
              {(Object.keys(DIFFICULTY) as Diff[]).map((d) => (
                <button
                  key={d}
                  className={`seg-btn ${difficulty === d ? "active" : ""}`}
                  onClick={() => setDifficulty(d)}
                >
                  {DIFFICULTY[d].label}
                </button>
              ))}
            </div>
            <span className="difficulty-blurb">{DIFFICULTY[difficulty].blurb}</span>
          </div>
          <div className="difficulty">
            <span className="difficulty-label">Era</span>
            <div className="seg">
              {(Object.keys(ERA) as Era[]).map((e) => (
                <button
                  key={e}
                  className={`seg-btn ${era === e ? "active" : ""}`}
                  onClick={() => setEra(e)}
                >
                  {ERA[e].label}
                </button>
              ))}
            </div>
            <span className="difficulty-blurb">
              {era === "all"
                ? "Every World Cup, 1987–present"
                : `Only squads from ${ERA[era].minYear} onward`}
            </span>
          </div>
          <div className="difficulty">
            <span className="difficulty-label">Ratings</span>
            <div className="seg">
              {(Object.keys(RATING) as RatingMode[]).map((r) => (
                <button
                  key={r}
                  className={`seg-btn ${ratingMode === r ? "active" : ""}`}
                  onClick={() => setRatingMode(r)}
                >
                  {RATING[r].label}
                </button>
              ))}
            </div>
            <span className="difficulty-blurb">{RATING[ratingMode].blurb}</span>
          </div>
          <div className="home-actions">
            <button className="btn primary big" onClick={() => startRun()}>
              Start New Run
            </button>
            <button className="btn ghost big" onClick={() => startRun({ daily: true })}>
              Daily Challenge
            </button>
          </div>
          <p className="muted home-daily-note">
            Daily Challenge = the same draft for everyone today (fixed settings:
            all-time · seasonal · medium). Compare scores with friends.
          </p>
          <div className="home-how">
            <p>
              <b>Spin</b> a country + World Cup year → <b>draft</b> one player into your
              XV → repeat 15 times → <b>simulate</b> the tournament.
            </p>
            <p className="muted">
              The Perfect 35 = a try-bonus-point win in every one of the 7 matches on
              the way to lifting the cup. It has never been done.
            </p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (phase === "sim" && result) {
    return <SimPlayback result={result} onDone={() => setPhase("result")} />;
  }

  if (phase === "result" && result) {
    return (
      <Result
        result={result}
        lineup={lineup}
        seed={seed}
        settings={{ era, rating: ratingMode, diff: difficulty }}
        challenge={activeChallenge}
        matchUrl={matchLink(buildMatchChallenge())}
        streakNote={
          streak.status === "kept" && streak.current > 0
            ? `🔥 ${streak.current}-day streak — come back tomorrow to make it ${streak.current + 1}.`
            : undefined
        }
        onPlayAgain={() => startRun({ daily: seed.startsWith("daily") })}
      />
    );
  }

  if (phase === "match" && matchResult) {
    return (
      <MatchReport
        result={matchResult}
        homeLineup={lineup}
        challengeBackUrl={matchLink(buildMatchChallenge())}
        onRematch={() => kickOffMatch(matchNonce + 1)}
        onNewRun={() => {
          setIncomingMatch(null);
          setOpponentLineup(null);
          setMatchResult(null);
          setPhase("home");
        }}
      />
    );
  }

  // DRAFT
  return (
    <div className="draft">
      <header className="draft-head">
        <div
          className="logo-sm"
          onClick={() => {
            track("run_abandoned", { round: filled + 1 });
            endRunContext();
            setPhase("home");
          }}
        >
          XV
        </div>
        <div className="progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(filled / 15) * 100}%` }} />
          </div>
          <span>{filled}/15 picked</span>
        </div>
        <div className="proj">
          <span>Squad rating</span>
          <b>{hideRatings ? "?" : Math.round(proj.overall)}</b>
        </div>
      </header>

      {filled > 0 && (
        <StrengthPanel facets={proj} hideRatings={hideRatings} filled={filled} />
      )}

      <div className="draft-body">
        <div className="draft-pitch">
          <Pitch
            lineup={lineup}
            highlight={highlightSlots}
            movingSlot={movingSlot}
            hideRatings={hideRatings}
            onSlotClick={onSlotClick}
          />
          {selectedPlayer ? (
            <div className="slot-prompt">
              Choose a position for <b>{selectedPlayer.name}</b>
              <button className="btn tiny ghost" onClick={() => setSelectedPlayer(null)}>
                cancel
              </button>
            </div>
          ) : movingSlot && lineup[movingSlot] ? (
            <div className="slot-prompt">
              Moving <b>{lineup[movingSlot]!.name}</b> — tap a highlighted spot
              <button className="btn tiny ghost" onClick={() => setMovingSlot(null)}>
                cancel
              </button>
            </div>
          ) : (
            filled > 0 &&
            !isComplete && (
              <div className="pitch-tip">Tip: tap a player on the pitch to move them.</div>
            )
          )}
        </div>

        <aside className="draft-panel">
          {isComplete ? (
            opponentLineup ? (
              <div className="complete">
                <h2>Your XV is set.</h2>
                <p className="muted">
                  Time to face {incomingMatch?.name ?? "your challenger"}'s XV
                  {incomingMatch ? ` (rated ${incomingMatch.overall})` : ""}.
                </p>
                <button className="btn primary big" onClick={() => kickOffMatch(0)}>
                  Play the Match ⚔️
                </button>
                <button className="btn ghost" onClick={kickOff}>
                  Play a solo World Cup instead
                </button>
              </div>
            ) : (
              <div className="complete">
                <h2>Your XV is set.</h2>
                <p className="muted">15 legends, one shot at immortality.</p>
                <button className="btn primary big" onClick={kickOff}>
                  Kick Off the World Cup →
                </button>
                <button className="btn ghost" onClick={shareMatchChallenge}>
                  {matchLinkCopied ? "Link copied!" : "⚔️ Challenge a friend to a match"}
                </button>
              </div>
            )
          ) : !currentSquad ? (
            <div className="spin-area">
              <div className={`wheel ${spinning ? "spinning" : ""}`}>
                {spinning && spinLabel ? (
                  <>
                    <div className="wheel-flag">{spinLabel.flag}</div>
                    <div className="wheel-nation">{spinLabel.nation}</div>
                    <div className="wheel-year">{spinLabel.year}</div>
                  </>
                ) : (
                  <div className="wheel-idle">Round {filled + 1}</div>
                )}
              </div>
              <button className="btn primary big" onClick={doSpin} disabled={spinning}>
                {spinning ? "Spinning…" : "Spin the Wheel"}
              </button>
            </div>
          ) : (
            <div className="squad-pick">
              <div className="squad-head">
                <span className="squad-flag">{currentSquad.flag}</span>
                <div>
                  <div className="squad-nation">{currentSquad.nation}</div>
                  <div className="squad-year">{currentSquad.year} World Cup squad</div>
                </div>
              </div>
              <p className="pick-hint">Draft one player into your XV:</p>
              <ul className="player-list">
                {[...currentSquad.players]
                  .map((p) => ({ p, ok: isPickable(p, lineup, pickedKeys) }))
                  .sort((a, b) =>
                    a.ok !== b.ok
                      ? Number(b.ok) - Number(a.ok)
                      : hideRatings
                        ? ROLE_ORDER[a.p.role] - ROLE_ORDER[b.p.role] ||
                          a.p.name.localeCompare(b.p.name)
                        : b.p.ovr - a.p.ovr,
                  )
                  .map(({ p, ok }) => (
                    <li key={p.id}>
                      <button
                        className={`player-row ${ok ? "" : "disabled"} ${hideRatings ? "no-rating" : ""}`}
                        onClick={() => ok && pickPlayer(p)}
                        disabled={!ok}
                      >
                        {!hideRatings && <span className="pr-ovr">{p.ovr}</span>}
                        <span className="pr-mid">
                          <span className="pr-name">{p.name}</span>
                        </span>
                        <span className="pr-pos">
                          {pickedKeys.has(playerKey(p)) ? "picked" : positionLabel(p)}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
              <button
                className="btn ghost"
                onClick={reSpin}
                disabled={respinsLeft <= 0}
              >
                Re-spin ({respinsLeft} left)
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
