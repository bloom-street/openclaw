import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const memoryCorePlugin = {
  id: "memory-core",
  name: "Memory (Core)",
  description: "File-backed memory search tools and CLI",
  kind: "memory",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerTool(
      (ctx) => {
        const memorySearchTool = api.runtime.tools.createMemorySearchTool({
          config: ctx.config,
          agentSessionKey: ctx.sessionKey,
        });
        const memoryGetTool = api.runtime.tools.createMemoryGetTool({
          config: ctx.config,
          agentSessionKey: ctx.sessionKey,
        });
        if (!memorySearchTool || !memoryGetTool) {
          return null;
        }
        return [memorySearchTool, memoryGetTool];
      },
      { names: ["memory_search", "memory_get"] },
    );

    // Fact store tools (FTS5-based, no embedding provider required)
    api.registerTool(
      (ctx) => {
        const saveFactTool = api.runtime.tools.createMemorySaveFactTool({
          config: ctx.config,
        });
        const searchFactsTool = api.runtime.tools.createMemorySearchFactsTool({
          config: ctx.config,
        });
        const updateCoreTool = api.runtime.tools.createMemoryUpdateCoreTool({
          config: ctx.config,
        });
        const consolidateTool = api.runtime.tools.createMemoryConsolidateTool({
          config: ctx.config,
        });
        const tools = [saveFactTool, searchFactsTool, updateCoreTool, consolidateTool].filter(
          Boolean,
        );
        return tools.length > 0 ? tools : null;
      },
      {
        names: [
          "memory_save_fact",
          "memory_search_facts",
          "memory_update_core",
          "memory_consolidate",
        ],
      },
    );

    api.registerCli(
      ({ program }) => {
        api.runtime.tools.registerMemoryCli(program);
      },
      { commands: ["memory"] },
    );
  },
};

export default memoryCorePlugin;
