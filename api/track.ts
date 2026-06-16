// First-party event sink. Writes to your own Vercel Postgres when connected,
// and safely no-ops (still returns 200) until then — so the client never breaks.
//
// To enable persistence: in the Vercel dashboard for this project, open
// Storage -> Create Database -> Postgres. That injects POSTGRES_URL and events
// start landing in the `events` table below. Analyse later with plain SQL.

import { sql } from "@vercel/postgres";

interface IncomingEvent {
  event: string;
  ts?: string;
  user_id?: string;
  session_id?: string;
  run_id?: string | null;
  difficulty?: string;
  era?: string;
  rating_mode?: string;
  props?: Record<string, unknown>;
}

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  await sql`
    create table if not exists events (
      id           bigserial primary key,
      received_at  timestamptz not null default now(),
      client_ts    timestamptz,
      user_id      text,
      session_id   text,
      run_id       text,
      event        text not null,
      difficulty   text,
      era          text,
      rating_mode  text,
      country      text,
      props        jsonb
    )
  `;
  await sql`create index if not exists events_event_idx on events (event)`;
  await sql`create index if not exists events_user_idx on events (user_id)`;
  await sql`create index if not exists events_run_idx on events (run_id)`;
  await sql`create index if not exists events_time_idx on events (received_at)`;
  schemaReady = true;
}

export default async function handler(
  req: { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
    setHeader: (k: string, v: string) => void;
  },
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  // No database configured yet: accept silently so the client keeps working.
  if (!process.env.POSTGRES_URL) {
    res.status(200).json({ ok: true, stored: 0, note: "no_db" });
    return;
  }

  try {
    const raw =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    const events: IncomingEvent[] = Array.isArray(
      (raw as { events?: unknown }).events,
    )
      ? ((raw as { events: IncomingEvent[] }).events)
      : [];
    if (events.length === 0) {
      res.status(200).json({ ok: true, stored: 0 });
      return;
    }

    await ensureSchema();

    const country =
      (req.headers["x-vercel-ip-country"] as string | undefined) ?? null;

    let stored = 0;
    for (const e of events.slice(0, 100)) {
      if (!e || typeof e.event !== "string") continue;
      await sql`
        insert into events
          (client_ts, user_id, session_id, run_id, event, difficulty, era, rating_mode, country, props)
        values
          (${e.ts ?? null}, ${e.user_id ?? null}, ${e.session_id ?? null},
           ${e.run_id ?? null}, ${e.event}, ${e.difficulty ?? null},
           ${e.era ?? null}, ${e.rating_mode ?? null}, ${country},
           ${JSON.stringify(e.props ?? {})})
      `;
      stored++;
    }
    res.status(200).json({ ok: true, stored });
  } catch {
    // Never surface storage errors to the client.
    res.status(200).json({ ok: false });
  }
}
