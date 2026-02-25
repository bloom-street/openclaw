import "./agent-scope-Cn3C2ptS.js";
import "./paths-C9do7WCN.js";
import "./subsystem-OjJSGqSf.js";
import "./workspace-CqHof6MR.js";
import "./model-selection-wi8K54ui.js";
import "./github-copilot-token-BkwQAVvU.js";
import "./env-1KrR5vLt.js";
import "./boolean-mcn6kL0s.js";
import { a as normalizeWhatsAppTarget, i as isWhatsAppGroupJid } from "./plugins-CusfI6F2.js";
import { t as resolveWhatsAppAccount } from "./accounts-BtvdrZM5.js";
import "./bindings-C3a3c5HV.js";
import "./image-ops-BeXtPfpf.js";
import "./message-channel-7XB7U9SO.js";
import "./config-BB8kMxZU.js";
import "./manifest-registry-CUs1bNb-.js";
import "./ssrf-BnuIFCPj.js";
import "./tool-images-CSJmog7A.js";
import "./fetch-guard-lOn4SJJB.js";
import { a as createActionGate, c as jsonResult, d as readReactionParams, i as ToolAuthorizationError, m as readStringParam, n as missingTargetError } from "./target-errors-CkkjsjXS.js";
import "./chunk-BAYd4en5.js";
import "./markdown-tables-tkPkLJc-.js";
import "./local-roots-B9dknNG2.js";
import "./ir-CRSYdN35.js";
import "./render-loap2gRq.js";
import "./tables-vnkiCzGg.js";
import { r as sendReactionWhatsApp } from "./outbound-DUApGGsA.js";

//#region src/whatsapp/resolve-outbound-target.ts
function resolveWhatsAppOutboundTarget(params) {
	const trimmed = params.to?.trim() ?? "";
	const allowListRaw = (params.allowFrom ?? []).map((entry) => String(entry).trim()).filter(Boolean);
	const hasWildcard = allowListRaw.includes("*");
	const allowList = allowListRaw.filter((entry) => entry !== "*").map((entry) => normalizeWhatsAppTarget(entry)).filter((entry) => Boolean(entry));
	if (trimmed) {
		const normalizedTo = normalizeWhatsAppTarget(trimmed);
		if (!normalizedTo) return {
			ok: false,
			error: missingTargetError("WhatsApp", "<E.164|group JID>")
		};
		if (isWhatsAppGroupJid(normalizedTo)) return {
			ok: true,
			to: normalizedTo
		};
		if (hasWildcard || allowList.length === 0) return {
			ok: true,
			to: normalizedTo
		};
		if (allowList.includes(normalizedTo)) return {
			ok: true,
			to: normalizedTo
		};
		return {
			ok: false,
			error: missingTargetError("WhatsApp", "<E.164|group JID>")
		};
	}
	return {
		ok: false,
		error: missingTargetError("WhatsApp", "<E.164|group JID>")
	};
}

//#endregion
//#region src/agents/tools/whatsapp-target-auth.ts
function resolveAuthorizedWhatsAppOutboundTarget(params) {
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const resolution = resolveWhatsAppOutboundTarget({
		to: params.chatJid,
		allowFrom: account.allowFrom ?? [],
		mode: "implicit"
	});
	if (!resolution.ok) throw new ToolAuthorizationError(`WhatsApp ${params.actionLabel} blocked: chatJid "${params.chatJid}" is not in the configured allowFrom list for account "${account.accountId}".`);
	return {
		to: resolution.to,
		accountId: account.accountId
	};
}

//#endregion
//#region src/agents/tools/whatsapp-actions.ts
async function handleWhatsAppAction(params, cfg) {
	const action = readStringParam(params, "action", { required: true });
	const isActionEnabled = createActionGate(cfg.channels?.whatsapp?.actions);
	if (action === "react") {
		if (!isActionEnabled("reactions")) throw new Error("WhatsApp reactions are disabled.");
		const chatJid = readStringParam(params, "chatJid", { required: true });
		const messageId = readStringParam(params, "messageId", { required: true });
		const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a WhatsApp reaction." });
		const participant = readStringParam(params, "participant");
		const accountId = readStringParam(params, "accountId");
		const fromMeRaw = params.fromMe;
		const fromMe = typeof fromMeRaw === "boolean" ? fromMeRaw : void 0;
		const resolved = resolveAuthorizedWhatsAppOutboundTarget({
			cfg,
			chatJid,
			accountId,
			actionLabel: "reaction"
		});
		const resolvedEmoji = remove ? "" : emoji;
		await sendReactionWhatsApp(resolved.to, messageId, resolvedEmoji, {
			verbose: false,
			fromMe,
			participant: participant ?? void 0,
			accountId: resolved.accountId
		});
		if (!remove && !isEmpty) return jsonResult({
			ok: true,
			added: emoji
		});
		return jsonResult({
			ok: true,
			removed: true
		});
	}
	throw new Error(`Unsupported WhatsApp action: ${action}`);
}

//#endregion
export { handleWhatsAppAction };