import { useCallback, useMemo, useRef, useState } from "react";
import "./index.css";
import type { Lineup, Player, SlotId, Squad, TournamentResult } from "./types";
import { positionLabel } from "./data/slots";
import { SQUADS } from "./data/squads";
import {
  applyMove,
  buildSpinSequence,
  eligibleOpenSlots,
  isPickable,
  moveTargets,
  openSlots,
  squadHasPick,
} from "./engine/draft";
import { computeFacets } from "./engine/ratings";
import { simulate } from "./engine/sim";
import { Pitch } from "./components/Pitch";
import { Result } from "./components/Result";
import { SimPlayback } from "./components/SimPlayback";
import { Footer } from "./components/Footer";

type Phase = "home" | "draft" | "sim" | "result";

const DIFFICULTY = {
  easy: { label: "Easy", respins: 5, hideRatings: false, blurb: "5 re-spins · ratings shown" },
  medium: { label: "Medium", respins: 3, hideRatings: false, blurb: "3 re-spins · ratings shown" },
  hard: { label: "Difficult", respins: 1, hideRatings: true, blurb: "1 re-spin · ratings hidden" },
} as const;
type Diff = keyof typeof DIFFICULTY;

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
  const [pickedIds, setPickedIds] = useState<Set<string>>(new Set());
  const [currentSquad, setCurrentSquad] = useState<Squad | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinLabel, setSpinLabel] = useState<Squad | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [movingSlot, setMovingSlot] = useState<SlotId | null>(null);
  const [respinsLeft, setRespinsLeft] = useState(3);
  const [difficulty, setDifficulty] = useState<Diff>("medium");
  const [hideRatings, setHideRatings] = useState(false);
  const [result, setResult] = useState<TournamentResult | null>(null);
  const animRef = useRef<number | null>(null);

  const remaining = openSlots(lineup);
  const isComplete = remaining.length === 0;
  const filled = 15 - remaining.length;
  const proj = useMemo(() => computeFacets(lineup), [lineup]);

  const startRun = useCallback(
    (daily: boolean) => {
      const cfg = DIFFICULTY[difficulty];
      const s = daily ? todaySeed() : randomSeed();
      setSeed(s);
      setSpins(buildSpinSequence(s));
      setSpinIndex(0);
      setLineup({});
      setPickedIds(new Set());
      setCurrentSquad(null);
      setSelectedPlayer(null);
      setMovingSlot(null);
      setSpinning(false);
      setRespinsLeft(cfg.respins);
      setHideRatings(cfg.hideRatings);
      setResult(null);
      setPhase("draft");
    },
    [difficulty],
  );

  const landSquad = useCallback(
    (curLineup: Lineup, curPicked: Set<string>, fromIndex: number) => {
      for (let i = fromIndex; i < spins.length; i++) {
        if (squadHasPick(spins[i], curLineup, curPicked)) {
          setCurrentSquad(spins[i]);
          setSpinIndex(i + 1);
          return;
        }
      }
      // Fallback: any usable squad in the dataset.
      const any = SQUADS.find((sq) => squadHasPick(sq, curLineup, curPicked));
      setCurrentSquad(any ?? null);
    },
    [spins],
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
        landSquad(lineup, pickedIds, spinIndex);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [spinning, lineup, pickedIds, spinIndex, landSquad]);

  const assign = useCallback(
    (p: Player, slot: SlotId) => {
      const newLineup = { ...lineup, [slot]: p };
      const newPicked = new Set(pickedIds);
      newPicked.add(p.id);
      setLineup(newLineup);
      setPickedIds(newPicked);
      setCurrentSquad(null);
      setSelectedPlayer(null);
      setMovingSlot(null);
    },
    [lineup, pickedIds],
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
    setRespinsLeft((r) => r - 1);
    setCurrentSquad(null);
    doSpin();
  }, [respinsLeft, doSpin]);

  const kickOff = useCallback(() => {
    setResult(simulate(lineup, seed));
    setPhase("sim");
  }, [lineup, seed]);

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
          <div className="home-actions">
            <button className="btn primary big" onClick={() => startRun(false)}>
              Start New Run
            </button>
            <button className="btn ghost big" onClick={() => startRun(true)}>
              Play Daily
            </button>
          </div>
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
        onPlayAgain={() => startRun(seed.startsWith("daily"))}
      />
    );
  }

  // DRAFT
  return (
    <div className="draft">
      <header className="draft-head">
        <div className="logo-sm" onClick={() => setPhase("home")}>
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
            <div className="complete">
              <h2>Your XV is set.</h2>
              <p className="muted">15 legends, one shot at immortality.</p>
              <button className="btn primary big" onClick={kickOff}>
                Kick Off the World Cup →
              </button>
            </div>
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
                  .map((p) => ({ p, ok: isPickable(p, lineup, pickedIds) }))
                  .sort((a, b) =>
                    a.ok !== b.ok
                      ? Number(b.ok) - Number(a.ok)
                      : hideRatings
                        ? a.p.name.localeCompare(b.p.name)
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
                        <span className="pr-name">{p.name}</span>
                        <span className="pr-pos">
                          {pickedIds.has(p.id) ? "picked" : positionLabel(p)}
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
