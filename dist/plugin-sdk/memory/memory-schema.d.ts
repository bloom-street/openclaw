import type { DatabaseSync } from "node:sqlite";
export declare function ensureMemoryIndexSchema(params: {
    db: DatabaseSync;
    embeddingCacheTable: string;
    ftsTable: string;
    ftsEnabled: boolean;
}): {
    ftsAvailable: boolean;
    ftsError?: string;
};
/**
 * Creates the structured facts tables for the memory system (Phase 2).
 * - `facts`: Entity-attribute-value store with temporal tracking
 * - `facts_fts`: FTS5 virtual table for keyword search over facts
 * - `consolidation_log`: Tracks consolidation runs for idempotency
 */
export declare function ensureFactsSchema(params: {
    db: DatabaseSync;
}): {
    factsReady: boolean;
    factsFtsReady: boolean;
    factsError?: string;
};
