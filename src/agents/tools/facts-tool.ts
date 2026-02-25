import { Type } from "@sinclair/typebox";
import fs from "node:fs";
import path from "node:path";
import type { OpenClawConfig } from "../../config/config.js";
import type { AnyAgentTool } from "./common.js";
import { MemoryIndexManager } from "../../memory/manager.js";
import { resolveSessionAgentId } from "../agent-scope.js";
import { resolveMemorySearchConfig } from "../memory-search.js";
import { jsonResult, readNumberParam, readStringArrayParam, readStringParam } from "./common.js";

// ── Schemas ───────────────────────────────────────────────────────

const SaveFactSchema = Type.Object({
  entity: Type.String(),
  attribute: Type.String(),
  value: Type.String(),
  tags: Type.Optional(Type.Array(Type.String())),
  confidence: Type.Optional(Type.Number()),
});

const SearchFactsSchema = Type.Object({
  query: Type.String(),
  entity: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  include_historical: Type.Optional(Type.Boolean()),
  limit: Type.Optional(Type.Number()),
});

const UpdateCoreSchema = Type.Object({
  file: Type.Union([Type.Literal("USER.md"), Type.Literal("MEMORY.md")]),
  action: Type.Union([
    Type.Literal("append_section"),
    Type.Literal("replace_section"),
    Type.Literal("append_line"),
    Type.Literal("rewrite"),
  ]),
  section: Type.Optional(Type.String()),
  content: Type.String(),
});

// ── Helpers ───────────────────────────────────────────────────────

const CORE_FILE_CHAR_LIMIT = 5000;

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
  return MemoryIndexManager.getFactsOnly({ cfg, agentId });
}

// ── memory_save_fact ──────────────────────────────────────────────

export function createMemorySaveFactTool(options: {
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
    label: "Save Fact",
    name: "memory_save_fact",
    description:
      "Save a structured fact about the user, a person, project, preference, or decision. " +
      "Facts are entity/attribute/value triples with temporal tracking. " +
      "If a fact with the same entity+attribute already exists with a different value, " +
      "the old fact is superseded (not deleted) and the new one becomes current.",
    parameters: SaveFactSchema,
    execute: async (_toolCallId, params) => {
      const entity = readStringParam(params, "entity", { required: true });
      const attribute = readStringParam(params, "attribute", { required: true });
      const value = readStringParam(params, "value", { required: true });
      const tags = readStringArrayParam(params, "tags");
      const confidence = readNumberParam(params, "confidence");

      const manager = await getManager(options);
      if (!manager) {
        return jsonResult({ error: "Memory system not available." });
      }

      try {
        const result = manager.saveFact({
          entity,
          attribute,
          value,
          tags: tags ?? undefined,
          confidence: confidence ?? undefined,
        });
        return jsonResult(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResult({ error: message });
      }
    },
  };
}

// ── memory_search_facts ───────────────────────────────────────────

export function createMemorySearchFactsTool(options: {
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
    label: "Search Facts",
    name: "memory_search_facts",
    description:
      "Search the structured fact store. Use this BEFORE memory_search for quick recalls " +
      "(names, preferences, dates, people, projects). Returns entity/attribute/value facts " +
      "ranked by relevance. Only escalate to memory_search if facts search doesn't find what you need.",
    parameters: SearchFactsSchema,
    execute: async (_toolCallId, params) => {
      const query = readStringParam(params, "query", { required: true });
      const entity = readStringParam(params, "entity");
      const tags = readStringArrayParam(params, "tags");
      const includeHistorical = params.include_historical === true;
      const limit = readNumberParam(params, "limit", { integer: true });

      const manager = await getManager(options);
      if (!manager) {
        return jsonResult({ results: [], count: 0, error: "Memory system not available." });
      }

      try {
        const result = manager.searchFacts({
          query,
          entity: entity ?? undefined,
          tags: tags ?? undefined,
          includeHistorical,
          limit: limit ?? undefined,
        });
        return jsonResult(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResult({ results: [], count: 0, error: message });
      }
    },
  };
}

// ── memory_update_core ────────────────────────────────────────────

export function createMemoryUpdateCoreTool(options: {
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
    label: "Update Core Memory",
    name: "memory_update_core",
    description:
      "Edit USER.md or MEMORY.md using section-based operations. " +
      "Actions: append_section (add new ## section), replace_section (replace content under existing ## header), " +
      "append_line (add line to section or end), rewrite (full file rewrite for consolidation). " +
      "Returns character counts so you know remaining capacity.",
    parameters: UpdateCoreSchema,
    execute: async (_toolCallId, params) => {
      const file = readStringParam(params, "file", { required: true }) as "USER.md" | "MEMORY.md";
      const action = readStringParam(params, "action", { required: true }) as
        | "append_section"
        | "replace_section"
        | "append_line"
        | "rewrite";
      const section = readStringParam(params, "section");
      const content = readStringParam(params, "content", { required: true, trim: false });

      if (!["USER.md", "MEMORY.md"].includes(file)) {
        return jsonResult({ error: "file must be USER.md or MEMORY.md" });
      }
      if (
        (action === "append_section" || action === "replace_section" || action === "append_line") &&
        !section &&
        action !== "append_line"
      ) {
        return jsonResult({ error: `section is required for ${action}` });
      }

      const manager = await getManager(options);
      if (!manager) {
        return jsonResult({ error: "Memory system not available." });
      }

      try {
        const workspaceDir = manager.getWorkspaceDir();
        const filePath = path.join(workspaceDir, file);

        // Read existing content
        let existing = "";
        try {
          existing = fs.readFileSync(filePath, "utf-8");
        } catch {
          // File doesn't exist yet, start empty
        }

        let updated: string;

        switch (action) {
          case "append_section": {
            if (!section) {
              return jsonResult({ error: "section is required for append_section" });
            }
            const sectionHeader = section.startsWith("#") ? section : `## ${section}`;
            if (existing.trim().length === 0) {
              updated = `${sectionHeader}\n${content}\n`;
            } else {
              updated = existing.trimEnd() + `\n\n${sectionHeader}\n${content}\n`;
            }
            break;
          }
          case "replace_section": {
            if (!section) {
              return jsonResult({ error: "section is required for replace_section" });
            }
            const sectionName = section.replace(/^#+\s*/, "");
            const bounds = findSectionBounds(existing, sectionName);
            if (!bounds) {
              return jsonResult({
                error: `Section "${sectionName}" not found in ${file}. Use append_section to create it.`,
              });
            }
            updated =
              existing.slice(0, bounds.headerStart) +
              bounds.headerLine +
              "\n" +
              content +
              "\n" +
              existing.slice(bounds.contentEnd);
            break;
          }
          case "append_line": {
            if (section) {
              const sectionName = section.replace(/^#+\s*/, "");
              const bounds = findSectionBounds(existing, sectionName);
              if (!bounds) {
                return jsonResult({
                  error: `Section "${sectionName}" not found in ${file}.`,
                });
              }
              updated =
                existing.slice(0, bounds.contentEnd).trimEnd() +
                "\n" +
                content +
                "\n" +
                existing.slice(bounds.contentEnd);
            } else {
              updated = existing.trimEnd() + "\n" + content + "\n";
            }
            break;
          }
          case "rewrite": {
            updated = content;
            break;
          }
          default:
            return jsonResult({ error: `Unknown action: ${String(action)}` });
        }

        // Enforce size limit
        if (updated.length > CORE_FILE_CHAR_LIMIT) {
          return jsonResult({
            error: `Would exceed ${CORE_FILE_CHAR_LIMIT} char limit (result: ${updated.length} chars). Reduce content or use rewrite with a condensed version.`,
            chars_used: existing.length,
            chars_limit: CORE_FILE_CHAR_LIMIT,
          });
        }

        fs.writeFileSync(filePath, updated, "utf-8");

        return jsonResult({
          message: `${file} updated (${action}).`,
          chars_used: updated.length,
          chars_limit: CORE_FILE_CHAR_LIMIT,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResult({ error: message });
      }
    },
  };
}

/**
 * Find a markdown section by name. Returns the byte offsets for the header line
 * and the content block (everything between this header and the next header or EOF).
 * Uses line-based scanning instead of regex to avoid multiline flag issues.
 */
function findSectionBounds(
  text: string,
  sectionName: string,
): { headerStart: number; headerLine: string; contentStart: number; contentEnd: number } | null {
  const lines = text.split("\n");
  const target = sectionName.toLowerCase();
  let offset = 0;
  let headerStart = -1;
  let headerLine = "";
  let contentStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStart = offset;
    offset += line.length + 1; // +1 for \n

    const headerMatch = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (!headerMatch) {
      continue;
    }

    const name = headerMatch[2].toLowerCase();

    if (headerStart === -1) {
      // Looking for the target section
      if (name === target) {
        headerStart = lineStart;
        headerLine = line;
        contentStart = offset; // byte after the header's \n
      }
    } else {
      // Found the target earlier — this is the next header, so content ends here
      return { headerStart, headerLine, contentStart, contentEnd: lineStart };
    }
  }

  if (headerStart !== -1) {
    // Target section is the last section — content extends to EOF
    return { headerStart, headerLine, contentStart, contentEnd: text.length };
  }

  return null;
}
