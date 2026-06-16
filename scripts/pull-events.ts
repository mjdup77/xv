// Download all analytics events from the private Vercel Blob store into
// ./analytics/ as a single combined NDJSON file for local analysis.
//
//   npm run analytics:pull
//
// Then query with DuckDB (no import step needed):
//   duckdb -c "select event, count(*) from read_json_auto('analytics/events.ndjson') group by 1 order by 2 desc"
// or load analytics/events.ndjson into pandas / your tool of choice.

import { list, get } from "@vercel/blob";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

// Load BLOB_READ_WRITE_TOKEN from .env.local if not already in the environment.
function loadToken(): string {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const env = readFileSync(".env.local", "utf8");
    const line = env.split("\n").find((l) => l.startsWith("BLOB_READ_WRITE_TOKEN="));
    if (line) return line.slice("BLOB_READ_WRITE_TOKEN=".length).trim().replace(/^"|"$/g, "");
  } catch {
    /* ignore */
  }
  throw new Error(
    "BLOB_READ_WRITE_TOKEN not found. Run `vercel env pull` or set it in the environment.",
  );
}

async function main() {
  const token = loadToken();
  let cursor: string | undefined;
  let files = 0;
  const lines: string[] = [];

  do {
    const page = await list({ token, prefix: "events/", cursor, limit: 1000 });
    for (const b of page.blobs) {
      const r = await get(b.pathname, { access: "private", token });
      const text = await new Response(r.stream as ReadableStream).text();
      for (const line of text.split("\n")) if (line.trim()) lines.push(line);
      files++;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  if (!existsSync("analytics")) mkdirSync("analytics");
  writeFileSync("analytics/events.ndjson", lines.join("\n") + (lines.length ? "\n" : ""));
  console.log(`Pulled ${lines.length} events from ${files} objects -> analytics/events.ndjson`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
