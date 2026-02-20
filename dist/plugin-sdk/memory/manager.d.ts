import type { OpenClawConfig } from "../config/config.js";
import type { MemoryEmbeddingProbeResult, MemoryProviderStatus, MemorySearchManager, MemorySearchResult, MemorySyncProgressUpdate } from "./types.js";
export declare class MemoryIndexManager implements MemorySearchManager {
    private readonly cacheKey;
    private readonly cfg;
    private readonly agentId;
    private readonly workspaceDir;
    private readonly settings;
    private provider;
    private readonly requestedProvider;
    private fallbackFrom?;
    private fallbackReason?;
    private openAi?;
    private gemini?;
    private voyage?;
    private batch;
    private batchFailureCount;
    private batchFailureLastError?;
    private batchFailureLastProvider?;
    private batchFailureLock;
    private db;
    private readonly sources;
    private providerKey;
    private readonly cache;
    private readonly vector;
    private readonly fts;
    private vectorReady;
    private watcher;
    private watchTimer;
    private sessionWatchTimer;
    private sessionUnsubscribe;
    private intervalTimer;
    private closed;
    private dirty;
    private sessionsDirty;
    private sessionsDirtyFiles;
    private sessionPendingFiles;
    private sessionDeltas;
    private sessionWarm;
    private syncing;
    static get(params: {
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
    private ensureVectorReady;
    private loadVectorExtension;
    private ensureVectorTable;
    private dropVectorTable;
    private buildSourceFilter;
    private openDatabase;
    private openDatabaseAtPath;
    private seedEmbeddingCache;
    private swapIndexFiles;
    private moveIndexFiles;
    private removeIndexFiles;
    private ensureSchema;
    private ensureWatcher;
    private ensureSessionListener;
    private scheduleSessionDirty;
    private processSessionDeltaBatch;
    private updateSessionDelta;
    private countNewlines;
    private resetSessionDelta;
    private isSessionFileForAgent;
    private ensureIntervalSync;
    private scheduleWatchSync;
    private shouldSyncSessions;
    private syncMemoryFiles;
    private syncSessionFiles;
    private createSyncProgress;
    private runSync;
    private shouldFallbackOnError;
    private resolveBatchConfig;
    private activateFallbackProvider;
    private runSafeReindex;
    private resetIndex;
    private readMeta;
    private writeMeta;
    private listSessionFiles;
    private sessionPathForFile;
    private normalizeSessionText;
    private extractSessionText;
    private buildSessionEntry;
    private estimateEmbeddingTokens;
    private buildEmbeddingBatches;
    private loadEmbeddingCache;
    private upsertEmbeddingCache;
    private pruneEmbeddingCacheIfNeeded;
    private embedChunksInBatches;
    private computeProviderKey;
    private embedChunksWithBatch;
    private embedChunksWithVoyageBatch;
    private embedChunksWithOpenAiBatch;
    private embedChunksWithGeminiBatch;
    private embedBatchWithRetry;
    private isRetryableEmbeddingError;
    private resolveEmbeddingTimeout;
    private embedQueryWithTimeout;
    private withTimeout;
    private withBatchFailureLock;
    private resetBatchFailureCount;
    private recordBatchFailure;
    private isBatchTimeoutError;
    private runBatchWithTimeoutRetry;
    private runBatchWithFallback;
    private getIndexConcurrency;
    private indexFile;
    /** Returns the workspace directory path for file operations. */
    getWorkspaceDir(): string;
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
    /**
     * Find duplicate facts: current facts sharing the same entity+attribute.
     * Returns groups where multiple current facts exist for a single entity+attribute pair.
     */
    findDuplicateFacts(): DuplicateFactGroup[];
    /**
     * Apply expiry policies to stale facts. Returns counts of invalidated facts.
     * Rules based on tag categories and reference counts.
     */
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
