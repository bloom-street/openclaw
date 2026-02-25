import type { DatabaseSync } from "node:sqlite";
import { type FSWatcher } from "chokidar";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { ResolvedMemorySearchConfig } from "../agents/memory-search.js";
import type { OpenClawConfig } from "../config/config.js";
import type {
  MemoryEmbeddingProbeResult,
  MemoryProviderStatus,
  MemorySearchManager,
  MemorySearchResult,
  MemorySource,
  MemorySyncProgressUpdate,
} from "./types.js";
import { resolveAgentDir, resolveAgentWorkspaceDir } from "../agents/agent-scope.js";
import { resolveMemorySearchConfig } from "../agents/memory-search.js";
import { createSubsystemLogger } from "../logging/subsystem.js";
import {
  createEmbeddingProvider,
  type EmbeddingProvider,
  type EmbeddingProviderResult,
  type GeminiEmbeddingClient,
  type MistralEmbeddingClient,
  type OpenAiEmbeddingClient,
  type VoyageEmbeddingClient,
} from "./embeddings.js";
import { isFileMissingError, statRegularFile } from "./fs-utils.js";
import { bm25RankToScore, buildFtsQuery, mergeHybridResults } from "./hybrid.js";
import { isMemoryPath, normalizeExtraMemoryPaths } from "./internal.js";
import { MemoryManagerEmbeddingOps } from "./manager-embedding-ops.js";
import { searchKeyword, searchVector } from "./manager-search.js";
import { ensureFactsSchema } from "./memory-schema.js";
import { extractKeywords } from "./query-expansion.js";
const SNIPPET_MAX_CHARS = 700;
const VECTOR_TABLE = "chunks_vec";
const FTS_TABLE = "chunks_fts";
const EMBEDDING_CACHE_TABLE = "embedding_cache";
const BATCH_FAILURE_LIMIT = 2;

const log = createSubsystemLogger("memory");

const INDEX_CACHE = new Map<string, MemoryIndexManager>();

export class MemoryIndexManager extends MemoryManagerEmbeddingOps implements MemorySearchManager {
  private readonly cacheKey: string;
  protected readonly cfg: OpenClawConfig;
  protected readonly agentId: string;
  protected readonly workspaceDir: string;
  protected readonly settings: ResolvedMemorySearchConfig;
  protected provider: EmbeddingProvider | null;
  private readonly requestedProvider: "openai" | "local" | "gemini" | "voyage" | "mistral" | "auto";
  protected fallbackFrom?: "openai" | "local" | "gemini" | "voyage" | "mistral";
  protected fallbackReason?: string;
  private readonly providerUnavailableReason?: string;
  protected openAi?: OpenAiEmbeddingClient;
  protected gemini?: GeminiEmbeddingClient;
  protected voyage?: VoyageEmbeddingClient;
  protected mistral?: MistralEmbeddingClient;
  protected batch: {
    enabled: boolean;
    wait: boolean;
    concurrency: number;
    pollIntervalMs: number;
    timeoutMs: number;
  };
  protected batchFailureCount = 0;
  protected batchFailureLastError?: string;
  protected batchFailureLastProvider?: string;
  protected batchFailureLock: Promise<void> = Promise.resolve();
  protected db: DatabaseSync;
  protected readonly sources: Set<MemorySource>;
  protected providerKey: string;
  protected readonly cache: { enabled: boolean; maxEntries?: number };
  protected readonly vector: {
    enabled: boolean;
    available: boolean | null;
    extensionPath?: string;
    loadError?: string;
    dims?: number;
  };
  protected readonly fts: {
    enabled: boolean;
    available: boolean;
    loadError?: string;
  };
  protected vectorReady: Promise<boolean> | null = null;
  protected watcher: FSWatcher | null = null;
  protected watchTimer: NodeJS.Timeout | null = null;
  protected sessionWatchTimer: NodeJS.Timeout | null = null;
  protected sessionUnsubscribe: (() => void) | null = null;
  protected intervalTimer: NodeJS.Timeout | null = null;
  protected closed = false;
  protected dirty = false;
  protected sessionsDirty = false;
  protected sessionsDirtyFiles = new Set<string>();
  protected sessionPendingFiles = new Set<string>();
  protected sessionDeltas = new Map<
    string,
    { lastSize: number; pendingBytes: number; pendingMessages: number }
  >();
  private sessionWarm = new Set<string>();
  private syncing: Promise<void> | null = null;

  static async get(params: {
    cfg: OpenClawConfig;
    agentId: string;
    purpose?: "default" | "status";
  }): Promise<MemoryIndexManager | null> {
    const { cfg, agentId } = params;
    const settings = resolveMemorySearchConfig(cfg, agentId);
    if (!settings) {
      return null;
    }
    const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
    const key = `${agentId}:${workspaceDir}:${JSON.stringify(settings)}`;
    const existing = INDEX_CACHE.get(key);
    if (existing) {
      return existing;
    }
    const providerResult = await createEmbeddingProvider({
      config: cfg,
      agentDir: resolveAgentDir(cfg, agentId),
      provider: settings.provider,
      remote: settings.remote,
      model: settings.model,
      fallback: settings.fallback,
      local: settings.local,
    });
    const manager = new MemoryIndexManager({
      cacheKey: key,
      cfg,
      agentId,
      workspaceDir,
      settings,
      providerResult,
      purpose: params.purpose,
    });
    INDEX_CACHE.set(key, manager);
    return manager;
  }

  /**
   * Lightweight initializer that only sets up the facts schema (FTS5-based).
   * Does NOT create an embedding provider, watchers, or session listeners.
   * Use this when only fact-store operations (saveFact, searchFacts, etc.) are needed.
   */
  static async getFactsOnly(params: {
    cfg: OpenClawConfig;
    agentId: string;
  }): Promise<MemoryIndexManager | null> {
    const { cfg, agentId } = params;
    const settings = resolveMemorySearchConfig(cfg, agentId);
    if (!settings) {
      return null;
    }
    const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
    const key = `factsOnly:${agentId}:${workspaceDir}:${settings.store.path}`;
    const existing = INDEX_CACHE.get(key);
    if (existing) {
      return existing;
    }
    const noopEmbed = async () => [] as number[];
    const providerResult: EmbeddingProviderResult = {
      provider: {
        id: "none",
        model: "none",
        embedQuery: noopEmbed,
        embedBatch: async (texts: string[]) => texts.map(() => []),
      },
      requestedProvider: settings.provider,
    };
    const manager = new MemoryIndexManager({
      cacheKey: key,
      cfg,
      agentId,
      workspaceDir,
      settings,
      providerResult,
      factsOnly: true,
    });
    INDEX_CACHE.set(key, manager);
    return manager;
  }

  private constructor(params: {
    cacheKey: string;
    cfg: OpenClawConfig;
    agentId: string;
    workspaceDir: string;
    settings: ResolvedMemorySearchConfig;
    providerResult: EmbeddingProviderResult;
    purpose?: "default" | "status";
    factsOnly?: boolean;
  }) {
    super();
    this.cacheKey = params.cacheKey;
    this.cfg = params.cfg;
    this.agentId = params.agentId;
    this.workspaceDir = params.workspaceDir;
    this.settings = params.settings;
    this.provider = params.providerResult.provider;
    this.requestedProvider = params.providerResult.requestedProvider;
    this.fallbackFrom = params.providerResult.fallbackFrom;
    this.fallbackReason = params.providerResult.fallbackReason;
    this.providerUnavailableReason = params.providerResult.providerUnavailableReason;
    this.openAi = params.providerResult.openAi;
    this.gemini = params.providerResult.gemini;
    this.voyage = params.providerResult.voyage;
    this.mistral = params.providerResult.mistral;
    this.sources = new Set(params.settings.sources);
    this.db = this.openDatabase();
    this.providerKey = this.computeProviderKey();
    this.cache = {
      enabled: params.settings.cache.enabled,
      maxEntries: params.settings.cache.maxEntries,
    };
    this.fts = { enabled: params.settings.query.hybrid.enabled, available: false };

    if (params.factsOnly) {
      // Facts-only mode: only set up the facts schema (FTS5-based),
      // skip memory index schema, watchers, session listeners, and sync.
      const factsResult = ensureFactsSchema({ db: this.db });
      if (factsResult.factsError) {
        log.warn(`facts schema issue: ${factsResult.factsError}`);
      }
      this.vector = { enabled: false, available: false };
      this.dirty = false;
      this.batch = {
        enabled: false,
        wait: false,
        concurrency: 1,
        pollIntervalMs: 2000,
        timeoutMs: 3600000,
      };
      return;
    }

    this.ensureSchema();
    this.vector = {
      enabled: params.settings.store.vector.enabled,
      available: null,
      extensionPath: params.settings.store.vector.extensionPath,
    };
    const meta = this.readMeta();
    if (meta?.vectorDims) {
      this.vector.dims = meta.vectorDims;
    }
    this.ensureWatcher();
    this.ensureSessionListener();
    this.ensureIntervalSync();
    const statusOnly = params.purpose === "status";
    this.dirty = this.sources.has("memory") && (statusOnly ? !meta : true);
    this.batch = this.resolveBatchConfig();
  }

  async warmSession(sessionKey?: string): Promise<void> {
    if (!this.settings.sync.onSessionStart) {
      return;
    }
    const key = sessionKey?.trim() || "";
    if (key && this.sessionWarm.has(key)) {
      return;
    }
    void this.sync({ reason: "session-start" }).catch((err) => {
      log.warn(`memory sync failed (session-start): ${String(err)}`);
    });
    if (key) {
      this.sessionWarm.add(key);
    }
  }

  async search(
    query: string,
    opts?: {
      maxResults?: number;
      minScore?: number;
      sessionKey?: string;
    },
  ): Promise<MemorySearchResult[]> {
    void this.warmSession(opts?.sessionKey);
    if (this.settings.sync.onSearch && (this.dirty || this.sessionsDirty)) {
      void this.sync({ reason: "search" }).catch((err) => {
        log.warn(`memory sync failed (search): ${String(err)}`);
      });
    }
    const cleaned = query.trim();
    if (!cleaned) {
      return [];
    }
    const minScore = opts?.minScore ?? this.settings.query.minScore;
    const maxResults = opts?.maxResults ?? this.settings.query.maxResults;
    const hybrid = this.settings.query.hybrid;
    const candidates = Math.min(
      200,
      Math.max(1, Math.floor(maxResults * hybrid.candidateMultiplier)),
    );

    // FTS-only mode: no embedding provider available
    if (!this.provider) {
      if (!this.fts.enabled || !this.fts.available) {
        log.warn("memory search: no provider and FTS unavailable");
        return [];
      }

      // Extract keywords for better FTS matching on conversational queries
      // e.g., "that thing we discussed about the API" → ["discussed", "API"]
      const keywords = extractKeywords(cleaned);
      const searchTerms = keywords.length > 0 ? keywords : [cleaned];

      // Search with each keyword and merge results
      const resultSets = await Promise.all(
        searchTerms.map((term) => this.searchKeyword(term, candidates).catch(() => [])),
      );

      // Merge and deduplicate results, keeping highest score for each chunk
      const seenIds = new Map<string, (typeof resultSets)[0][0]>();
      for (const results of resultSets) {
        for (const result of results) {
          const existing = seenIds.get(result.id);
          if (!existing || result.score > existing.score) {
            seenIds.set(result.id, result);
          }
        }
      }

      const merged = [...seenIds.values()]
        .toSorted((a, b) => b.score - a.score)
        .filter((entry) => entry.score >= minScore)
        .slice(0, maxResults);

      return merged;
    }

    const keywordResults = hybrid.enabled
      ? await this.searchKeyword(cleaned, candidates).catch(() => [])
      : [];

    const queryVec = await this.embedQueryWithTimeout(cleaned);
    const hasVector = queryVec.some((v) => v !== 0);
    const vectorResults = hasVector
      ? await this.searchVector(queryVec, candidates).catch(() => [])
      : [];

    if (!hybrid.enabled) {
      return vectorResults.filter((entry) => entry.score >= minScore).slice(0, maxResults);
    }

    const merged = await this.mergeHybridResults({
      vector: vectorResults,
      keyword: keywordResults,
      vectorWeight: hybrid.vectorWeight,
      textWeight: hybrid.textWeight,
      mmr: hybrid.mmr,
      temporalDecay: hybrid.temporalDecay,
    });

    return merged.filter((entry) => entry.score >= minScore).slice(0, maxResults);
  }

  private async searchVector(
    queryVec: number[],
    limit: number,
  ): Promise<Array<MemorySearchResult & { id: string }>> {
    // This method should never be called without a provider
    if (!this.provider) {
      return [];
    }
    const results = await searchVector({
      db: this.db,
      vectorTable: VECTOR_TABLE,
      providerModel: this.provider.model,
      queryVec,
      limit,
      snippetMaxChars: SNIPPET_MAX_CHARS,
      ensureVectorReady: async (dimensions) => await this.ensureVectorReady(dimensions),
      sourceFilterVec: this.buildSourceFilter("c"),
      sourceFilterChunks: this.buildSourceFilter(),
    });
    return results.map((entry) => entry as MemorySearchResult & { id: string });
  }

  private buildFtsQuery(raw: string): string | null {
    return buildFtsQuery(raw);
  }

  private async searchKeyword(
    query: string,
    limit: number,
  ): Promise<Array<MemorySearchResult & { id: string; textScore: number }>> {
    if (!this.fts.enabled || !this.fts.available) {
      return [];
    }
    const sourceFilter = this.buildSourceFilter();
    // In FTS-only mode (no provider), search all models; otherwise filter by current provider's model
    const providerModel = this.provider?.model;
    const results = await searchKeyword({
      db: this.db,
      ftsTable: FTS_TABLE,
      providerModel,
      query,
      limit,
      snippetMaxChars: SNIPPET_MAX_CHARS,
      sourceFilter,
      buildFtsQuery: (raw) => this.buildFtsQuery(raw),
      bm25RankToScore,
    });
    return results.map((entry) => entry as MemorySearchResult & { id: string; textScore: number });
  }

  private mergeHybridResults(params: {
    vector: Array<MemorySearchResult & { id: string }>;
    keyword: Array<MemorySearchResult & { id: string; textScore: number }>;
    vectorWeight: number;
    textWeight: number;
    mmr?: { enabled: boolean; lambda: number };
    temporalDecay?: { enabled: boolean; halfLifeDays: number };
  }): Promise<MemorySearchResult[]> {
    return mergeHybridResults({
      vector: params.vector.map((r) => ({
        id: r.id,
        path: r.path,
        startLine: r.startLine,
        endLine: r.endLine,
        source: r.source,
        snippet: r.snippet,
        vectorScore: r.score,
      })),
      keyword: params.keyword.map((r) => ({
        id: r.id,
        path: r.path,
        startLine: r.startLine,
        endLine: r.endLine,
        source: r.source,
        snippet: r.snippet,
        textScore: r.textScore,
      })),
      vectorWeight: params.vectorWeight,
      textWeight: params.textWeight,
      mmr: params.mmr,
      temporalDecay: params.temporalDecay,
      workspaceDir: this.workspaceDir,
    }).then((entries) => entries.map((entry) => entry as MemorySearchResult));
  }

  async sync(params?: {
    reason?: string;
    force?: boolean;
    progress?: (update: MemorySyncProgressUpdate) => void;
  }): Promise<void> {
    if (this.closed) {
      return;
    }
    if (this.syncing) {
      return this.syncing;
    }
    this.syncing = this.runSync(params).finally(() => {
      this.syncing = null;
    });
    return this.syncing ?? Promise.resolve();
  }

  async readFile(params: {
    relPath: string;
    from?: number;
    lines?: number;
  }): Promise<{ text: string; path: string }> {
    const rawPath = params.relPath.trim();
    if (!rawPath) {
      throw new Error("path required");
    }
    const absPath = path.isAbsolute(rawPath)
      ? path.resolve(rawPath)
      : path.resolve(this.workspaceDir, rawPath);
    const relPath = path.relative(this.workspaceDir, absPath).replace(/\\/g, "/");
    const inWorkspace =
      relPath.length > 0 && !relPath.startsWith("..") && !path.isAbsolute(relPath);
    const allowedWorkspace = inWorkspace && isMemoryPath(relPath);
    let allowedAdditional = false;
    if (!allowedWorkspace && this.settings.extraPaths.length > 0) {
      const additionalPaths = normalizeExtraMemoryPaths(
        this.workspaceDir,
        this.settings.extraPaths,
      );
      for (const additionalPath of additionalPaths) {
        try {
          const stat = await fs.lstat(additionalPath);
          if (stat.isSymbolicLink()) {
            continue;
          }
          if (stat.isDirectory()) {
            if (absPath === additionalPath || absPath.startsWith(`${additionalPath}${path.sep}`)) {
              allowedAdditional = true;
              break;
            }
            continue;
          }
          if (stat.isFile()) {
            if (absPath === additionalPath && absPath.endsWith(".md")) {
              allowedAdditional = true;
              break;
            }
          }
        } catch {}
      }
    }
    if (!allowedWorkspace && !allowedAdditional) {
      throw new Error("path required");
    }
    if (!absPath.endsWith(".md")) {
      throw new Error("path required");
    }
    const statResult = await statRegularFile(absPath);
    if (statResult.missing) {
      return { text: "", path: relPath };
    }
    let content: string;
    try {
      content = await fs.readFile(absPath, "utf-8");
    } catch (err) {
      if (isFileMissingError(err)) {
        return { text: "", path: relPath };
      }
      throw err;
    }
    if (!params.from && !params.lines) {
      return { text: content, path: relPath };
    }
    const lines = content.split("\n");
    const start = Math.max(1, params.from ?? 1);
    const count = Math.max(1, params.lines ?? lines.length);
    const slice = lines.slice(start - 1, start - 1 + count);
    return { text: slice.join("\n"), path: relPath };
  }

  status(): MemoryProviderStatus {
    const sourceFilter = this.buildSourceFilter();
    const files = this.db
      .prepare(`SELECT COUNT(*) as c FROM files WHERE 1=1${sourceFilter.sql}`)
      .get(...sourceFilter.params) as {
      c: number;
    };
    const chunks = this.db
      .prepare(`SELECT COUNT(*) as c FROM chunks WHERE 1=1${sourceFilter.sql}`)
      .get(...sourceFilter.params) as {
      c: number;
    };
    const sourceCounts = (() => {
      const sources = Array.from(this.sources);
      if (sources.length === 0) {
        return [];
      }
      const bySource = new Map<MemorySource, { files: number; chunks: number }>();
      for (const source of sources) {
        bySource.set(source, { files: 0, chunks: 0 });
      }
      const fileRows = this.db
        .prepare(
          `SELECT source, COUNT(*) as c FROM files WHERE 1=1${sourceFilter.sql} GROUP BY source`,
        )
        .all(...sourceFilter.params) as Array<{ source: MemorySource; c: number }>;
      for (const row of fileRows) {
        const entry = bySource.get(row.source) ?? { files: 0, chunks: 0 };
        entry.files = row.c ?? 0;
        bySource.set(row.source, entry);
      }
      const chunkRows = this.db
        .prepare(
          `SELECT source, COUNT(*) as c FROM chunks WHERE 1=1${sourceFilter.sql} GROUP BY source`,
        )
        .all(...sourceFilter.params) as Array<{ source: MemorySource; c: number }>;
      for (const row of chunkRows) {
        const entry = bySource.get(row.source) ?? { files: 0, chunks: 0 };
        entry.chunks = row.c ?? 0;
        bySource.set(row.source, entry);
      }
      return sources.map((source) => Object.assign({ source }, bySource.get(source)!));
    })();

    // Determine search mode: "fts-only" if no provider, "hybrid" otherwise
    const searchMode = this.provider ? "hybrid" : "fts-only";
    const providerInfo = this.provider
      ? { provider: this.provider.id, model: this.provider.model }
      : { provider: "none", model: undefined };

    return {
      backend: "builtin",
      files: files?.c ?? 0,
      chunks: chunks?.c ?? 0,
      dirty: this.dirty || this.sessionsDirty,
      workspaceDir: this.workspaceDir,
      dbPath: this.settings.store.path,
      provider: providerInfo.provider,
      model: providerInfo.model,
      requestedProvider: this.requestedProvider,
      sources: Array.from(this.sources),
      extraPaths: this.settings.extraPaths,
      sourceCounts,
      cache: this.cache.enabled
        ? {
            enabled: true,
            entries:
              (
                this.db.prepare(`SELECT COUNT(*) as c FROM ${EMBEDDING_CACHE_TABLE}`).get() as
                  | { c: number }
                  | undefined
              )?.c ?? 0,
            maxEntries: this.cache.maxEntries,
          }
        : { enabled: false, maxEntries: this.cache.maxEntries },
      fts: {
        enabled: this.fts.enabled,
        available: this.fts.available,
        error: this.fts.loadError,
      },
      fallback: this.fallbackReason
        ? { from: this.fallbackFrom ?? "local", reason: this.fallbackReason }
        : undefined,
      vector: {
        enabled: this.vector.enabled,
        available: this.vector.available ?? undefined,
        extensionPath: this.vector.extensionPath,
        loadError: this.vector.loadError,
        dims: this.vector.dims,
      },
      batch: {
        enabled: this.batch.enabled,
        failures: this.batchFailureCount,
        limit: BATCH_FAILURE_LIMIT,
        wait: this.batch.wait,
        concurrency: this.batch.concurrency,
        pollIntervalMs: this.batch.pollIntervalMs,
        timeoutMs: this.batch.timeoutMs,
        lastError: this.batchFailureLastError,
        lastProvider: this.batchFailureLastProvider,
      },
      custom: {
        searchMode,
        providerUnavailableReason: this.providerUnavailableReason,
      },
    };
  }

  async probeVectorAvailability(): Promise<boolean> {
    // FTS-only mode: vector search not available
    if (!this.provider) {
      return false;
    }
    if (!this.vector.enabled) {
      return false;
    }
    return this.ensureVectorReady();
  }

  async probeEmbeddingAvailability(): Promise<MemoryEmbeddingProbeResult> {
    // FTS-only mode: embeddings not available but search still works
    if (!this.provider) {
      return {
        ok: false,
        error: this.providerUnavailableReason ?? "No embedding provider available (FTS-only mode)",
      };
    }
    try {
      await this.embedBatchWithRetry(["ping"]);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    }
  }

  async close(): Promise<void> {
    if (this.closed) {
      return;
    }
    this.closed = true;
    const pendingSync = this.syncing;
    if (this.watchTimer) {
      clearTimeout(this.watchTimer);
      this.watchTimer = null;
    }
    if (this.sessionWatchTimer) {
      clearTimeout(this.sessionWatchTimer);
      this.sessionWatchTimer = null;
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    if (this.sessionUnsubscribe) {
      this.sessionUnsubscribe();
      this.sessionUnsubscribe = null;
    }
    if (pendingSync) {
      try {
        await pendingSync;
      } catch {}
    }
    this.db.close();
    INDEX_CACHE.delete(this.cacheKey);
  }

  // ── Fact Store Operations ───────────────────────────────────────

  /** Save a structured fact. Handles dedup and temporal invalidation. */
  saveFact(params: {
    entity: string;
    attribute: string;
    value: string;
    tags?: string[];
    confidence?: number;
    source?: string;
    sourceConversationId?: string;
  }): { id: string; message: string; action: "created" | "already_known" | "superseded" } {
    const now = new Date().toISOString();
    const entity = params.entity.trim().toLowerCase();
    const attribute = params.attribute.trim().toLowerCase();
    const value = params.value.trim();
    const tags = params.tags ? JSON.stringify(params.tags) : null;
    const confidence = params.confidence ?? 1.0;
    const source = params.source ?? "conversation";

    const existing = this.db
      .prepare(
        `SELECT id, value FROM facts WHERE entity = ? AND attribute = ? AND valid_to IS NULL`,
      )
      .all(entity, attribute) as Array<{ id: string; value: string }>;

    const exactMatch = existing.find((f) => f.value === value);
    if (exactMatch) {
      return { id: exactMatch.id, message: "Already known.", action: "already_known" };
    }

    const newId = randomUUID();

    try {
      this.db.exec("BEGIN");

      if (existing.length > 0) {
        const invalidateStmt = this.db.prepare(
          `UPDATE facts SET valid_to = ?, superseded_by = ? WHERE id = ?`,
        );
        const deleteFtsStmt = this.db.prepare(`DELETE FROM facts_fts WHERE fact_id = ?`);
        for (const old of existing) {
          invalidateStmt.run(now, newId, old.id);
          deleteFtsStmt.run(old.id);
        }
      }

      this.db
        .prepare(
          `INSERT INTO facts (id, entity, attribute, value, tags, confidence, valid_from, source, source_conversation_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          newId,
          entity,
          attribute,
          value,
          tags,
          confidence,
          now,
          source,
          params.sourceConversationId ?? null,
          now,
        );

      this.db
        .prepare(
          `INSERT INTO facts_fts (entity, attribute, value, tags, fact_id) VALUES (?, ?, ?, ?, ?)`,
        )
        .run(entity, attribute, value, tags ?? "", newId);

      this.db.exec("COMMIT");
    } catch (err) {
      try {
        this.db.exec("ROLLBACK");
      } catch {}
      throw err;
    }

    const action = existing.length > 0 ? "superseded" : "created";
    const message =
      action === "superseded"
        ? `Saved (superseded ${existing.length} previous fact${existing.length > 1 ? "s" : ""}).`
        : "Saved.";

    return { id: newId, message, action };
  }

  /** Search facts using FTS5 with optional filters. Bumps reference counts. */
  searchFacts(params: {
    query: string;
    entity?: string;
    tags?: string[];
    includeHistorical?: boolean;
    limit?: number;
  }): { results: FactResult[]; count: number } {
    const limit = Math.min(params.limit ?? 10, 50);
    const query = params.query.trim();

    if (!query) {
      return { results: [], count: 0 };
    }

    const ftsQuery = query
      .replace(/[":*(){}[\]^~\\]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => `"${term}"`)
      .join(" ");

    if (!ftsQuery) {
      return { results: [], count: 0 };
    }

    const conditions: string[] = [];
    const sqlParams: (string | number | null)[] = [ftsQuery];

    if (!params.includeHistorical) {
      conditions.push(`f.valid_to IS NULL`);
    }
    if (params.entity) {
      conditions.push(`f.entity = ?`);
      sqlParams.push(params.entity.trim().toLowerCase());
    }
    if (params.tags && params.tags.length > 0) {
      const tagConditions = params.tags.map(() => `f.tags LIKE ?`);
      conditions.push(`(${tagConditions.join(" OR ")})`);
      for (const tag of params.tags) {
        sqlParams.push(`%${JSON.stringify(tag).slice(1, -1)}%`);
      }
    }

    const whereClause = conditions.length > 0 ? ` AND ${conditions.join(" AND ")}` : "";
    sqlParams.push(limit);

    const sql =
      `SELECT f.id, f.entity, f.attribute, f.value, f.tags, f.confidence,` +
      `  f.valid_from, f.valid_to, f.superseded_by, f.source, f.reference_count,` +
      `  f.last_referenced_at, f.created_at,` +
      `  bm25(facts_fts) AS rank` +
      ` FROM facts_fts` +
      ` JOIN facts AS f ON facts_fts.fact_id = f.id` +
      ` WHERE facts_fts MATCH ?${whereClause}` +
      ` ORDER BY rank ASC` +
      ` LIMIT ?`;

    const rows = this.db.prepare(sql).all(...sqlParams) as FactRow[];

    if (rows.length === 0) {
      return { results: [], count: 0 };
    }

    const now = new Date().toISOString();
    const updateStmt = this.db.prepare(
      `UPDATE facts SET reference_count = reference_count + 1, last_referenced_at = ? WHERE id = ?`,
    );
    for (const row of rows) {
      updateStmt.run(now, row.id);
    }

    const results: FactResult[] = rows.map((row) => ({
      id: row.id,
      entity: row.entity,
      attribute: row.attribute,
      value: row.value,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
      confidence: row.confidence,
      valid_from: row.valid_from,
      valid_to: row.valid_to ?? undefined,
      superseded_by: row.superseded_by ?? undefined,
      source: row.source,
      reference_count: row.reference_count + 1,
      created_at: row.created_at,
    }));

    return { results, count: results.length };
  }

  /** Check when the last consolidation of a given type ran. */
  getLastConsolidation(type: string): ConsolidationLogEntry | null {
    const row = this.db
      .prepare(
        `SELECT id, type, session_id, facts_added, facts_updated, facts_invalidated,
                started_at, completed_at, model_used, tokens_used
         FROM consolidation_log WHERE type = ? ORDER BY started_at DESC LIMIT 1`,
      )
      .get(type) as ConsolidationLogRow | undefined;
    return row ? mapConsolidationRow(row) : null;
  }

  /** Write a consolidation log entry. */
  logConsolidation(params: {
    type: string;
    sessionId?: string;
    factsAdded?: number;
    factsUpdated?: number;
    factsInvalidated?: number;
    startedAt: string;
    completedAt?: string;
    modelUsed?: string;
    tokensUsed?: number;
  }): string {
    const id = randomUUID();
    this.db
      .prepare(
        `INSERT INTO consolidation_log (id, type, session_id, facts_added, facts_updated, facts_invalidated, started_at, completed_at, model_used, tokens_used)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        params.type,
        params.sessionId ?? null,
        params.factsAdded ?? 0,
        params.factsUpdated ?? 0,
        params.factsInvalidated ?? 0,
        params.startedAt,
        params.completedAt ?? null,
        params.modelUsed ?? null,
        params.tokensUsed ?? null,
      );
    return id;
  }

  /** Get stats about the fact store. */
  getFactStats(): FactStoreStats {
    const total = (this.db.prepare(`SELECT COUNT(*) AS cnt FROM facts`).get() as { cnt: number })
      .cnt;
    const current = (
      this.db.prepare(`SELECT COUNT(*) AS cnt FROM facts WHERE valid_to IS NULL`).get() as {
        cnt: number;
      }
    ).cnt;
    const superseded = total - current;

    const entityRows = this.db
      .prepare(
        `SELECT entity, COUNT(*) AS cnt FROM facts WHERE valid_to IS NULL GROUP BY entity ORDER BY cnt DESC LIMIT 20`,
      )
      .all() as Array<{ entity: string; cnt: number }>;

    const unreferenced = (
      this.db
        .prepare(`SELECT COUNT(*) AS cnt FROM facts WHERE valid_to IS NULL AND reference_count = 0`)
        .get() as { cnt: number }
    ).cnt;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const createdToday = (
      this.db
        .prepare(`SELECT COUNT(*) AS cnt FROM facts WHERE created_at >= ?`)
        .get(todayStart.toISOString()) as { cnt: number }
    ).cnt;

    return {
      total,
      current,
      superseded,
      unreferenced,
      createdToday,
      topEntities: entityRows.map((r) => ({ entity: r.entity, count: r.cnt })),
    };
  }

  /** Find duplicate facts: current facts sharing the same entity+attribute. */
  findDuplicateFacts(): DuplicateFactGroup[] {
    const rows = this.db
      .prepare(
        `SELECT f.id, f.entity, f.attribute, f.value, f.tags, f.confidence,
                f.valid_from, f.source, f.reference_count, f.created_at
         FROM facts f
         WHERE f.valid_to IS NULL
           AND EXISTS (
             SELECT 1 FROM facts f2
             WHERE f2.entity = f.entity AND f2.attribute = f.attribute
               AND f2.valid_to IS NULL AND f2.id != f.id
           )
         ORDER BY f.entity, f.attribute, f.created_at DESC`,
      )
      .all() as Array<{
      id: string;
      entity: string;
      attribute: string;
      value: string;
      tags: string | null;
      confidence: number;
      valid_from: string;
      source: string;
      reference_count: number;
      created_at: string;
    }>;

    const groups = new Map<string, DuplicateFactGroup>();
    for (const row of rows) {
      const key = `${row.entity}::${row.attribute}`;
      if (!groups.has(key)) {
        groups.set(key, { entity: row.entity, attribute: row.attribute, facts: [] });
      }
      groups.get(key)!.facts.push({
        id: row.id,
        value: row.value,
        tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
        confidence: row.confidence,
        valid_from: row.valid_from,
        source: row.source,
        reference_count: row.reference_count,
        created_at: row.created_at,
      });
    }

    return Array.from(groups.values());
  }

  /** Apply expiry policies to stale facts. */
  applyFactExpiry(): { invalidated: number; details: string[] } {
    const now = new Date();
    const nowIso = now.toISOString();
    const details: string[] = [];
    let invalidated = 0;

    const facts = this.db
      .prepare(
        `SELECT id, entity, attribute, tags, reference_count, last_referenced_at, created_at
         FROM facts WHERE valid_to IS NULL`,
      )
      .all() as Array<{
      id: string;
      entity: string;
      attribute: string;
      tags: string | null;
      reference_count: number;
      last_referenced_at: string | null;
      created_at: string;
    }>;

    const invalidateStmt = this.db.prepare(
      `UPDATE facts SET valid_to = ?, superseded_by = 'expired' WHERE id = ?`,
    );
    const deleteFtsStmt = this.db.prepare(`DELETE FROM facts_fts WHERE fact_id = ?`);

    const neverExpireTags = new Set([
      "type:decision",
      "type:preference",
      "type:person",
      "type:important-date",
      "type:emotion",
      "type:feeling",
      "type:place",
      "type:routine",
      "type:pattern",
      "type:milestone",
    ]);

    const toExpire: Array<{ id: string; entity: string; attribute: string; reason: string }> = [];

    for (const fact of facts) {
      const tags: string[] = fact.tags ? (JSON.parse(fact.tags) as string[]) : [];
      const ageMs = now.getTime() - new Date(fact.created_at).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      if (tags.some((t) => neverExpireTags.has(t))) {
        continue;
      }
      if (fact.reference_count >= 3) {
        continue;
      }

      let reason = "";

      if (tags.includes("type:debug") || tags.includes("type:error")) {
        if (ageDays > 14 && !tags.includes("root-cause")) {
          reason = "debug/error fact older than 14 days";
        }
      } else if (tags.includes("type:observation")) {
        if (ageDays > 30) {
          reason = "observation older than 30 days without promotion";
        }
      } else if (tags.includes("type:session-context")) {
        if (ageDays > 30) {
          reason = "session-context older than 30 days";
        }
      } else if (tags.includes("type:commitment") || tags.includes("type:todo")) {
        if (ageDays > 90) {
          reason = "commitment/todo older than 90 days";
        }
      } else if (ageDays > 60 && fact.reference_count === 0) {
        reason = "unreferenced fact older than 60 days";
      }

      if (reason) {
        toExpire.push({ id: fact.id, entity: fact.entity, attribute: fact.attribute, reason });
      }
    }

    if (toExpire.length > 0) {
      try {
        this.db.exec("BEGIN");
        for (const item of toExpire) {
          invalidateStmt.run(nowIso, item.id);
          deleteFtsStmt.run(item.id);
          invalidated++;
          details.push(`Expired: ${item.entity}/${item.attribute} (${item.reason})`);
        }
        this.db.exec("COMMIT");
      } catch (err) {
        try {
          this.db.exec("ROLLBACK");
        } catch {}
        throw err;
      }
    }

    return { invalidated, details };
  }

  /** Get current facts for review, optionally filtered by creation date range. */
  getRecentFacts(params?: { since?: string; limit?: number }): FactResult[] {
    const limit = Math.min(params?.limit ?? 50, 200);
    let sql =
      `SELECT id, entity, attribute, value, tags, confidence, valid_from, valid_to,` +
      ` superseded_by, source, reference_count, last_referenced_at, created_at` +
      ` FROM facts WHERE valid_to IS NULL`;
    const sqlParams: (string | number)[] = [];

    if (params?.since) {
      sql += ` AND created_at >= ?`;
      sqlParams.push(params.since);
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    sqlParams.push(limit);

    const rows = this.db.prepare(sql).all(...sqlParams) as FactRow[];
    return rows.map((row) => ({
      id: row.id,
      entity: row.entity,
      attribute: row.attribute,
      value: row.value,
      tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
      confidence: row.confidence,
      valid_from: row.valid_from,
      valid_to: row.valid_to ?? undefined,
      superseded_by: row.superseded_by ?? undefined,
      source: row.source,
      reference_count: row.reference_count,
      created_at: row.created_at,
    }));
  }
}

// ── Fact Types ────────────────────────────────────────────────────

type FactRow = {
  id: string;
  entity: string;
  attribute: string;
  value: string;
  tags: string | null;
  confidence: number;
  valid_from: string;
  valid_to: string | null;
  superseded_by: string | null;
  source: string;
  reference_count: number;
  last_referenced_at: string | null;
  created_at: string;
  rank?: number;
};

export type FactResult = {
  id: string;
  entity: string;
  attribute: string;
  value: string;
  tags: string[];
  confidence: number;
  valid_from: string;
  valid_to?: string;
  superseded_by?: string;
  source: string;
  reference_count: number;
  created_at: string;
};

export type FactStoreStats = {
  total: number;
  current: number;
  superseded: number;
  unreferenced: number;
  createdToday: number;
  topEntities: Array<{ entity: string; count: number }>;
};

export type DuplicateFactGroup = {
  entity: string;
  attribute: string;
  facts: Array<{
    id: string;
    value: string;
    tags: string[];
    confidence: number;
    valid_from: string;
    source: string;
    reference_count: number;
    created_at: string;
  }>;
};

export type ConsolidationLogEntry = {
  id: string;
  type: string;
  sessionId: string | null;
  factsAdded: number;
  factsUpdated: number;
  factsInvalidated: number;
  startedAt: string;
  completedAt: string | null;
  modelUsed: string | null;
  tokensUsed: number | null;
};

type ConsolidationLogRow = {
  id: string;
  type: string;
  session_id: string | null;
  facts_added: number;
  facts_updated: number;
  facts_invalidated: number;
  started_at: string;
  completed_at: string | null;
  model_used: string | null;
  tokens_used: number | null;
};

function mapConsolidationRow(row: ConsolidationLogRow): ConsolidationLogEntry {
  return {
    id: row.id,
    type: row.type,
    sessionId: row.session_id,
    factsAdded: row.facts_added,
    factsUpdated: row.facts_updated,
    factsInvalidated: row.facts_invalidated,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    modelUsed: row.model_used,
    tokensUsed: row.tokens_used,
  };
}
