// Protected analytics dashboard API.
//
// Reads the private Blob event store, aggregates key product metrics, and
// returns JSON for /dashboard.html. Gated by a key: pass ?key=... matching the
// STATS_KEY env var. Results are cached in-memory briefly to limit blob reads.

import { list, get } from "@vercel/blob";
import { sql } from "@vercel/postgres";

interface Ev {
  event: string;
  ts?: string;
  user_id?: string;
  session_id?: string;
  run_id?: string;
  difficulty?: string;
  era?: string;
  rating_mode?: string;
  received_at?: string;
  country?: string;
  props?: Record<string, unknown>;
}

const cache = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 60_000;

function dayOf(e: Ev): string {
  return (e.received_at || e.ts || "").slice(0, 10) || "unknown";
}

function inc(map: Record<string, number>, key: string | undefined) {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
}

async function readAllEvents(token: string): Promise<Ev[]> {
  const out: Ev[] = [];
  let cursor: string | undefined;
  let guard = 0;
  do {
    const page = await list({ token, prefix: "events/", cursor, limit: 1000 });
    for (const b of page.blobs) {
      try {
        const r = await get(b.pathname, { access: "private", token });
        const text = await new Response(r.stream as ReadableStream).text();
        for (const line of text.split("\n")) {
          if (!line.trim()) continue;
          try {
            out.push(JSON.parse(line) as Ev);
          } catch {
            /* skip bad line */
          }
        }
      } catch {
        /* skip unreadable object */
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && guard++ < 50);
  return out;
}

// Read events from Postgres (preferred sink). One indexed query instead of
// fetching every Blob object, so dashboard reads are cheap and scalable.
async function readAllEventsPg(): Promise<Ev[]> {
  const { rows } = await sql`
    select event, client_ts, received_at, user_id, session_id, run_id,
           difficulty, era, rating_mode, country, props
    from events
    order by received_at desc
    limit 500000
  `;
  return rows.map((r) => ({
    event: r.event as string,
    ts: r.client_ts ? new Date(r.client_ts as string).toISOString() : undefined,
    received_at: r.received_at
      ? new Date(r.received_at as string).toISOString()
      : undefined,
    user_id: (r.user_id as string) ?? undefined,
    session_id: (r.session_id as string) ?? undefined,
    run_id: (r.run_id as string) ?? undefined,
    difficulty: (r.difficulty as string) ?? undefined,
    era: (r.era as string) ?? undefined,
    rating_mode: (r.rating_mode as string) ?? undefined,
    country: (r.country as string) ?? undefined,
    props: (r.props as Record<string, unknown>) ?? {},
  }));
}

function aggregate(events: Ev[]) {
  const eventCounts: Record<string, number> = {};
  const users = new Set<string>();
  const userCounts: Record<string, number> = {};
  const sessions = new Set<string>();
  const byDayUsers: Record<string, Set<string>> = {};
  const byDayRuns: Record<string, number> = {};
  const userFirstSeen: Record<string, string> = {};
  const difficulty: Record<string, number> = {};
  const era: Record<string, number> = {};
  const ratingMode: Record<string, number> = {};
  const countries: Record<string, number> = {};
  const runStartUsers = new Set<string>();
  const abandonByRound: Record<string, number> = {};
  const sources: Record<string, number> = {};

  let runsStarted = 0,
    xvCompleted = 0,
    kickoffs = 0,
    runsCompleted = 0,
    champions = 0,
    perfect35 = 0,
    shares = 0,
    respins = 0,
    runsAbandoned = 0;

  const recentRuns: {
    ts: string;
    verdict: string;
    score: number;
    difficulty?: string;
    era?: string;
    rating_mode?: string;
  }[] = [];

  for (const e of events) {
    inc(eventCounts, e.event);
    if (e.user_id) { users.add(e.user_id); inc(userCounts, e.user_id); }
    if (e.session_id) sessions.add(e.session_id);
    const d = dayOf(e);
    (byDayUsers[d] ||= new Set()).add(e.user_id || e.session_id || "?");
    if (e.user_id && (!userFirstSeen[e.user_id] || d < userFirstSeen[e.user_id]))
      userFirstSeen[e.user_id] = d;

    switch (e.event) {
      case "run_started":
        runsStarted++;
        byDayRuns[d] = (byDayRuns[d] || 0) + 1;
        if (e.user_id) runStartUsers.add(e.user_id);
        inc(difficulty, e.difficulty);
        inc(era, e.era);
        inc(ratingMode, e.rating_mode);
        break;
      case "run_abandoned": {
        runsAbandoned++;
        const round = Number((e.props || {}).round);
        // Bucket by the slot they had reached when they quit (1..15).
        inc(abandonByRound, Number.isFinite(round) ? `Slot ${round}` : "unknown");
        break;
      }
      case "app_opened": {
        // Acquisition source: utm_source if present, else referrer host, else direct.
        const p = e.props || {};
        const utm = (p.utm || {}) as Record<string, string>;
        let src = utm.utm_source;
        if (!src) {
          const ref = p.referrer ? String(p.referrer) : "";
          if (!ref) src = "direct";
          else {
            try {
              src = new URL(ref).hostname.replace(/^www\./, "");
            } catch {
              src = "other";
            }
          }
        }
        inc(sources, src);
        break;
      }
      case "xv_completed":
        xvCompleted++;
        break;
      case "kickoff_clicked":
        kickoffs++;
        break;
      case "respin_used":
        respins++;
        break;
      case "share_clicked":
        shares++;
        break;
      case "run_completed": {
        runsCompleted++;
        const p = e.props || {};
        if (p.champion) champions++;
        if (p.perfect35) perfect35++;
        recentRuns.push({
          ts: e.received_at || e.ts || "",
          verdict: String(p.verdict ?? (p.champion ? "Champions" : "Eliminated")),
          score: Number(p.perfect_score ?? 0),
          difficulty: e.difficulty,
          era: e.era,
          rating_mode: e.rating_mode,
        });
        break;
      }
    }
    if (e.country) inc(countries, e.country);
  }

  const newByDay: Record<string, number> = {};
  for (const uid in userFirstSeen) inc(newByDay, userFirstSeen[uid]);

  const dailyActive = Object.entries(byDayUsers)
    .map(([day, set]) => ({
      day,
      users: set.size,
      runs: byDayRuns[day] || 0,
      newUsers: newByDay[day] || 0,
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
  // Running totals for the "over time" growth view.
  let cumU = 0;
  let cumR = 0;
  const cumulative = dailyActive.map((d) => {
    cumU += d.newUsers;
    cumR += d.runs;
    return { day: d.day, players: cumU, runs: cumR };
  });

  recentRuns.sort((a, b) => b.ts.localeCompare(a.ts));

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      events: events.length,
      users: users.size,
      sessions: sessions.size,
      runsStarted,
      xvCompleted,
      kickoffs,
      runsCompleted,
      champions,
      perfect35,
      shares,
      respins,
      runsAbandoned,
    },
    rates: {
      draftCompletion: runsStarted ? +(xvCompleted / runsStarted).toFixed(3) : 0,
      runCompletion: runsStarted ? +(runsCompleted / runsStarted).toFixed(3) : 0,
      winRate: runsCompleted ? +(champions / runsCompleted).toFixed(3) : 0,
      shareRate: runsCompleted ? +(shares / runsCompleted).toFixed(3) : 0,
    },
    funnel: [
      { step: "Run started", count: runsStarted },
      { step: "XV completed", count: xvCompleted },
      { step: "Kicked off", count: kickoffs },
      { step: "Run completed", count: runsCompleted },
    ],
    dailyActive,
    cumulative,
    breakdowns: { difficulty, era, ratingMode },
    abandonByRound,
    sources,
    eventCounts,
    countries,
    userIds: Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, events]) => ({ id, events })),
    recentRuns: recentRuns.slice(0, 25),
  };
}

export default async function handler(
  req: { method?: string; url?: string; headers: Record<string, string | string[] | undefined> },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  const expected = process.env.STATS_KEY;
  if (!expected) {
    res.status(503).json({ error: "stats_key_not_configured" });
    return;
  }
  const url = new URL(req.url || "", "http://localhost");
  const key = url.searchParams.get("key");
  if (key !== expected) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const hasPg = Boolean(process.env.POSTGRES_URL);
  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  if (!hasPg && !hasBlob) {
    res.status(503).json({ error: "no_store" });
    return;
  }

  // User IDs to drop (your own test traffic). Sources: ?exclude=a,b plus the
  // EXCLUDE_USER_IDS env var, so it works whether set per-request or globally.
  const excluded = new Set(
    [
      ...(url.searchParams.get("exclude") || "").split(","),
      ...(process.env.EXCLUDE_USER_IDS || "").split(","),
    ]
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const cacheKey = (hasPg ? "pg:" : "blob:") + ([...excluded].sort().join("|") || "all");

  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) {
    res.status(200).json(hit.data);
    return;
  }
  try {
    let events = hasPg
      ? await readAllEventsPg()
      : await readAllEvents(process.env.BLOB_READ_WRITE_TOKEN as string);
    if (excluded.size)
      events = events.filter((e) => !e.user_id || !excluded.has(e.user_id));
    const data = aggregate(events) as Record<string, unknown>;
    data.excludedUsers = excluded.size;
    data.source = hasPg ? "postgres" : "blob";
    cache.set(cacheKey, { at: Date.now(), data });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "aggregate_failed", detail: String(err) });
  }
}
