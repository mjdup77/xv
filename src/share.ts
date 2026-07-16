// Share a link, preferring the native share sheet ONLY on touch devices
// (where it surfaces WhatsApp, Messages, etc.). On desktop the native sheet
// is just AirDrop/Mail, so we copy the link to the clipboard instead — users
// can paste it straight into WhatsApp or wherever they like.
export type ShareResult = "shared" | "copied" | "failed";

function isTouchDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) return true;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(pointer: coarse)").matches;
  }
  return false;
}

export async function shareOrCopy(opts: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareResult> {
  const { title, text, url } = opts;
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  if (canNativeShare && isTouchDevice()) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch {
      // User dismissed, or it failed — fall through to copy.
    }
  }

  try {
    await navigator.clipboard?.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
