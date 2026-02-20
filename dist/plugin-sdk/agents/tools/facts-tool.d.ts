import type { OpenClawConfig } from "../../config/config.js";
import type { AnyAgentTool } from "./common.js";
export declare function createMemorySaveFactTool(options: {
    config?: OpenClawConfig;
    agentSessionKey?: string;
}): AnyAgentTool | null;
export declare function createMemorySearchFactsTool(options: {
    config?: OpenClawConfig;
    agentSessionKey?: string;
}): AnyAgentTool | null;
export declare function createMemoryUpdateCoreTool(options: {
    config?: OpenClawConfig;
    agentSessionKey?: string;
}): AnyAgentTool | null;
