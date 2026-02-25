import type { OpenClawConfig } from "../../config/config.js";
import type { AnyAgentTool } from "./common.js";
export declare function createMemoryConsolidateTool(options: {
    config?: OpenClawConfig;
    agentSessionKey?: string;
}): AnyAgentTool | null;
