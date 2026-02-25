import type { DatabaseSync } from "node:sqlite";
import { type FSWatcher } from "chokidar";
import type { ResolvedMemorySearchConfig } from "../agents/memory-search.js";
import type { OpenClawConfig } from "../config/config.js";
import type { MemoryEmbeddingProbeResult, MemoryProviderStatus, MemorySearchManager, MemorySearchResult, MemorySource, MemorySyncProgressUpdate } from "./types.js";
import { type EmbeddingProvider, type GeminiEmbeddingClient, type MistralEmbeddingClient, type OpenAiEmbeddingClient, type VoyageEmbeddingClient } from "./embeddings.js";
import { MemoryManagerEmbeddingOps } from "./manager-embedding-ops.js";
export declare class MemoryIndexManager extends MemoryManagerEmbeddingOps implements MemorySearchManager {
    private readonly cacheKey;
    protected readonly cfg: OpenClawConfig;
    protected readonly agentId: string;
    protected readonly workspaceDir: string;
    getWorkspaceDir(): string;
    protected readonly settings: ResolvedMemorySearchConfig;
    protected provider: EmbeddingProvider | null;
    private readonly requestedProvider;
    protected fallbackFrom?: "openai" | "local" | "gemini" | "voyage" | "mistral";
    protected fallbackReason?: string;
    private readonly providerUnavailableReason?;
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
    protected batchFailureCount: number;
    protected batchFailureLastError?: string;
    protected batchFailureLastProvider?: string;
    protected batchFailureLock: Promise<void>;
    protected db: DatabaseSync;
    protected readonly sources: Set<MemorySource>;
    protected providerKey: string;
    protected readonly cache: {
        enabled: boolean;
        maxEntries?: number;
    };
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
    protected vectorReady: Promise<boolean> | null;
    protected watcher: FSWatcher | null;
    protected watchTimer: NodeJS.Timeout | null;
    protected sessionWatchTimer: NodeJS.Timeout | null;
    protected sessionUnsubscribe: (() => void) | null;
    protected intervalTimer: NodeJS.Timeout | null;
    protected closed: boolean;
    protected dirty: boolean;
    protected sessionsDirty: boolean;
    protected sessionsDirtyFiles: Set<string>;
    protected sessionPendingFiles: Set<string>;
    protected sessionDeltas: Map<string, {
        lastSize: number;
        pendingBytes: number;
        pendingMessages: number;
    }>;
    private sessionWarm;
    private syncing;
    static get(params: {
        cfg: OpenClawConfig;
        agentId: string;
        purpose?: "default" | "status";
    }): Promise<MemoryIndexManager | null>;
    /**
     * Lightweight initializer that only sets up the facts schema (FTS5-based).
     * Does NOT create an embedding provider, watchers, or session listeners.
     * Use this when only fact-store operations (saveFact, searchFacts, etc.) are needed.
     */
    static getFactsOnly(params: {
        cfg: OpenClawConfig;
        agentId: string;
    }): Promise<MemoryIndexManager | null>;
    private constructor();
    warmSession(sessionKey?: string): Promise<void>;
    search(query: string, opts?: {
        maxResults?: number;
        minScore?: number;
        sessionKey?: string;
    }): Promise<MemorySearchResult[]>;
    private searchVector;
    private buildFtsQuery;
    private searchKeyword;
    private mergeHybridResults;
    sync(params?: {
        reason?: string;
        force?: boolean;
        progress?: (update: MemorySyncProgressUpdate) => void;
    }): Promise<void>;
    readFile(params: {
        relPath: string;
        from?: number;
        lines?: number;
    }): Promise<{
        text: string;
        path: string;
    }>;
    status(): MemoryProviderStatus;
    probeVectorAvailability(): Promise<boolean>;
    probeEmbeddingAvailability(): Promise<MemoryEmbeddingProbeResult>;
    close(): Promise<void>;
    /** Save a structured fact. Handles dedup and temporal invalidation. */
    saveFact(params: {
        entity: string;
        attribute: string;
        value: string;
        tags?: string[];
        confidence?: number;
        source?: string;
        sourceConversationId?: string;
    }): {
        id: string;
        message: string;
        action: "created" | "already_known" | "superseded";
    };
    /** Search facts using FTS5 with optional filters. Bumps reference counts. */
    searchFacts(params: {
        query: string;
        entity?: string;
        tags?: string[];
        includeHistorical?: boolean;
        limit?: number;
    }): {
        results: FactResult[];
        count: number;
    };
    /** Check when the last consolidation of a given type ran. */
    getLastConsolidation(type: string): ConsolidationLogEntry | null;
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
    }): string;
    /** Get stats about the fact store. */
    getFactStats(): FactStoreStats;
    /** Find duplicate facts: current facts sharing the same entity+attribute. */
    findDuplicateFacts(): DuplicateFactGroup[];
    /** Apply expiry policies to stale facts. */
    applyFactExpiry(): {
        invalidated: number;
        details: string[];
    };
    /** Get current facts for review, optionally filtered by creation date range. */
    getRecentFacts(params?: {
        since?: string;
        limit?: number;
    }): FactResult[];
}
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
    topEntities: Array<{
        entity: string;
        count: number;
    }>;
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
