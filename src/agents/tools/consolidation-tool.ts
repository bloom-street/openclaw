import { Type } from "@sinclair/typebox";
import type { OpenClawConfig } from "../../config/config.js";
import type { AnyAgentTool } from "./common.js";
import { MemoryIndexManager } from "../../memory/manager.js";
import { resolveSessionAgentId } from "../agent-scope.js";
import { resolveMemorySearchConfig } from "../memory-search.js";
import { jsonResult, readStringParam } from "./common.js";

// ── Schema ───────────────────────────────────────────────────────

const ConsolidateSchema = Type.Object({
  scope: Type.Union([Type.Literal("post_session"), Type.Literal("daily"), Type.Literal("weekly")]),
});

// ── Helpers ──────────────────────────────────────────────────────

async function getManager(options: {
  config?: OpenClawConfig;
  agentSessionKey?: string;
}): Promise<MemoryIndexManager | null> {
  const cfg = options.config;
  if (!cfg) {
    return null;
  }
  const agentId = resolveSessionAgentId({
    sessionKey: options.agentSessionKey,
    config: cfg,
  });
  if (!resolveMemorySearchConfig(cfg, agentId)) {
    return null;
  }
  return MemoryIndexManager.get({ cfg, agentId });
}

// ── memory_consolidate ───────────────────────────────────────────

export function createMemoryConsolidateTool(options: {
  config?: OpenClawConfig;
  agentSessionKey?: string;
}): AnyAgentTool | null {
  const cfg = options.config;
  if (!cfg) {
    return null;
  }
  const agentId = resolveSessionAgentId({
    sessionKey: options.agentSessionKey,
    config: cfg,
  });
  if (!resolveMemorySearchConfig(cfg, agentId)) {
    return null;
  }
  return {
    label: "Consolidate Memory",
    name: "memory_consolidate",
    description:
      "Run memory consolidation for a given scope. " +
      "post_session: get stats on recent facts and log the consolidation run. " +
      "daily: find duplicate facts, apply deduplication, return a report for review. " +
      "weekly: apply expiry policies to stale facts, return stats and patterns for review. " +
      "After calling this tool, use memory_save_fact/memory_update_core to act on the results.",
    parameters: ConsolidateSchema,
    execute: async (_toolCallId, params) => {
      const scope = readStringParam(params, "scope", { required: true }) as
        | "post_session"
        | "daily"
        | "weekly";

      if (!["post_session", "daily", "weekly"].includes(scope)) {
        return jsonResult({ error: "scope must be post_session, daily, or weekly" });
      }

      const manager = await getManager(options);
      if (!manager) {
        return jsonResult({ error: "Memory system not available." });
      }

      try {
        const startedAt = new Date().toISOString();

        switch (scope) {
          case "post_session":
            return await runPostSessionConsolidation(manager, startedAt);
          case "daily":
            return await runDailyConsolidation(manager, startedAt);
          case "weekly":
            return await runWeeklyConsolidation(manager, startedAt);
          default:
            return jsonResult({ error: `Unknown scope: ${scope}` });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResult({ error: message });
      }
    },
  };
}

// ── Post-Session Consolidation ───────────────────────────────────

async function runPostSessionConsolidation(manager: MemoryIndexManager, startedAt: string) {
  // Check if we already ran post_session recently (within last 5 minutes)
  const lastRun = manager.getLastConsolidation("post_session");
  if (lastRun?.completedAt) {
    const elapsed = Date.now() - new Date(lastRun.completedAt).getTime();
    if (elapsed < 5 * 60 * 1000) {
      return jsonResult({
        message: "Post-session consolidation already ran recently. Skipping.",
        last_run: lastRun.completedAt,
      });
    }
  }

  // Get stats and recent facts for the agent to review
  const stats = manager.getFactStats();
  const recentFacts = manager.getRecentFacts({ limit: 30 });

  const completedAt = new Date().toISOString();

  // Log the consolidation run
  const logId = manager.logConsolidation({
    type: "post_session",
    startedAt,
    completedAt,
  });

  return jsonResult({
    message:
      "Post-session consolidation complete. Review the stats and recent facts below. " +
      "Use memory_save_fact to save any new facts you extracted from the conversation. " +
      "Use memory_update_core to update USER.md or MEMORY.md with key insights.",
    consolidation_id: logId,
    stats: {
      total_facts: stats.total,
      current_facts: stats.current,
      superseded: stats.superseded,
      unreferenced: stats.unreferenced,
      created_today: stats.createdToday,
      top_entities: stats.topEntities,
    },
    recent_facts: recentFacts.map((f) => ({
      entity: f.entity,
      attribute: f.attribute,
      value: f.value,
      tags: f.tags,
      source: f.source,
      created_at: f.created_at,
    })),
  });
}

// ── Daily Consolidation ──────────────────────────────────────────

async function runDailyConsolidation(manager: MemoryIndexManager, startedAt: string) {
  // Check if daily already ran today
  const lastRun = manager.getLastConsolidation("daily");
  if (lastRun?.completedAt) {
    const lastDate = new Date(lastRun.completedAt);
    const today = new Date();
    if (
      lastDate.getFullYear() === today.getFullYear() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getDate() === today.getDate()
    ) {
      return jsonResult({
        message: "Daily consolidation already ran today. Skipping.",
        last_run: lastRun.completedAt,
      });
    }
  }

  // Find duplicate facts (same entity+attribute with multiple current values)
  const duplicates = manager.findDuplicateFacts();

  // Get stats
  const stats = manager.getFactStats();

  // Get today's new facts
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayFacts = manager.getRecentFacts({
    since: todayStart.toISOString(),
    limit: 100,
  });

  const completedAt = new Date().toISOString();

  // Log the consolidation run
  const logId = manager.logConsolidation({
    type: "daily",
    startedAt,
    completedAt,
  });

  return jsonResult({
    message:
      "Daily consolidation report ready. " +
      (duplicates.length > 0
        ? `Found ${duplicates.length} duplicate group(s) that may need dedup. ` +
          "For each group, keep the most specific/complete value and supersede the rest using memory_save_fact. "
        : "No duplicate facts found. ") +
      "Review today's facts and update USER.md/MEMORY.md with memory_update_core if needed.",
    consolidation_id: logId,
    stats: {
      total_facts: stats.total,
      current_facts: stats.current,
      superseded: stats.superseded,
      unreferenced: stats.unreferenced,
      created_today: stats.createdToday,
      top_entities: stats.topEntities,
    },
    duplicates: duplicates.map((group) => ({
      entity: group.entity,
      attribute: group.attribute,
      values: group.facts.map((f) => ({
        id: f.id,
        value: f.value,
        source: f.source,
        reference_count: f.reference_count,
        created_at: f.created_at,
      })),
    })),
    today_facts_count: todayFacts.length,
    today_facts_sample: todayFacts.slice(0, 20).map((f) => ({
      entity: f.entity,
      attribute: f.attribute,
      value: f.value,
      tags: f.tags,
      source: f.source,
    })),
  });
}

// ── Weekly Consolidation ─────────────────────────────────────────

async function runWeeklyConsolidation(manager: MemoryIndexManager, startedAt: string) {
  // Check if weekly already ran this week
  const lastRun = manager.getLastConsolidation("weekly");
  if (lastRun?.completedAt) {
    const elapsed = Date.now() - new Date(lastRun.completedAt).getTime();
    if (elapsed < 6 * 24 * 60 * 60 * 1000) {
      return jsonResult({
        message: "Weekly consolidation already ran this week. Skipping.",
        last_run: lastRun.completedAt,
      });
    }
  }

  // Apply expiry policies
  const expiryResult = manager.applyFactExpiry();

  // Find duplicates
  const duplicates = manager.findDuplicateFacts();

  // Get full stats
  const stats = manager.getFactStats();

  // Get high-reference-count facts (candidates for promotion to core memory)
  const recentFacts = manager.getRecentFacts({ limit: 200 });
  const promotionCandidates = recentFacts.filter(
    (f) => f.reference_count >= 3 && !f.tags.includes("type:surface"),
  );

  // Identify patterns: entities with many facts
  const entityFactCounts = new Map<string, number>();
  for (const fact of recentFacts) {
    entityFactCounts.set(fact.entity, (entityFactCounts.get(fact.entity) ?? 0) + 1);
  }
  const frequentEntities = Array.from(entityFactCounts.entries())
    .filter(([, count]) => count >= 3)
    .toSorted((a, b) => b[1] - a[1])
    .map(([entity, count]) => ({ entity, fact_count: count }));

  const completedAt = new Date().toISOString();

  // Log the consolidation run
  const logId = manager.logConsolidation({
    type: "weekly",
    factsInvalidated: expiryResult.invalidated,
    startedAt,
    completedAt,
  });

  return jsonResult({
    message:
      "Weekly consolidation report ready. " +
      (expiryResult.invalidated > 0
        ? `Expired ${expiryResult.invalidated} stale fact(s). `
        : "No facts expired. ") +
      (duplicates.length > 0 ? `Found ${duplicates.length} duplicate group(s) to review. ` : "") +
      (promotionCandidates.length > 0
        ? `${promotionCandidates.length} fact(s) are referenced 3+ times — consider promoting to USER.md/MEMORY.md. `
        : "") +
      "Use memory_update_core with action 'rewrite' to refresh core memory with current, verified facts.",
    consolidation_id: logId,
    expiry: {
      invalidated: expiryResult.invalidated,
      details: expiryResult.details.slice(0, 20),
    },
    stats: {
      total_facts: stats.total,
      current_facts: stats.current,
      superseded: stats.superseded,
      unreferenced: stats.unreferenced,
      top_entities: stats.topEntities,
    },
    duplicates: duplicates.slice(0, 10).map((group) => ({
      entity: group.entity,
      attribute: group.attribute,
      values: group.facts.map((f) => ({
        id: f.id,
        value: f.value,
        reference_count: f.reference_count,
        created_at: f.created_at,
      })),
    })),
    promotion_candidates: promotionCandidates.slice(0, 15).map((f) => ({
      entity: f.entity,
      attribute: f.attribute,
      value: f.value,
      reference_count: f.reference_count,
      tags: f.tags,
    })),
    frequent_entities: frequentEntities.slice(0, 10),
  });
}
