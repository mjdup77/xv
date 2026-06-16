import type { Facets } from "../engine/ratings";

const FACETS: [keyof Facets, string][] = [
  ["setPiece", "Set-piece"],
  ["breakdown", "Breakdown"],
  ["defence", "Defence"],
  ["attack", "Attack"],
  ["control", "Control"],
  ["goalKick", "Goal-kicking"],
];

function tier(v: number): string {
  if (v >= 90) return "elite";
  if (v >= 85) return "strong";
  if (v >= 78) return "ok";
  return "weak";
}

export function StrengthPanel({
  facets,
  hideRatings,
  filled,
}: {
  facets: Facets;
  hideRatings: boolean;
  filled: number;
}) {
  // Attacking output drives the 4-try bonus (mirrors the sim's attack power).
  const ap =
    facets.attack * 0.5 +
    facets.control * 0.2 +
    facets.setPiece * 0.15 +
    facets.goalKick * 0.15 +
    6;

  const outlook =
    filled < 8
      ? null
      : ap >= 95
        ? { label: "Genuine threat", cls: "hot" }
        : ap >= 88
          ? { label: "In the hunt", cls: "warm" }
          : ap >= 80
            ? { label: "Outside chance", cls: "cool" }
            : { label: "Long shot", cls: "cold" };

  return (
    <div className="strength">
      <div className="strength-head">
        <span>Squad Strength</span>
        {outlook && (
          <span
            className={`bp-outlook ${outlook.cls}`}
            title="How likely you are to score the 4-try bonus point in tough games"
          >
            Try-bonus: {outlook.label}
          </span>
        )}
      </div>
      <div className="strength-bars">
        {FACETS.map(([k, label]) => {
          const v = facets[k] as number;
          return (
            <div className="sbar" key={k}>
              <span className="sbar-label">{label}</span>
              <div className="sbar-track">
                <div
                  className={`sbar-fill ${tier(v)}`}
                  style={{ width: `${Math.max(3, Math.min(100, v))}%` }}
                />
              </div>
              <span className="sbar-val">{hideRatings ? "" : Math.round(v)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
