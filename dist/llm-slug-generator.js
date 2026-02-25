import { c as resolveDefaultAgentId, i as resolveAgentEffectiveModelPrimary, r as resolveAgentDir, s as resolveAgentWorkspaceDir } from "./agent-scope-Cn3C2ptS.js";
import "./paths-C9do7WCN.js";
import { t as createSubsystemLogger } from "./subsystem-OjJSGqSf.js";
import "./workspace-CqHof6MR.js";
import { it as DEFAULT_PROVIDER, l as parseModelRef, rt as DEFAULT_MODEL } from "./model-selection-wi8K54ui.js";
import "./github-copilot-token-BkwQAVvU.js";
import "./env-1KrR5vLt.js";
import "./boolean-mcn6kL0s.js";
import "./tokens-B_0Z9EXZ.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-D5hTs5-T.js";
import "./plugins-CusfI6F2.js";
import "./accounts-BtvdrZM5.js";
import "./bindings-C3a3c5HV.js";
import "./send-DQXaWkG6.js";
import "./send-DD5zlB-I.js";
import "./deliver-DQKw7qo9.js";
import "./diagnostic-CV-iGwD-.js";
import "./diagnostic-session-state-C0Sxjfox.js";
import "./accounts-Db1Y0y43.js";
import "./send-BimVB67k.js";
import "./image-ops-BeXtPfpf.js";
import "./pi-model-discovery-C-yOXpma.js";
import "./message-channel-7XB7U9SO.js";
import "./pi-embedded-helpers-Dko8Zqt0.js";
import "./config-BB8kMxZU.js";
import "./manifest-registry-CUs1bNb-.js";
import "./dock-Cvml5LES.js";
import "./chrome-DAq4h-x-.js";
import "./ssrf-BnuIFCPj.js";
import "./frontmatter-CYyVkHva.js";
import "./skills-DWsO7kgP.js";
import "./redact-DMW6QgGu.js";
import "./errors-DIsGKZHp.js";
import "./store-C9BdIBuE.js";
import "./sessions-DKdDjs2z.js";
import "./accounts-zzqNS5JN.js";
import "./paths-CLWDvYDE.js";
import "./tool-images-CSJmog7A.js";
import "./thinking-CJoHneR6.js";
import "./image-veCsPKhF.js";
import "./reply-prefix-Ba3CGNHY.js";
import "./manager-JTecfzez.js";
import "./gemini-auth-DUMxnS68.js";
import "./fetch-guard-lOn4SJJB.js";
import "./query-expansion-B9SNqtjP.js";
import "./retry-CQJMQLyQ.js";
import "./target-errors-CkkjsjXS.js";
import "./chunk-BAYd4en5.js";
import "./markdown-tables-tkPkLJc-.js";
import "./local-roots-B9dknNG2.js";
import "./ir-CRSYdN35.js";
import "./render-loap2gRq.js";
import "./commands-registry-GFy9Dx2Y.js";
import "./skill-commands-_57k9F4b.js";
import "./runner-CqBClXBe.js";
import "./fetch-B1nZSYJF.js";
import "./channel-activity-BhCtwPtR.js";
import "./tables-vnkiCzGg.js";
import "./send-C2MbICz8.js";
import "./outbound-attachment-DEJb2V-g.js";
import "./send-N50ns2Ar.js";
import "./resolve-route-DSXl_Ooh.js";
import "./proxy-Bee2aKQk.js";
import "./replies-a7LJXbFV.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/llm-slug-generator.ts
/**
* LLM-based slug generator for session memory filenames
*/
const log = createSubsystemLogger("llm-slug-generator");
/**
* Generate a short 1-2 word filename slug from session content using LLM
*/
async function generateSlugViaLLM(params) {
	let tempSessionFile = null;
	try {
		const agentId = resolveDefaultAgentId(params.cfg);
		const workspaceDir = resolveAgentWorkspaceDir(params.cfg, agentId);
		const agentDir = resolveAgentDir(params.cfg, agentId);
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-slug-"));
		tempSessionFile = path.join(tempDir, "session.jsonl");
		const prompt = `Based on this conversation, generate a short 1-2 word filename slug (lowercase, hyphen-separated, no file extension).

Conversation summary:
${params.sessionContent.slice(0, 2e3)}

Reply with ONLY the slug, nothing else. Examples: "vendor-pitch", "api-design", "bug-fix"`;
		const modelRef = resolveAgentEffectiveModelPrimary(params.cfg, agentId);
		const parsed = modelRef ? parseModelRef(modelRef, DEFAULT_PROVIDER) : null;
		const provider = parsed?.provider ?? DEFAULT_PROVIDER;
		const model = parsed?.model ?? DEFAULT_MODEL;
		const result = await runEmbeddedPiAgent({
			sessionId: `slug-generator-${Date.now()}`,
			sessionKey: "temp:slug-generator",
			agentId,
			sessionFile: tempSessionFile,
			workspaceDir,
			agentDir,
			config: params.cfg,
			prompt,
			provider,
			model,
			timeoutMs: 15e3,
			runId: `slug-gen-${Date.now()}`
		});
		if (result.payloads && result.payloads.length > 0) {
			const text = result.payloads[0]?.text;
			if (text) return text.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || null;
		}
		return null;
	} catch (err) {
		const message = err instanceof Error ? err.stack ?? err.message : String(err);
		log.error(`Failed to generate slug: ${message}`);
		return null;
	} finally {
		if (tempSessionFile) try {
			await fs.rm(path.dirname(tempSessionFile), {
				recursive: true,
				force: true
			});
		} catch {}
	}
}

//#endregion
export { generateSlugViaLLM };