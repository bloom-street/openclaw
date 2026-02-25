import { r as resolveWhatsAppAccount } from "./accounts-CR5voC9r.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./plugins-BHWQdgX0.js";
import "./subsystem-loAAXGlc.js";
import "./config-CizIEHaM.js";
import "./command-format-DI57or3f.js";
import "./model-selection-BosKk3MZ.js";
import "./agent-scope-CdRMHY-e.js";
import "./manifest-registry-Bp7G4UCL.js";
import "./image-ops-BFqsv6C1.js";
import "./ssrf-CnX37IfG.js";
import "./fetch-guard-CpixodvE.js";
import "./local-roots-Bxw9w4l7.js";
import "./ir-Bf_y_eZk.js";
import "./chunk-FbIfxd34.js";
import "./message-channel-BFQTPrdc.js";
import "./bindings-z9sNcO29.js";
import "./markdown-tables-DoVnAJJw.js";
import "./render-3_VJ30aR.js";
import "./tables-BP0M0jzF.js";
import "./tool-images-1es22JxN.js";
import { a as createActionGate, c as jsonResult, d as readReactionParams, i as ToolAuthorizationError, m as readStringParam } from "./target-errors-vjh2a7Ly.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-ymYjtzYm.js";
import { r as sendReactionWhatsApp } from "./outbound-CeABwcDp.js";

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