import type { DatabaseSync } from "node:sqlite";

export function ensureMemoryIndexSchema(params: {
  db: DatabaseSync;
  embeddingCacheTable: string;
  ftsTable: string;
  ftsEnabled: boolean;
}): { ftsAvailable: boolean; ftsError?: string } {
  params.db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  params.db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      path TEXT PRIMARY KEY,
      source TEXT NOT NULL DEFAULT 'memory',
      hash TEXT NOT NULL,
      mtime INTEGER NOT NULL,
      size INTEGER NOT NULL
    );
  `);
  params.db.exec(`
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      path TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'memory',
      start_line INTEGER NOT NULL,
      end_line INTEGER NOT NULL,
      hash TEXT NOT NULL,
      model TEXT NOT NULL,
      text TEXT NOT NULL,
      embedding TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  params.db.exec(`
    CREATE TABLE IF NOT EXISTS ${params.embeddingCacheTable} (
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      provider_key TEXT NOT NULL,
      hash TEXT NOT NULL,
      embedding TEXT NOT NULL,
      dims INTEGER,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (provider, model, provider_key, hash)
    );
  `);
  params.db.exec(
    `CREATE INDEX IF NOT EXISTS idx_embedding_cache_updated_at ON ${params.embeddingCacheTable}(updated_at);`,
  );

  let ftsAvailable = false;
  let ftsError: string | undefined;
  if (params.ftsEnabled) {
    try {
      params.db.exec(
        `CREATE VIRTUAL TABLE IF NOT EXISTS ${params.ftsTable} USING fts5(\n` +
          `  text,\n` +
          `  id UNINDEXED,\n` +
          `  path UNINDEXED,\n` +
          `  source UNINDEXED,\n` +
          `  model UNINDEXED,\n` +
          `  start_line UNINDEXED,\n` +
          `  end_line UNINDEXED\n` +
          `);`,
      );
      ftsAvailable = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ftsAvailable = false;
      ftsError = message;
    }
  }

  ensureColumn(params.db, "files", "source", "TEXT NOT NULL DEFAULT 'memory'");
  ensureColumn(params.db, "chunks", "source", "TEXT NOT NULL DEFAULT 'memory'");
  params.db.exec(`CREATE INDEX IF NOT EXISTS idx_chunks_path ON chunks(path);`);
  params.db.exec(`CREATE INDEX IF NOT EXISTS idx_chunks_source ON chunks(source);`);

  return { ftsAvailable, ...(ftsError ? { ftsError } : {}) };
}

/**
 * Creates the structured facts tables for the memory system (Phase 2).
 * - `facts`: Entity-attribute-value store with temporal tracking
 * - `facts_fts`: FTS5 virtual table for keyword search over facts
 * - `consolidation_log`: Tracks consolidation runs for idempotency
 */
export function ensureFactsSchema(params: { db: DatabaseSync }): {
  factsReady: boolean;
  factsFtsReady: boolean;
  factsError?: string;
} {
  let factsReady = false;
  let factsFtsReady = false;
  let factsError: string | undefined;

  try {
    params.db.exec(`
      CREATE TABLE IF NOT EXISTS facts (
        id TEXT PRIMARY KEY,
        entity TEXT NOT NULL,
        attribute TEXT NOT NULL,
        value TEXT NOT NULL,
        tags TEXT,
        confidence REAL DEFAULT 1.0,
        valid_from TEXT NOT NULL,
        valid_to TEXT,
        superseded_by TEXT,
        source TEXT DEFAULT 'conversation',
        source_conversation_id TEXT,
        reference_count INTEGER DEFAULT 0,
        last_referenced_at TEXT,
        created_at TEXT NOT NULL,
        embedding BLOB
      );
    `);

    params.db.exec(`CREATE INDEX IF NOT EXISTS idx_facts_entity ON facts(entity);`);
    params.db.exec(
      `CREATE INDEX IF NOT EXISTS idx_facts_current ON facts(valid_to) WHERE valid_to IS NULL;`,
    );
    params.db.exec(`CREATE INDEX IF NOT EXISTS idx_facts_created ON facts(created_at);`);
    params.db.exec(
      `CREATE INDEX IF NOT EXISTS idx_facts_stale ON facts(last_referenced_at) WHERE valid_to IS NULL;`,
    );

    factsReady = true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    factsError = message;
    return { factsReady, factsFtsReady, factsError };
  }

  try {
    params.db.exec(
      `CREATE VIRTUAL TABLE IF NOT EXISTS facts_fts USING fts5(\n` +
        `  entity,\n` +
        `  attribute,\n` +
        `  value,\n` +
        `  tags,\n` +
        `  fact_id UNINDEXED,\n` +
        `  tokenize='porter'\n` +
        `);`,
    );
    factsFtsReady = true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    factsError = message;
  }

  params.db.exec(`
    CREATE TABLE IF NOT EXISTS consolidation_log (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      session_id TEXT,
      facts_added INTEGER DEFAULT 0,
      facts_updated INTEGER DEFAULT 0,
      facts_invalidated INTEGER DEFAULT 0,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      model_used TEXT,
      tokens_used INTEGER
    );
  `);

  return { factsReady, factsFtsReady, ...(factsError ? { factsError } : {}) };
}

function ensureColumn(
  db: DatabaseSync,
  table: "files" | "chunks",
  column: string,
  definition: string,
): void {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (rows.some((row) => row.name === column)) {
    return;
  }
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
