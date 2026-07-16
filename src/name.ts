// The player's display name, used to label their XV in head-to-head matches
// and challenge links (e.g. "MJ's XV"). Stored locally so we only ask once.
const KEY = "xv_name";

export function getName(): string {
  try {
    return (localStorage.getItem(KEY) || "").trim();
  } catch {
    return "";
  }
}

export function setName(name: string): void {
  const clean = name.trim().slice(0, 24);
  try {
    if (clean) localStorage.setItem(KEY, clean);
  } catch {
    /* storage unavailable */
  }
}

// Turn a name into a team label: "MJ" -> "MJ's XV". Falls back when empty.
export function teamLabel(name: string | undefined, fallback = "Your XV"): string {
  const n = (name ?? "").trim();
  return n ? `${n}'s XV` : fallback;
}
