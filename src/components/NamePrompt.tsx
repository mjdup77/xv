import { useState } from "react";

interface Props {
  onSave: (name: string) => void;
  onSkip: () => void;
}

export function NamePrompt({ onSave, onSkip }: Props) {
  const [value, setValue] = useState("");

  const save = () => onSave(value.trim());

  return (
    <div className="modal-overlay" onClick={onSkip}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">What's your name?</h2>
        <p className="modal-sub">
          So your mate knows whose XV they're up against — e.g. “MJ's XV”.
        </p>
        <input
          className="modal-input"
          autoFocus
          maxLength={24}
          placeholder="Your name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) save();
          }}
        />
        <div className="modal-actions">
          <button className="btn primary" onClick={save} disabled={!value.trim()}>
            Save
          </button>
          <button className="btn ghost" onClick={onSkip}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
