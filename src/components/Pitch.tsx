import type { Lineup, SlotId } from "../types";
import { SLOTS, versatilityTag } from "../data/slots";

interface Props {
  lineup: Lineup;
  highlight?: SlotId[];
  movingSlot?: SlotId | null;
  hideRatings?: boolean;
  onSlotClick?: (slot: SlotId) => void;
}

// Surname only, keeping lowercase particles (e.g. "van der Westhuizen", "du Randt").
function surname(name: string): string {
  const parts = name.split(" ");
  return parts.length > 1 ? parts.slice(1).join(" ") : name;
}

export function Pitch({ lineup, highlight = [], movingSlot, hideRatings, onSlotClick }: Props) {
  const hi = new Set(highlight);
  return (
    <div className={`pitch ${onSlotClick ? "interactive" : ""}`}>
      <div className="pitch-lines" aria-hidden />
      {SLOTS.map((s) => {
        const p = lineup[s.id];
        const isHi = hi.has(s.id);
        const isMoving = movingSlot === s.id;
        return (
          <button
            key={s.id}
            className={`slot ${p ? "filled" : "empty"} ${isHi ? "hi" : ""} ${isMoving ? "moving" : ""}`}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            onClick={() => onSlotClick?.(s.id)}
            title={s.label}
          >
            <span className="slot-num">{s.number}</span>
            {p ? (
              <>
                {versatilityTag(p) && (
                  <span className="slot-versatile">{versatilityTag(p)}</span>
                )}
                <span className="slot-name">{surname(p.name)}</span>
                <span className="slot-meta">
                  {!hideRatings && <span className="slot-ovr">{p.ovr}</span>}
                  <span className="slot-year">{p.year}</span>
                </span>
              </>
            ) : (
              <span className="slot-pos">{s.id}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
