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
  readIncomingMatchResult,
  readIncomingCombined,
  lineupFromMatch,
  lineupsFromMatchSeed,
  matchLink,
  matchResultLink,
  combinedLink,
  challengeFromCombined,
  matchFromCombined,
  type Challenge,
  type MatchChallenge,
  type CombinedChallenge,
} from "./challenge";
import { saveLastChallenge, getLastChallenge, type LastChallenge } from "./lastchallenge";
import { autoDraftLineup } from "./engine/autodraft";
import { getPendingMatch, savePendingMatch, clearPendingMatch } from "./pending";
import { recordPlay, streakStatus } from "./streak";
import {
  getCareer,
  recordRun,
  recordMatch,
  recordChallengeSent,
  careerChips,
  h2hRecord,
  type Career,
} from "./career";
import { shareOrCopy } from "./share";
import { getName, setName, teamLabel } from "./name";
import { EcosystemMenu } from "./components/EcosystemMenu";
import { MatchPlayback } from "./components/MatchPlayback";
import { BlindRank } from "./components/BlindRank";
import { NamePrompt } from "./components/NamePrompt";
import { StrengthPanel } from "./components/StrengthPanel";
import { simulate, simH2H } from "./engine/sim";
import { Pitch } from "./components/Pitch";
import { Result } from "./components/Result";
import { MatchReport } from "./components/MatchReport";
import { SimPlayback } from "./components/SimPlayback";
import { Footer } from "./components/Footer";

type Phase = "home" | "draft" | "sim" | "result" | "matchsim" | "match" | "blindrank";

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

// A light, friendly taunt scaled to how strong the challenger's XV is.
function matchTaunt(overall: number): string {
  if (overall >= 88) return "They think it's unbeatable. Prove them wrong.";
  if (overall >= 84) return "A serious XV. Can yours handle it?";
  if (overall >= 80) return "Beatable — if you draft smart.";
  return "There's a gap here. Go exploit it.";
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
  // The unified "Challenge a friend" link (?x=): the recipient chooses to beat
  // the score (solo) or play the challenger's XV (head-to-head).
  const [incomingCombined, setIncomingCombined] = useState<CombinedChallenge | null>(null);
  // The player's most recent completed solo run, so home + Blind Rank can offer
  // the unified challenge without a run in progress.
  const [lastChallenge, setLastChallenge] = useState<LastChallenge | null>(() => getLastChallenge());
  const [homeShareCopied, setHomeShareCopied] = useState(false);
  // Head-to-head: an opponent XV we're playing against, the match result, and a
  // nonce so "Rematch" produces a fresh 80 minutes.
  const [incomingMatch, setIncomingMatch] = useState<MatchChallenge | null>(null);
  const [opponentLineup, setOpponentLineup] = useState<Lineup | null>(null);
  // An unfinished challenge from a previous visit (they opened a link but never
  // played) — surfaced as a resume nudge on the home screen.
  const [pendingMatch, setPendingMatch] = useState<MatchChallenge | null>(null);
  // Whether the current draft was auto-filled via Quick Play, so the complete
  // panel can tailor its copy ("tap to swap" vs "your XV is set").
  const [quickDrafted, setQuickDrafted] = useState(false);
  const [matchResult, setMatchResult] = useState<H2HResult | null>(null);
  const [matchNonce, setMatchNonce] = useState(0);
  // Labels + exact seed of the current match, so a rematch keeps the same teams
  // and a result link replays the identical 80 minutes for the other player.
  const [matchLabels, setMatchLabels] = useState<{ home: string; away: string }>({
    home: "Your XV",
    away: "The Challenger's XV",
  });
  const [matchSeedStr, setMatchSeedStr] = useState("");
  const [matchLinkCopied, setMatchLinkCopied] = useState(false);
  const [streak, setStreak] = useState(() => streakStatus());
  const [career, setCareer] = useState<Career>(() => getCareer());
  const [playerName, setPlayerName] = useState<string>(() => getName());
  // When we need the player's name and don't have one, we stash the follow-up
  // action here and show a modal; the modal resolves it.
  const [namePrompt, setNamePrompt] = useState<null | { run: (name: string) => void }>(null);
  const animRef = useRef<number | null>(null);
  const lastSquadIdRef = useRef<string | null>(null);

  const remaining = openSlots(lineup);
  const isComplete = remaining.length === 0;
  const filled = 15 - remaining.length;
  const proj = useMemo(() => computeFacets(lineup), [lineup]);

  useEffect(() => {
    initAnalytics();
    // The unified combined challenge (?x=) takes priority: it carries both a
    // solo draft AND an opponent XV, and the recipient chooses which to play.
    const x = readIncomingCombined();
    if (x) {
      setIncomingCombined(x);
      if (x.diff in DIFFICULTY) setDifficulty(x.diff as Diff);
      if (x.era in ERA) setEra(x.era as Era);
      if (x.rating in RATING) setRatingMode(x.rating as RatingMode);
      // Persist the match half so a bounce can be resumed like the ?m= flow.
      const m = matchFromCombined(x);
      if (m) savePendingMatch(m);
      track("combined_challenge_opened", {
        overall: x.overall,
        score: x.score,
        champion: x.champion,
        has_lineup: !!m,
      });
      return;
    }
    // A result link replays an exact match the other player already simulated.
    const mr = readIncomingMatchResult();
    if (mr) {
      const pair = lineupsFromMatchSeed(mr.seed, mr.rating);
      if (pair) {
        if (mr.rating in RATING) setRatingMode(mr.rating as RatingMode);
        const labels = { home: mr.hl, away: mr.al };
        const r = simH2H(pair.home, pair.away, labels, mr.seed);
        setLineup(pair.home);
        setOpponentLineup(pair.away);
        setMatchLabels(labels);
        setMatchSeedStr(mr.seed);
        setMatchNonce(pair.nonce);
        setMatchResult(r);
        track("match_result_opened", { home_won: r.homeWon });
        setPhase("matchsim");
        return;
      }
    }

    const m = readIncomingMatch();
    if (m) {
      const opp = lineupFromMatch(m);
      if (opp) {
        setIncomingMatch(m);
        setOpponentLineup(opp);
        // Persist so a bounce here can be resumed on the next visit — this is
        // the funnel's biggest leak.
        savePendingMatch(m);
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
      return;
    }
    // No fresh link: if a previous challenge was opened but never finished,
    // surface it so the player can pick it right back up.
    const pending = getPendingMatch();
    if (pending && lineupFromMatch(pending)) {
      setPendingMatch(pending);
      track("match_resume_shown", { opponent_overall: pending.overall });
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

  // Accept a head-to-head challenge, either by hand-drafting ("draft") or by
  // auto-filling a legal XV instantly ("quick"). Both replay the challenger's
  // era/rating so the two XVs are built from a comparable pool.
  const beginMatchAccept = useCallback(
    (m: MatchChallenge, mode: "quick" | "draft") => {
      const opp = lineupFromMatch(m);
      if (!opp) return;
      const useDiff = (m.diff in DIFFICULTY ? m.diff : difficulty) as Diff;
      const useEra = (m.era in ERA ? m.era : era) as Era;
      const useRating = (m.rating in RATING ? m.rating : ratingMode) as RatingMode;
      const cfg = DIFFICULTY[useDiff];
      const s = randomSeed();

      setDifficulty(useDiff);
      setEra(useEra);
      setRatingMode(useRating);
      setIncomingMatch(m);
      setOpponentLineup(opp);
      setPendingMatch(null);
      savePendingMatch(m);
      setActiveChallenge(null);

      startRunContext({ difficulty: useDiff, era: useEra, rating_mode: useRating });
      track("run_started", { mode: "match", seed: s });
      track("match_accept_path", { path: mode, opponent_overall: m.overall });

      setSeed(s);
      setSpins(buildSpinSequence(s, 60, ERA[useEra].minYear, useRating));
      setSpinIndex(0);
      setCurrentSquad(null);
      lastSquadIdRef.current = null;
      setSelectedPlayer(null);
      setMovingSlot(null);
      setSpinning(false);
      setRespinsLeft(cfg.respins);
      setHideRatings(cfg.hideRatings);
      setResult(null);

      if (mode === "quick") {
        // Deterministic per challenge, so the auto XV (and the match it plays)
        // is reproducible for this exact opponent.
        const auto = autoDraftLineup({
          minYear: ERA[useEra].minYear,
          rating: useRating,
          seed: "quick:" + m.ids.join(",") + ":" + useRating + ":" + useEra,
        });
        setLineup(auto);
        setPickedKeys(new Set(Object.values(auto).map((p) => playerKey(p!))));
        setQuickDrafted(true);
        track("match_quickplay_used", {
          overall: Math.round(computeFacets(auto).overall),
          opponent_overall: m.overall,
        });
      } else {
        setLineup({});
        setPickedKeys(new Set());
        setQuickDrafted(false);
      }
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
    setCareer(recordRun({ champion: r.champion, perfect35: r.perfect35, score: r.perfectScore }));
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
    // Stash this run so home + Blind Rank can offer a unified challenge later.
    saveLastChallenge({
      seed,
      era,
      rating: ratingMode,
      diff: difficulty,
      score: r.perfectScore,
      verdict: r.verdict,
      champion: r.champion,
      ids: SLOTS.map((s) => lineup[s.id]?.id ?? ""),
      overall: Math.round(r.overall),
    });
    setLastChallenge(getLastChallenge());
    setPhase("sim");
  }, [lineup, seed, era, ratingMode, difficulty]);

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

  // Run `cb` with the player's name, prompting for it once if we don't have it.
  const ensureName = useCallback((cb: (name: string) => void) => {
    const existing = getName();
    if (existing) {
      cb(existing);
      return;
    }
    setNamePrompt({
      run: (name: string) => {
        const clean = name.trim();
        if (clean) {
          setName(clean);
          setPlayerName(clean);
        }
        setNamePrompt(null);
        cb(clean);
      },
    });
  }, []);

  // Simulate one match between two XVs and jump into the live playback. Labels
  // and seed are stashed so rematches keep the same teams and result links
  // reproduce this exact match.
  const playMatch = useCallback(
    (
      homeL: Lineup,
      awayL: Lineup,
      labels: { home: string; away: string },
      nonce: number,
      opts?: { record?: boolean; oppOverall?: number },
    ) => {
      const seed = matchSeed(homeL, awayL, nonce);
      const r = simH2H(homeL, awayL, labels, seed);
      if (opts?.record) setStreak(streakStatus(recordPlay()));
      setCareer(recordMatch(r.homeWon, r.draw));
      track("match_played", {
        home_won: r.homeWon,
        home_points: r.home.points,
        away_points: r.away.points,
        overall: r.home.overall,
        opponent_overall: opts?.oppOverall ?? r.away.overall,
        rematch: nonce > 0,
      });
      setLineup(homeL);
      setOpponentLineup(awayL);
      setMatchLabels(labels);
      setMatchSeedStr(seed);
      setMatchResult(r);
      setMatchNonce(nonce);
      setPhase("matchsim");
    },
    [matchSeed],
  );

  const kickOffMatch = useCallback(() => {
    if (!opponentLineup) return;
    ensureName((name) => {
      // The challenge is now consumed — no need to nudge a resume anymore.
      clearPendingMatch();
      playMatch(
        lineup,
        opponentLineup,
        {
          home: teamLabel(name, "Your XV"),
          away: teamLabel(incomingMatch?.name, "The Challenger's XV"),
        },
        0,
        { record: true, oppOverall: incomingMatch?.overall },
      );
    });
  }, [opponentLineup, incomingMatch, lineup, ensureName, playMatch]);

  // Same two teams, fresh 80 minutes — keeps the existing labels.
  const rematch = useCallback(() => {
    if (!opponentLineup) return;
    playMatch(lineup, opponentLineup, matchLabels, matchNonce + 1);
  }, [opponentLineup, lineup, matchLabels, matchNonce, playMatch]);

  const buildMatchChallenge = useCallback(
    (name = playerName): MatchChallenge => ({
      ids: SLOTS.map((s) => lineup[s.id]?.id ?? ""),
      rating: ratingMode,
      era,
      diff: difficulty,
      name: name.trim() || "A friend",
      overall: proj.overall,
    }),
    [lineup, ratingMode, era, difficulty, proj.overall, playerName],
  );

  // Ensure we have a name, then produce the head-to-head challenge link.
  const prepareMatchLink = useCallback(
    (): Promise<string> =>
      new Promise((resolve) => {
        ensureName((name) => resolve(matchLink(buildMatchChallenge(name))));
      }),
    [ensureName, buildMatchChallenge],
  );

  // Link that replays the current match for the other player (no draft needed).
  const prepareResultLink = useCallback(
    (): Promise<string> =>
      Promise.resolve(
        matchResultLink({
          seed: matchSeedStr,
          hl: matchLabels.home,
          al: matchLabels.away,
          rating: ratingMode,
        }),
      ),
    [matchSeedStr, matchLabels, ratingMode],
  );

  const shareMatchChallenge = useCallback(async () => {
    const url = await prepareMatchLink();
    const line = `I drafted an XV on XV 🏉 — draft your own and let's settle it over 80 minutes.`;
    track("match_challenge_created", { overall: Math.round(proj.overall) });
    const res = await shareOrCopy({ title: "XV — face my XV", text: line, url });
    setCareer(recordChallengeSent());
    if (res === "copied") {
      setMatchLinkCopied(true);
      setTimeout(() => setMatchLinkCopied(false), 2000);
    }
  }, [prepareMatchLink, proj.overall]);

  // Unified "Challenge a friend" link from the RESULTS screen: carries the solo
  // draft + score AND the challenger's XV, so one link serves both reply modes.
  const prepareCombinedLink = useCallback(
    (): Promise<string> =>
      new Promise((resolve) => {
        ensureName((name) => {
          resolve(
            combinedLink({
              seed,
              era,
              rating: ratingMode,
              diff: difficulty,
              score: result?.perfectScore ?? 0,
              verdict: result?.verdict ?? "",
              champion: result?.champion ?? false,
              ids: SLOTS.map((s) => lineup[s.id]?.id ?? ""),
              name: name.trim() || "A friend",
              overall: Math.round(result?.overall ?? proj.overall),
            }),
          );
        });
      }),
    [ensureName, seed, era, ratingMode, difficulty, result, lineup, proj.overall],
  );

  // Same unified link from the MATCH REPORT: there's no solo /35 here, so the
  // recipient's "beat their score" path becomes a same-settings solo run.
  const prepareCombinedMatchLink = useCallback(
    (): Promise<string> =>
      new Promise((resolve) => {
        ensureName((name) => {
          resolve(
            combinedLink({
              seed: seed || randomSeed(),
              era,
              rating: ratingMode,
              diff: difficulty,
              score: 0,
              verdict: "",
              champion: false,
              ids: SLOTS.map((s) => lineup[s.id]?.id ?? ""),
              name: name.trim() || "A friend",
              overall: Math.round(proj.overall),
            }),
          );
        });
      }),
    [ensureName, seed, era, ratingMode, difficulty, lineup, proj.overall],
  );

  // Unified link built from the last completed solo run — used where no run is
  // in progress (home screen, Blind Rank result). Resolves null if never played.
  const prepareLastChallengeLink = useCallback(
    (): Promise<string | null> =>
      new Promise((resolve) => {
        const last = getLastChallenge();
        if (!last) {
          resolve(null);
          return;
        }
        ensureName((name) => {
          resolve(combinedLink({ ...last, name: name.trim() || "A friend" }));
        });
      }),
    [ensureName],
  );

  const shareChallengeFromHome = useCallback(async () => {
    const last = getLastChallenge();
    const url = await prepareLastChallengeLink();
    if (!url) return;
    const line = last?.champion
      ? `I won the Rugby World Cup on XV 🏉 — beat my score or take on my XV.`
      : `I built an XV on XV 🏉 — beat my ${last?.score ?? 0}/35 or take on my team.`;
    track("combined_challenge_created", {
      from: "home",
      has_score: (last?.score ?? 0) > 0,
      overall: last?.overall ?? 0,
    });
    const res = await shareOrCopy({ title: "XV — challenge a friend", text: line, url });
    setCareer(recordChallengeSent());
    if (res === "copied") {
      setHomeShareCopied(true);
      setTimeout(() => setHomeShareCopied(false), 2000);
    }
  }, [prepareLastChallengeLink]);

  // Recipient of a combined link chose a reply mode.
  const acceptCombinedScore = useCallback(
    (c: CombinedChallenge) => {
      track("combined_choice", { choice: "score" });
      startRun({ accept: challengeFromCombined(c) });
    },
    [startRun],
  );
  const acceptCombinedMatch = useCallback(
    (c: CombinedChallenge, mode: "quick" | "draft") => {
      const m = matchFromCombined(c);
      if (!m) return;
      track("combined_choice", { choice: "match", path: mode });
      beginMatchAccept(m, mode);
    },
    [beginMatchAccept],
  );

  // ---------- RENDER ----------
  const nameModal = namePrompt ? (
    <NamePrompt onSave={(n) => namePrompt.run(n)} onSkip={() => namePrompt.run("")} />
  ) : null;

  if (phase === "home") {
    return (
      <>
      <EcosystemMenu current="draft" />
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
          {careerChips(career).length > 0 && (
            <div className="career-strip">
              {careerChips(career).map((chip) => (
                <div className="career-chip" key={chip.label}>
                  <b>{chip.value}</b>
                  <span>{chip.label}</span>
                </div>
              ))}
            </div>
          )}
          {career.runs > 0 &&
            !incomingCombined &&
            !incomingMatch &&
            !incomingChallenge &&
            !pendingMatch && (
            <p className="home-nudge">
              {career.perfect35s > 0
                ? "You've done the impossible. Can you do it again?"
                : career.champions > 0
                  ? `Best so far: ${career.bestScore}/35. The Perfect 35 is still out there — go get it.`
                  : career.bestScore > 0
                    ? `Your best is ${career.bestScore}/35. One better today?`
                    : "A trophy is waiting. Draft your XV."}
            </p>
          )}
          {incomingCombined && (
            <div className="challenge-banner combined">
              <div className="cb-kicker">🏉 {incomingCombined.name.toUpperCase()} CHALLENGED YOU</div>
              <div className="cb-detail">
                Their XV rated <b>{incomingCombined.overall}</b>
                {incomingCombined.score > 0 ? (
                  <>
                    {" "}
                    and scored <b>{incomingCombined.score}/35</b>
                    {incomingCombined.champion ? " 🏆" : ""}
                  </>
                ) : null}
                . How do you want to settle it?
              </div>
              <div className="cb-choices">
                <div className="cb-choice">
                  <button
                    className="btn primary big cb-cta"
                    onClick={() => acceptCombinedScore(incomingCombined)}
                  >
                    {incomingCombined.score > 0 ? "🎯 Beat their score" : "🎯 Play the same draft"}
                  </button>
                  <div className="cb-choice-note muted">
                    {incomingCombined.score > 0
                      ? "Same squads & settings — top their total in a solo World Cup."
                      : "Same squads & settings — run your own solo World Cup."}
                  </div>
                </div>
                {matchFromCombined(incomingCombined) && (
                  <div className="cb-choice">
                    <button
                      className="btn primary big cb-cta"
                      onClick={() => acceptCombinedMatch(incomingCombined, "quick")}
                    >
                      ⚡ Play their XV — Quick Play
                    </button>
                    <button
                      className="btn ghost cb-alt"
                      onClick={() => acceptCombinedMatch(incomingCombined, "draft")}
                    >
                      …or draft my own XV first
                    </button>
                    <div className="cb-choice-note muted">
                      Head-to-head, 80 minutes. Quick Play auto-drafts you in ~1 min.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {!incomingCombined && incomingMatch && opponentLineup && (
            <div className="challenge-banner match">
              <div className="cb-kicker">⚔️ HEAD-TO-HEAD CHALLENGE</div>
              <div className="cb-versus">
                <span className="cb-vs-name">{incomingMatch.name}</span>
                <span className="cb-vs-rating" title="Their XV rating">
                  {incomingMatch.overall}
                </span>
              </div>
              <div className="cb-detail">
                {incomingMatch.name} drafted an XV and called you out.{" "}
                {matchTaunt(incomingMatch.overall)}
              </div>
              <button
                className="btn primary big cb-cta"
                onClick={() => beginMatchAccept(incomingMatch, "quick")}
              >
                ⚡ Quick Play — I'm in
              </button>
              <button
                className="btn ghost cb-alt"
                onClick={() => beginMatchAccept(incomingMatch, "draft")}
              >
                Draft my own XV instead
              </button>
              <div className="cb-note muted">
                Quick Play auto-drafts you a strong XV — tweak it or kick straight
                off. About a minute either way.
              </div>
            </div>
          )}
          {!incomingCombined && !incomingMatch && !incomingChallenge && pendingMatch && (
            <div className="challenge-banner match resume">
              <div className="cb-kicker">⏳ UNFINISHED CHALLENGE</div>
              <div className="cb-detail">
                You never faced <b>{pendingMatch.name}</b>'s XV (rated{" "}
                <b>{pendingMatch.overall}</b>). Settle it now — takes about a
                minute.
              </div>
              <button
                className="btn primary big cb-cta"
                onClick={() => beginMatchAccept(pendingMatch, "quick")}
              >
                ⚡ Quick Play vs {pendingMatch.name}
              </button>
              <button
                className="btn ghost cb-alt"
                onClick={() => beginMatchAccept(pendingMatch, "draft")}
              >
                Draft my own XV
              </button>
              <button
                className="btn tiny ghost cb-dismiss"
                onClick={() => {
                  clearPendingMatch();
                  setPendingMatch(null);
                  track("match_resume_dismissed", {});
                }}
              >
                Not now
              </button>
            </div>
          )}
          {!incomingCombined && !incomingMatch && incomingChallenge && (
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
          {lastChallenge && (
            <div className="home-challenge">
              <button className="btn gold big" onClick={shareChallengeFromHome}>
                {homeShareCopied ? "Link copied — now send it!" : "🏉 Challenge a friend"}
              </button>
              <p className="muted home-challenge-note">
                Sends your last XV{lastChallenge.score > 0 ? ` (scored ${lastChallenge.score}/35)` : ""} —
                your mate picks: beat your score, or play your XV head-to-head.
              </p>
            </div>
          )}
          <div className="home-daily-games">
            <span className="home-daily-label">Daily games</span>
            <button
              className="btn ghost big brank-cta"
              onClick={() => {
                track("home_cta_clicked", { cta: "blindrank" });
                setPhase("blindrank");
              }}
            >
              🧠 Blind Rank — today's puzzle
            </button>
          </div>
          <p className="muted home-daily-note">
            Daily Challenge = the same draft for everyone today (fixed settings:
            all-time · seasonal · medium). Blind Rank = rank 8 mystery legends
            best-to-worst. Both refresh daily — compare with friends.
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
      {nameModal}
      </>
    );
  }

  if (phase === "blindrank") {
    return (
      <>
        <BlindRank
          onHome={() => setPhase("home")}
          onPlayed={() => setStreak(streakStatus())}
          prepareChallengeLink={lastChallenge ? prepareLastChallengeLink : null}
          onChallengeSent={() => setCareer(recordChallengeSent())}
        />
        {nameModal}
      </>
    );
  }

  if (phase === "sim" && result) {
    return <SimPlayback result={result} onDone={() => setPhase("result")} />;
  }

  if (phase === "result" && result) {
    return (
      <>
      <Result
        result={result}
        lineup={lineup}
        challenge={activeChallenge}
        prepareCombinedLink={prepareCombinedLink}
        streakNote={
          streak.status === "kept" && streak.current > 0
            ? `🔥 ${streak.current}-day streak — come back tomorrow to make it ${streak.current + 1}.`
            : undefined
        }
        onPlayAgain={() => startRun({ daily: seed.startsWith("daily") })}
      />
      {nameModal}
      </>
    );
  }

  if (phase === "matchsim" && matchResult) {
    return <MatchPlayback result={matchResult} onDone={() => setPhase("match")} />;
  }

  if (phase === "match" && matchResult) {
    return (
      <>
      <MatchReport
        result={matchResult}
        homeLineup={lineup}
        record={h2hRecord(career)}
        prepareCombinedLink={prepareCombinedMatchLink}
        prepareResultLink={prepareResultLink}
        onChallengeSent={() => setCareer(recordChallengeSent())}
        onRematch={rematch}
        onNewRun={() => {
          clearPendingMatch();
          setIncomingCombined(null);
          setIncomingMatch(null);
          setOpponentLineup(null);
          setMatchResult(null);
          setPhase("home");
        }}
      />
      {nameModal}
      </>
    );
  }

  // DRAFT
  return (
    <>
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
          {opponentLineup && !isComplete && (
            <div className="match-draft-note">
              <span className="mdn-dot" />
              {remaining.length === 1
                ? `Last pick — then you face ${incomingMatch?.name ?? "your challenger"}.`
                : `${remaining.length} more picks, then you face ${incomingMatch?.name ?? "your challenger"}.`}
            </div>
          )}
          {isComplete ? (
            opponentLineup ? (
              <div className="complete">
                <h2>{quickDrafted ? "Your XV is ready." : "Your XV is set."}</h2>
                <p className="muted">
                  {quickDrafted
                    ? "Auto-drafted a strong XV — tap any two players on the pitch to swap them, or kick straight off. "
                    : ""}
                  Time to face {incomingMatch?.name ?? "your challenger"}'s XV
                  {incomingMatch ? ` (rated ${incomingMatch.overall})` : ""}.
                </p>
                <button className="btn primary big" onClick={() => kickOffMatch()}>
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
                  {matchLinkCopied ? "Link copied — now send it!" : "⚔️ Challenge a friend to a match"}
                </button>
                {matchLinkCopied && (
                  <div className="loop-note">
                    <b>How it works:</b> your mate opens the link, drafts their own XV
                    and plays your match. They'll get a one-tap button to send the
                    result back so <b>you both watch the same 80 minutes</b>. Kick off
                    your own World Cup while you wait 👇
                  </div>
                )}
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
    {nameModal}
    </>
  );
}
