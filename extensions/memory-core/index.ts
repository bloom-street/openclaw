import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

const memoryCorePlugin = {
  id: "memory-core",
  name: "Memory (Core)",
  description: "File-backed memory tools, structured fact store, and CLI",
  kind: "memory",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerTool(
      (ctx) => {
        const opts = { config: ctx.config, agentSessionKey: ctx.sessionKey };
        const tools = [
          api.runtime.tools.createMemorySearchTool(opts),
          api.runtime.tools.createMemoryGetTool(opts),
          api.runtime.tools.createMemorySaveFactTool(opts),
          api.runtime.tools.createMemorySearchFactsTool(opts),
          api.runtime.tools.createMemoryUpdateCoreTool(opts),
          api.runtime.tools.createMemoryConsolidateTool(opts),
        ].filter(Boolean);
        return tools.length > 0 ? tools : null;
      },
      {
        names: [
          "memory_search",
          "memory_get",
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
