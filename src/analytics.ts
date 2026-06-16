// First-party, vendor-neutral analytics.
//
// Captures clean, structured events and:
//   1. mirrors them to localStorage (capped) so they can be exported as
//      JSON/CSV for ad-hoc analysis with zero infrastructure, and
//   2. batches them to /api/track, which persists to your own Postgres when a
//      database is connected (and safely no-ops until then).
//
// No third-party SDKs, no PII. Anonymous ids only.

type Props = Record<string, unknown>;

export interface XVEvent {
  event: string;
  ts: string; // ISO client timestamp
  user_id: string;
  session_id: string;
  run_id: string | null;
  difficulty?: string;
  era?: string;
  rating_mode?: string;
  props: Props;
}

const LS_UID = "xv_uid";
const LS_FIRST = "xv_first_seen";
const LS_RUNS = "xv_run_count";
const LS_MIRROR = "xv_events";
const MIRROR_CAP = 2000;
const BATCH_MAX = 20;
const FLUSH_MS = 4000;
const ENDPOINT = "/api/track";

function uuid(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage unavailable (private mode etc.) — events still POST */
  }
}

let sessionId = uuid();
let runId: string | null = null;
let context: { difficulty?: string; era?: string; rating_mode?: string } = {};
let started = false;
let queue: XVEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function userId(): string {
  let id = lsGet(LS_UID);
  if (!id) {
    id = uuid();
    lsSet(LS_UID, id);
  }
  return id;
}

function mirror(e: XVEvent) {
  try {
    const arr = JSON.parse(lsGet(LS_MIRROR) || "[]") as XVEvent[];
    arr.push(e);
    if (arr.length > MIRROR_CAP) arr.splice(0, arr.length - MIRROR_CAP);
    lsSet(LS_MIRROR, JSON.stringify(arr));
  } catch {
    /* ignore mirror failures */
  }
}

function scheduleFlush() {
  if (flushTimer != null) return;
  flushTimer = setTimeout(flush, FLUSH_MS);
}

function flush() {
  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;
  const batch = queue;
  queue = [];
  try {
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    }).catch(() => {
      /* offline / no endpoint: events remain in the localStorage mirror */
    });
  } catch {
    /* ignore */
  }
}

function utmParams(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const p = new URLSearchParams(location.search);
    for (const k of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ]) {
      const v = p.get(k);
      if (v) out[k] = v;
    }
  } catch {
    /* ignore */
  }
  return out;
}

export function track(event: string, props: Props = {}) {
  const e: XVEvent = {
    event,
    ts: new Date().toISOString(),
    user_id: userId(),
    session_id: sessionId,
    run_id: runId,
    ...context,
    props,
  };
  if (import.meta.env.DEV) console.debug("[track]", event, props);
  mirror(e);
  queue.push(e);
  if (queue.length >= BATCH_MAX) flush();
  else scheduleFlush();
}

// Begin a new run: assigns a run_id and pins the active settings as context
// onto every subsequent event. Returns the run_id.
export function startRunContext(ctx: {
  difficulty: string;
  era: string;
  rating_mode: string;
}): string {
  runId = uuid();
  context = ctx;
  const n = Number(lsGet(LS_RUNS) || "0") + 1;
  lsSet(LS_RUNS, String(n));
  return runId;
}

export function endRunContext() {
  runId = null;
}

export function initAnalytics() {
  if (started) return;
  started = true;
  const first = lsGet(LS_FIRST);
  const now = Date.now();
  let isReturning = false;
  let daysSinceFirst = 0;
  if (first) {
    isReturning = true;
    daysSinceFirst = Math.floor((now - Number(first)) / 86_400_000);
  } else {
    lsSet(LS_FIRST, String(now));
  }
  track("app_opened", {
    is_returning: isReturning,
    days_since_first_seen: daysSinceFirst,
    run_count: Number(lsGet(LS_RUNS) || "0"),
    referrer: document.referrer || null,
    utm: utmParams(),
    screen_w: window.innerWidth,
    screen_h: window.innerHeight,
    language: navigator.language,
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);

  // Console helper for ad-hoc analysis before a DB is connected:
  //   xvExport()        -> downloads JSON
  //   xvExport("csv")   -> downloads CSV
  (window as unknown as { xvExport: typeof downloadEvents }).xvExport =
    downloadEvents;
}

export function exportEvents(): XVEvent[] {
  try {
    return JSON.parse(lsGet(LS_MIRROR) || "[]") as XVEvent[];
  } catch {
    return [];
  }
}

export function downloadEvents(format: "json" | "csv" = "json") {
  const events = exportEvents();
  let blob: Blob;
  if (format === "csv") {
    const cols = [
      "ts",
      "event",
      "user_id",
      "session_id",
      "run_id",
      "difficulty",
      "era",
      "rating_mode",
      "props",
    ];
    const esc = (v: unknown) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = events.map((e) =>
      cols
        .map((c) =>
          c === "props"
            ? esc(JSON.stringify(e.props))
            : esc((e as unknown as Record<string, unknown>)[c]),
        )
        .join(","),
    );
    blob = new Blob([[cols.join(","), ...rows].join("\n")], {
      type: "text/csv",
    });
  } else {
    blob = new Blob([JSON.stringify(events, null, 2)], {
      type: "application/json",
    });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `xv-events.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}
