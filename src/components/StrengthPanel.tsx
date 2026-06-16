import type { Facets } from "../engine/ratings";

const FACETS: [keyof Facets, string][] = [
  ["setPiece", "Set-piece"],
  ["breakdown", "Breakdown"],
  ["defence", "Defence"],
  ["attack", "Attack"],
  ["control", "Control"],
  ["goalKick", "Kicking"],
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
      : ap >= 97
        ? { label: "Genuine threat", cls: "hot" }
        : ap >= 90
          ? { label: "In the hunt", cls: "warm" }
          : ap >= 83
            ? { label: "Outside chance", cls: "cool" }
            : { label: "Long shot", cls: "cold" };

  return (
    <div className="strength-strip">
      <span className="ss-title">Squad strength</span>
      <div className="ss-facets">
        {FACETS.map(([k, label]) => {
          const v = facets[k] as number;
          return (
            <div className="sfacet" key={k} title={`${label}: ${Math.round(v)}`}>
              <div className="sf-top">
                <span className="sf-label">{label}</span>
                {!hideRatings && <span className="sf-val">{Math.round(v)}</span>}
              </div>
              <div className="sf-track">
                <div
                  className={`sf-fill ${tier(v)}`}
                  style={{ width: `${Math.max(4, Math.min(100, v))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {outlook && (
        <div
          className={`sf-outlook ${outlook.cls}`}
          title="Your chance of scoring the 4-try bonus point in tough games — the key to the Perfect 35"
        >
          <span className="sfo-label">Try-bonus</span>
          <span className="sfo-val">{outlook.label}</span>
        </div>
      )}
    </div>
  );
}
