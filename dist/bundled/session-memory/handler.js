import { s as resolveAgentWorkspaceDir } from "../../agent-scope-Cn3C2ptS.js";
import { s as resolveStateDir } from "../../paths-C9do7WCN.js";
import { t as createSubsystemLogger } from "../../subsystem-OjJSGqSf.js";
import { l as resolveAgentIdFromSessionKey } from "../../session-key-YGVrIVO5.js";
import "../../workspace-CqHof6MR.js";
import "../../model-selection-wi8K54ui.js";
import "../../github-copilot-token-BkwQAVvU.js";
import "../../env-1KrR5vLt.js";
import "../../boolean-mcn6kL0s.js";
import "../../tokens-B_0Z9EXZ.js";
import "../../pi-embedded-DDz-RJaN.js";
import "../../plugins-CusfI6F2.js";
import "../../accounts-BtvdrZM5.js";
import "../../bindings-C3a3c5HV.js";
import "../../send-DQXaWkG6.js";
import "../../send-DD5zlB-I.js";
import "../../deliver-SW4X-VSy.js";
import "../../diagnostic-CV-iGwD-.js";
import "../../diagnostic-session-state-C0Sxjfox.js";
import "../../accounts-Db1Y0y43.js";
import "../../send-BimVB67k.js";
import "../../image-ops-BeXtPfpf.js";
import "../../pi-model-discovery-C-yOXpma.js";
import "../../message-channel-7XB7U9SO.js";
import "../../pi-embedded-helpers-Nkel9jt9.js";
import "../../config-BB8kMxZU.js";
import "../../manifest-registry-CUs1bNb-.js";
import "../../dock-Cvml5LES.js";
import "../../chrome-DAq4h-x-.js";
import "../../ssrf-BnuIFCPj.js";
import "../../frontmatter-CYyVkHva.js";
import "../../skills-DWsO7kgP.js";
import "../../redact-DMW6QgGu.js";
import "../../errors-DIsGKZHp.js";
import "../../store-C9BdIBuE.js";
import { O as hasInterSessionUserProvenance } from "../../sessions-DKdDjs2z.js";
import "../../accounts-zzqNS5JN.js";
import "../../paths-CLWDvYDE.js";
import "../../tool-images-CSJmog7A.js";
import "../../thinking-CJoHneR6.js";
import "../../image-CLOK6lEA.js";
import "../../reply-prefix-Ba3CGNHY.js";
import "../../manager-CuHPA-Qi.js";
import "../../gemini-auth-DUMxnS68.js";
import "../../fetch-guard-lOn4SJJB.js";
import "../../query-expansion-B9SNqtjP.js";
import "../../retry-CQJMQLyQ.js";
import "../../target-errors-CkkjsjXS.js";
import "../../chunk-BAYd4en5.js";
import "../../markdown-tables-tkPkLJc-.js";
import "../../local-roots-B9dknNG2.js";
import "../../ir-CRSYdN35.js";
import "../../render-loap2gRq.js";
import "../../commands-registry-GFy9Dx2Y.js";
import "../../skill-commands-_57k9F4b.js";
import "../../runner-0wsR1Jhq.js";
import "../../fetch-B1nZSYJF.js";
import "../../channel-activity-BhCtwPtR.js";
import "../../tables-vnkiCzGg.js";
import "../../send-C2MbICz8.js";
import "../../outbound-attachment-DEJb2V-g.js";
import "../../send-N50ns2Ar.js";
import "../../resolve-route-DSXl_Ooh.js";
import "../../proxy-Bee2aKQk.js";
import "../../replies-a7LJXbFV.js";
import { generateSlugViaLLM } from "../../llm-slug-generator.js";
import { t as resolveHookConfig } from "../../config-BeIwBEE4.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/bundled/session-memory/handler.ts
/**
* Session memory hook handler
*
* Saves session context to memory when /new or /reset command is triggered
* Creates a new dated memory file with LLM-generated slug
*/
const log = createSubsystemLogger("hooks/session-memory");
/**
* Read recent messages from session file for slug generation
*/
async function getRecentSessionContent(sessionFilePath, messageCount = 15) {
	try {
		const lines = (await fs.readFile(sessionFilePath, "utf-8")).trim().split("\n");
		const allMessages = [];
		for (const line of lines) try {
			const entry = JSON.parse(line);
			if (entry.type === "message" && entry.message) {
				const msg = entry.message;
				const role = msg.role;
				if ((role === "user" || role === "assistant") && msg.content) {
					if (role === "user" && hasInterSessionUserProvenance(msg)) continue;
					const text = Array.isArray(msg.content) ? msg.content.find((c) => c.type === "text")?.text : msg.content;
					if (text && !text.startsWith("/")) allMessages.push(`${role}: ${text}`);
				}
			}
		} catch {}
		return allMessages.slice(-messageCount).join("\n");
	} catch {
		return null;
	}
}
/**
* Try the active transcript first; if /new already rotated it,
* fallback to the latest .jsonl.reset.* sibling.
*/
async function getRecentSessionContentWithResetFallback(sessionFilePath, messageCount = 15) {
	const primary = await getRecentSessionContent(sessionFilePath, messageCount);
	if (primary) return primary;
	try {
		const dir = path.dirname(sessionFilePath);
		const resetPrefix = `${path.basename(sessionFilePath)}.reset.`;
		const resetCandidates = (await fs.readdir(dir)).filter((name) => name.startsWith(resetPrefix)).toSorted();
		if (resetCandidates.length === 0) return primary;
		const latestResetPath = path.join(dir, resetCandidates[resetCandidates.length - 1]);
		const fallback = await getRecentSessionContent(latestResetPath, messageCount);
		if (fallback) log.debug("Loaded session content from reset fallback", {
			sessionFilePath,
			latestResetPath
		});
		return fallback || primary;
	} catch {
		return primary;
	}
}
function stripResetSuffix(fileName) {
	const resetIndex = fileName.indexOf(".reset.");
	return resetIndex === -1 ? fileName : fileName.slice(0, resetIndex);
}
async function findPreviousSessionFile(params) {
	try {
		const files = await fs.readdir(params.sessionsDir);
		const fileSet = new Set(files);
		const baseFromReset = params.currentSessionFile ? stripResetSuffix(path.basename(params.currentSessionFile)) : void 0;
		if (baseFromReset && fileSet.has(baseFromReset)) return path.join(params.sessionsDir, baseFromReset);
		const trimmedSessionId = params.sessionId?.trim();
		if (trimmedSessionId) {
			const canonicalFile = `${trimmedSessionId}.jsonl`;
			if (fileSet.has(canonicalFile)) return path.join(params.sessionsDir, canonicalFile);
			const topicVariants = files.filter((name) => name.startsWith(`${trimmedSessionId}-topic-`) && name.endsWith(".jsonl") && !name.includes(".reset.")).toSorted().toReversed();
			if (topicVariants.length > 0) return path.join(params.sessionsDir, topicVariants[0]);
		}
		if (!params.currentSessionFile) return;
		const nonResetJsonl = files.filter((name) => name.endsWith(".jsonl") && !name.includes(".reset.")).toSorted().toReversed();
		if (nonResetJsonl.length > 0) return path.join(params.sessionsDir, nonResetJsonl[0]);
	} catch {}
}
/**
* Save session context to memory when /new or /reset command is triggered
*/
const saveSessionToMemory = async (event) => {
	const isResetCommand = event.action === "new" || event.action === "reset";
	if (event.type !== "command" || !isResetCommand) return;
	try {
		log.debug("Hook triggered for reset/new command", { action: event.action });
		const context = event.context || {};
		const cfg = context.cfg;
		const agentId = resolveAgentIdFromSessionKey(event.sessionKey);
		const workspaceDir = cfg ? resolveAgentWorkspaceDir(cfg, agentId) : path.join(resolveStateDir(process.env, os.homedir), "workspace");
		const memoryDir = path.join(workspaceDir, "memory");
		await fs.mkdir(memoryDir, { recursive: true });
		const now = new Date(event.timestamp);
		const dateStr = now.toISOString().split("T")[0];
		const sessionEntry = context.previousSessionEntry || context.sessionEntry || {};
		const currentSessionId = sessionEntry.sessionId;
		let currentSessionFile = sessionEntry.sessionFile || void 0;
		if (!currentSessionFile || currentSessionFile.includes(".reset.")) {
			const sessionsDirs = /* @__PURE__ */ new Set();
			if (currentSessionFile) sessionsDirs.add(path.dirname(currentSessionFile));
			sessionsDirs.add(path.join(workspaceDir, "sessions"));
			for (const sessionsDir of sessionsDirs) {
				const recoveredSessionFile = await findPreviousSessionFile({
					sessionsDir,
					currentSessionFile,
					sessionId: currentSessionId
				});
				if (!recoveredSessionFile) continue;
				currentSessionFile = recoveredSessionFile;
				log.debug("Found previous session file", { file: currentSessionFile });
				break;
			}
		}
		log.debug("Session context resolved", {
			sessionId: currentSessionId,
			sessionFile: currentSessionFile,
			hasCfg: Boolean(cfg)
		});
		const sessionFile = currentSessionFile || void 0;
		const hookConfig = resolveHookConfig(cfg, "session-memory");
		const messageCount = typeof hookConfig?.messages === "number" && hookConfig.messages > 0 ? hookConfig.messages : 15;
		let slug = null;
		let sessionContent = null;
		if (sessionFile) {
			sessionContent = await getRecentSessionContentWithResetFallback(sessionFile, messageCount);
			log.debug("Session content loaded", {
				length: sessionContent?.length ?? 0,
				messageCount
			});
			const allowLlmSlug = !(process.env.OPENCLAW_TEST_FAST === "1" || process.env.VITEST === "true" || process.env.VITEST === "1" || false) && hookConfig?.llmSlug !== false;
			if (sessionContent && cfg && allowLlmSlug) {
				log.debug("Calling generateSlugViaLLM...");
				slug = await generateSlugViaLLM({
					sessionContent,
					cfg
				});
				log.debug("Generated slug", { slug });
			}
		}
		if (!slug) {
			slug = now.toISOString().split("T")[1].split(".")[0].replace(/:/g, "").slice(0, 4);
			log.debug("Using fallback timestamp slug", { slug });
		}
		const filename = `${dateStr}-${slug}.md`;
		const memoryFilePath = path.join(memoryDir, filename);
		log.debug("Memory file path resolved", {
			filename,
			path: memoryFilePath.replace(os.homedir(), "~")
		});
		const timeStr = now.toISOString().split("T")[1].split(".")[0];
		const sessionId = sessionEntry.sessionId || "unknown";
		const source = context.commandSource || "unknown";
		const entryParts = [
			`# Session: ${dateStr} ${timeStr} UTC`,
			"",
			`- **Session Key**: ${event.sessionKey}`,
			`- **Session ID**: ${sessionId}`,
			`- **Source**: ${source}`,
			""
		];
		if (sessionContent) entryParts.push("## Conversation Summary", "", sessionContent, "");
		const entry = entryParts.join("\n");
		await fs.writeFile(memoryFilePath, entry, "utf-8");
		log.debug("Memory file written successfully");
		const relPath = memoryFilePath.replace(os.homedir(), "~");
		log.info(`Session context saved to ${relPath}`);
	} catch (err) {
		if (err instanceof Error) log.error("Failed to save session memory", {
			errorName: err.name,
			errorMessage: err.message,
			stack: err.stack
		});
		else log.error("Failed to save session memory", { error: String(err) });
	}
};

//#endregion
export { saveSessionToMemory as default };