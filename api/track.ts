// First-party event sink.
//
// Persists batched events to your own Vercel Blob store (private) as
// newline-delimited JSON — one object per batch under events/<date>/. This is
// clean to analyse later: download the objects and query with DuckDB/pandas/SQL
// (e.g. duckdb> select * from read_json_auto('events/**/*.ndjson')).
//
// If a Postgres database is connected instead (POSTGRES_URL), it writes there.
// Falls back to a safe no-op so the client never breaks.

import { put } from "@vercel/blob";
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
  req: {
    method?: string;
    body?: unknown;
    headers: Record<string, string | string[] | undefined>;
  },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
  },
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const hasPg = Boolean(process.env.POSTGRES_URL);
  if (!hasBlob && !hasPg) {
    res.status(200).json({ ok: true, stored: 0, note: "no_sink" });
    return;
  }

  try {
    const raw =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    const events: IncomingEvent[] = Array.isArray(
      (raw as { events?: unknown }).events,
    )
      ? (raw as { events: IncomingEvent[] }).events
      : [];
    const valid = events
      .slice(0, 100)
      .filter((e) => e && typeof e.event === "string");
    if (valid.length === 0) {
      res.status(200).json({ ok: true, stored: 0 });
      return;
    }

    const country =
      (req.headers["x-vercel-ip-country"] as string | undefined) ?? null;
    const receivedAt = new Date().toISOString();

    // Prefer Postgres if configured; otherwise write NDJSON to Blob.
    if (hasPg) {
      await ensureSchema();
      for (const e of valid) {
        await sql`
          insert into events
            (client_ts, user_id, session_id, run_id, event, difficulty, era, rating_mode, country, props)
          values
            (${e.ts ?? null}, ${e.user_id ?? null}, ${e.session_id ?? null},
             ${e.run_id ?? null}, ${e.event}, ${e.difficulty ?? null},
             ${e.era ?? null}, ${e.rating_mode ?? null}, ${country},
             ${JSON.stringify(e.props ?? {})})
        `;
      }
      res.status(200).json({ ok: true, stored: valid.length, sink: "postgres" });
      return;
    }

    const ndjson =
      valid
        .map((e) => JSON.stringify({ ...e, country, received_at: receivedAt }))
        .join("\n") + "\n";
    const day = receivedAt.slice(0, 10);
    const rand = Math.random().toString(36).slice(2, 8);
    const key = `events/${day}/${receivedAt.replace(/[:.]/g, "-")}-${rand}.ndjson`;
    await put(key, ndjson, {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/x-ndjson",
    });
    res.status(200).json({ ok: true, stored: valid.length, sink: "blob" });
  } catch {
    res.status(200).json({ ok: false });
  }
}
