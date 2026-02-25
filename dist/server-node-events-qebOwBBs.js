import { v as defaultRuntime } from "./entry.js";
import "./auth-profiles-D22D1tnt.js";
import { f as resolveSessionAgentId } from "./agent-scope-Coy2hU9C.js";
import { c as normalizeMainKey } from "./session-key-DIABCrXz.js";
import "./exec-G9-WTRVN.js";
import "./github-copilot-token-RNgXBxZS.js";
import "./host-env-security-DyQuUnEd.js";
import "./model-PL9Vv3mu.js";
import "./pi-model-discovery-CwESh4K1.js";
import "./frontmatter-17nP3KZr.js";
import "./skills-CWeJXlIQ.js";
import "./manifest-registry-BPlNBgie.js";
import { i as loadConfig } from "./config-8-je4WFT.js";
import "./env-vars-iFkEK4MO.js";
import "./dock-vJULnCiC.js";
import "./message-channel-CIQTys4Q.js";
import { h as updateSessionStore } from "./sessions-DnWz3mBp.js";
import { r as normalizeChannelId } from "./plugins-DvKi6MS1.js";
import "./accounts-g8UOA9ZQ.js";
import "./accounts-iAP56FFD.js";
import "./accounts-B7WS3ElX.js";
import "./bindings-BbU737An.js";
import "./logging-CFvkxgcX.js";
import "./send-BI_oS-O2.js";
import "./send-BQqBpjvF.js";
import { A as createOutboundSendDeps, E as agentCommand, Tn as requestHeartbeatNow, pt as resolveOutboundTarget, xn as enqueueSystemEvent } from "./subagent-registry-Dw-friub.js";
import "./paths-Dvmk_rXi.js";
import "./chat-envelope-BG_U_muK.js";
import "./client-BtjXMOD6.js";
import "./call-DPV6oCJz.js";
import "./pairing-token-qLzAsGdq.js";
import "./net-BEAjYacy.js";
import "./ip-m9Sjsn1o.js";
import "./tailnet-BOWO-AaH.js";
import "./tokens-D60Twogq.js";
import "./with-timeout-Cnopj6MR.js";
import { t as deliverOutboundPayloads } from "./deliver-9xjVesO1.js";
import "./diagnostic-J4rp2SRl.js";
import "./diagnostic-session-state-CT36_PCE.js";
import "./send-BwQmBBRl.js";
import "./image-ops-CdtmwUCR.js";
import "./pi-embedded-helpers-CUnO4-yq.js";
import "./sandbox-g9sAo3Nf.js";
import "./tool-catalog-DfeHwYkI.js";
import "./chrome-CANFQ1CL.js";
import "./tailscale-B21pc9dr.js";
import "./auth-Dw00sIWu.js";
import "./server-context-BDt9HA5B.js";
import "./redact-CjuqjXFe.js";
import "./errors-DjnYuRJy.js";
import "./fs-safe-Cwp1VOPx.js";
import "./trash-CX7nB-3e.js";
import "./ssrf-BjDQh-0k.js";
import "./store-CP7czNHW.js";
import "./ports-CCM0e3iq.js";
import "./server-middleware-ti_BzwRQ.js";
import "./tool-images-DfuwmJ1p.js";
import "./thinking-BF74hBT8.js";
import "./models-config-C5xBkghi.js";
import "./exec-approvals-allowlist-BjFQS72U.js";
import "./exec-safe-bin-runtime-policy-D0oN33zd.js";
import "./reply-prefix-qWQjldya.js";
import "./manager-CoPj1rZi.js";
import "./gemini-auth-DN4H9iDm.js";
import "./fetch-guard-Dr618l5w.js";
import "./query-expansion-BI-SeFWF.js";
import "./retry-BpId8ooT.js";
import "./target-errors-DC5XTZKh.js";
import "./memory-cli-BsxoaEGv.js";
import "./chunk-BvqBAgzS.js";
import "./markdown-tables-DQTjtBah.js";
import "./local-roots-COWFLIjh.js";
import "./ir-CzZBRKhG.js";
import "./render-Bdn0My43.js";
import "./commands-BYJbc8Zu.js";
import "./commands-registry-C7HAdU56.js";
import "./image-CKyFOMEz.js";
import "./tool-display-Dgs8w-fd.js";
import "./runner-BRV4W8vJ.js";
import "./model-catalog-CpS_x7oW.js";
import "./pairing-store-1rtMKGCJ.js";
import "./fetch-SlSeGGhh.js";
import "./exec-approvals-B-M763CP.js";
import "./nodes-screen-BPGhiVFW.js";
import { c as resolveGatewaySessionStoreTarget, o as loadSessionEntry, s as pruneLegacyStoreKeys } from "./session-utils-DeyAFUX0.js";
import "./session-cost-usage-CvGuEEE6.js";
import "./skill-commands-D4Z4G94U.js";
import "./workspace-dirs-89PKlkQ6.js";
import "./channel-activity-DwztdGg8.js";
import "./tables-v6PcGfjo.js";
import "./server-lifecycle-BqO0h382.js";
import "./stagger-wClkZ9EC.js";
import "./channel-selection-BHkr2O0z.js";
import "./send-MOrPjcYX.js";
import "./outbound-attachment-C4fRhB3G.js";
import "./delivery-queue-ChFqRLAV.js";
import "./send-C5qGxwtz.js";
import "./resolve-route-BHtIWRaf.js";
import "./proxy-WehDGK1u.js";
import "./links-DNSoSnpZ.js";
import "./cli-utils-DyGKoc5l.js";
import "./help-format-CSCL71i7.js";
import "./progress-NYYdD1uh.js";
import "./replies-VOQW8ITc.js";
import "./onboard-helpers-DrCs3JdA.js";
import "./prompt-style-EoDyMHYF.js";
import "./pairing-labels-Ckll1_Oi.js";
import "./pi-tools.policy-3Jqks9s8.js";
import { c as parseMessageWithAttachments, l as formatForLog, r as registerApnsToken, s as normalizeRpcAttachmentsToChatAttachments } from "./push-apns-C_mGrqQS.js";
import { randomUUID } from "node:crypto";

//#region src/gateway/server-node-events.ts
const MAX_EXEC_EVENT_OUTPUT_CHARS = 180;
const VOICE_TRANSCRIPT_DEDUPE_WINDOW_MS = 1500;
const MAX_RECENT_VOICE_TRANSCRIPTS = 200;
const recentVoiceTranscripts = /* @__PURE__ */ new Map();
function normalizeNonEmptyString(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function normalizeFiniteInteger(value) {
	return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : null;
}
function resolveVoiceTranscriptFingerprint(obj, text) {
	const eventId = normalizeNonEmptyString(obj.eventId) ?? normalizeNonEmptyString(obj.providerEventId) ?? normalizeNonEmptyString(obj.transcriptId);
	if (eventId) return `event:${eventId}`;
	const callId = normalizeNonEmptyString(obj.providerCallId) ?? normalizeNonEmptyString(obj.callId);
	const sequence = normalizeFiniteInteger(obj.sequence) ?? normalizeFiniteInteger(obj.seq);
	if (callId && sequence !== null) return `call-seq:${callId}:${sequence}`;
	const eventTimestamp = normalizeFiniteInteger(obj.timestamp) ?? normalizeFiniteInteger(obj.ts) ?? normalizeFiniteInteger(obj.eventTimestamp);
	if (callId && eventTimestamp !== null) return `call-ts:${callId}:${eventTimestamp}`;
	if (eventTimestamp !== null) return `timestamp:${eventTimestamp}|text:${text}`;
	return `text:${text}`;
}
function shouldDropDuplicateVoiceTranscript(params) {
	const previous = recentVoiceTranscripts.get(params.sessionKey);
	if (previous && previous.fingerprint === params.fingerprint && params.now - previous.ts <= VOICE_TRANSCRIPT_DEDUPE_WINDOW_MS) return true;
	recentVoiceTranscripts.set(params.sessionKey, {
		fingerprint: params.fingerprint,
		ts: params.now
	});
	if (recentVoiceTranscripts.size > MAX_RECENT_VOICE_TRANSCRIPTS) {
		const cutoff = params.now - VOICE_TRANSCRIPT_DEDUPE_WINDOW_MS * 2;
		for (const [key, value] of recentVoiceTranscripts) {
			if (value.ts < cutoff) recentVoiceTranscripts.delete(key);
			if (recentVoiceTranscripts.size <= MAX_RECENT_VOICE_TRANSCRIPTS) break;
		}
		while (recentVoiceTranscripts.size > MAX_RECENT_VOICE_TRANSCRIPTS) {
			const oldestKey = recentVoiceTranscripts.keys().next().value;
			if (oldestKey === void 0) break;
			recentVoiceTranscripts.delete(oldestKey);
		}
	}
	return false;
}
function compactExecEventOutput(raw) {
	const normalized = raw.replace(/\s+/g, " ").trim();
	if (!normalized) return "";
	if (normalized.length <= MAX_EXEC_EVENT_OUTPUT_CHARS) return normalized;
	const safe = Math.max(1, MAX_EXEC_EVENT_OUTPUT_CHARS - 1);
	return `${normalized.slice(0, safe)}…`;
}
async function touchSessionStore(params) {
	const { storePath } = params;
	if (!storePath) return;
	await updateSessionStore(storePath, (store) => {
		const target = resolveGatewaySessionStoreTarget({
			cfg: params.cfg,
			key: params.sessionKey,
			store
		});
		pruneLegacyStoreKeys({
			store,
			canonicalKey: target.canonicalKey,
			candidates: target.storeKeys
		});
		store[params.canonicalKey] = {
			sessionId: params.sessionId,
			updatedAt: params.now,
			thinkingLevel: params.entry?.thinkingLevel,
			verboseLevel: params.entry?.verboseLevel,
			reasoningLevel: params.entry?.reasoningLevel,
			systemSent: params.entry?.systemSent,
			sendPolicy: params.entry?.sendPolicy,
			lastChannel: params.entry?.lastChannel,
			lastTo: params.entry?.lastTo
		};
	});
}
function queueSessionStoreTouch(params) {
	touchSessionStore({
		cfg: params.cfg,
		sessionKey: params.sessionKey,
		storePath: params.storePath,
		canonicalKey: params.canonicalKey,
		entry: params.entry,
		sessionId: params.sessionId,
		now: params.now
	}).catch((err) => {
		params.ctx.logGateway.warn("voice session-store update failed: " + formatForLog(err));
	});
}
function parseSessionKeyFromPayloadJSON(payloadJSON) {
	let payload;
	try {
		payload = JSON.parse(payloadJSON);
	} catch {
		return null;
	}
	if (typeof payload !== "object" || payload === null) return null;
	const obj = payload;
	const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
	return sessionKey.length > 0 ? sessionKey : null;
}
function parsePayloadObject(payloadJSON) {
	if (!payloadJSON) return null;
	let payload;
	try {
		payload = JSON.parse(payloadJSON);
	} catch {
		return null;
	}
	return typeof payload === "object" && payload !== null ? payload : null;
}
async function sendReceiptAck(params) {
	const resolved = resolveOutboundTarget({
		channel: params.channel,
		to: params.to,
		cfg: params.cfg,
		mode: "explicit"
	});
	if (!resolved.ok) throw new Error(String(resolved.error));
	const agentId = resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	});
	await deliverOutboundPayloads({
		cfg: params.cfg,
		channel: params.channel,
		to: resolved.to,
		payloads: [{ text: params.text }],
		agentId,
		bestEffort: true,
		deps: createOutboundSendDeps(params.deps)
	});
}
const handleNodeEvent = async (ctx, nodeId, evt) => {
	switch (evt.event) {
		case "voice.transcript": {
			const obj = parsePayloadObject(evt.payloadJSON);
			if (!obj) return;
			const text = typeof obj.text === "string" ? obj.text.trim() : "";
			if (!text) return;
			if (text.length > 2e4) return;
			const sessionKeyRaw = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
			const cfg = loadConfig();
			const rawMainKey = normalizeMainKey(cfg.session?.mainKey);
			const sessionKey = sessionKeyRaw.length > 0 ? sessionKeyRaw : rawMainKey;
			const { storePath, entry, canonicalKey } = loadSessionEntry(sessionKey);
			const now = Date.now();
			if (shouldDropDuplicateVoiceTranscript({
				sessionKey: canonicalKey,
				fingerprint: resolveVoiceTranscriptFingerprint(obj, text),
				now
			})) return;
			const sessionId = entry?.sessionId ?? randomUUID();
			queueSessionStoreTouch({
				ctx,
				cfg,
				sessionKey,
				storePath,
				canonicalKey,
				entry,
				sessionId,
				now
			});
			ctx.addChatRun(sessionId, {
				sessionKey: canonicalKey,
				clientRunId: `voice-${randomUUID()}`
			});
			agentCommand({
				message: text,
				sessionId,
				sessionKey: canonicalKey,
				thinking: "low",
				deliver: false,
				messageChannel: "node",
				inputProvenance: {
					kind: "external_user",
					sourceChannel: "voice",
					sourceTool: "gateway.voice.transcript"
				}
			}, defaultRuntime, ctx.deps).catch((err) => {
				ctx.logGateway.warn(`agent failed node=${nodeId}: ${formatForLog(err)}`);
			});
			return;
		}
		case "agent.request": {
			if (!evt.payloadJSON) return;
			let link = null;
			try {
				link = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			let message = (link?.message ?? "").trim();
			const normalizedAttachments = normalizeRpcAttachmentsToChatAttachments(link?.attachments ?? void 0);
			let images = [];
			if (normalizedAttachments.length > 0) try {
				const parsed = await parseMessageWithAttachments(message, normalizedAttachments, {
					maxBytes: 5e6,
					log: ctx.logGateway
				});
				message = parsed.message.trim();
				images = parsed.images;
			} catch {
				return;
			}
			if (!message) return;
			if (message.length > 2e4) return;
			let channel = normalizeChannelId(typeof link?.channel === "string" ? link.channel.trim() : "") ?? void 0;
			let to = typeof link?.to === "string" && link.to.trim() ? link.to.trim() : void 0;
			const deliverRequested = Boolean(link?.deliver);
			const wantsReceipt = Boolean(link?.receipt);
			const receiptText = (typeof link?.receiptText === "string" ? link.receiptText.trim() : "") || "Just received your iOS share + request, working on it.";
			const sessionKeyRaw = (link?.sessionKey ?? "").trim();
			const sessionKey = sessionKeyRaw.length > 0 ? sessionKeyRaw : `node-${nodeId}`;
			const cfg = loadConfig();
			const { storePath, entry, canonicalKey } = loadSessionEntry(sessionKey);
			const now = Date.now();
			const sessionId = entry?.sessionId ?? randomUUID();
			await touchSessionStore({
				cfg,
				sessionKey,
				storePath,
				canonicalKey,
				entry,
				sessionId,
				now
			});
			if (deliverRequested && (!channel || !to)) {
				const entryChannel = typeof entry?.lastChannel === "string" ? normalizeChannelId(entry.lastChannel) : void 0;
				const entryTo = typeof entry?.lastTo === "string" ? entry.lastTo.trim() : "";
				if (!channel && entryChannel) channel = entryChannel;
				if (!to && entryTo) to = entryTo;
			}
			const deliver = deliverRequested && Boolean(channel && to);
			const deliveryChannel = deliver ? channel : void 0;
			const deliveryTo = deliver ? to : void 0;
			if (deliverRequested && !deliver) ctx.logGateway.warn(`agent delivery disabled node=${nodeId}: missing session delivery route (channel=${channel ?? "-"} to=${to ?? "-"})`);
			if (wantsReceipt && deliveryChannel && deliveryTo) sendReceiptAck({
				cfg,
				deps: ctx.deps,
				sessionKey: canonicalKey,
				channel: deliveryChannel,
				to: deliveryTo,
				text: receiptText
			}).catch((err) => {
				ctx.logGateway.warn(`agent receipt failed node=${nodeId}: ${formatForLog(err)}`);
			});
			else if (wantsReceipt) ctx.logGateway.warn(`agent receipt skipped node=${nodeId}: missing delivery route (channel=${deliveryChannel ?? "-"} to=${deliveryTo ?? "-"})`);
			agentCommand({
				message,
				images,
				sessionId,
				sessionKey: canonicalKey,
				thinking: link?.thinking ?? void 0,
				deliver,
				to: deliveryTo,
				channel: deliveryChannel,
				timeout: typeof link?.timeoutSeconds === "number" ? link.timeoutSeconds.toString() : void 0,
				messageChannel: "node"
			}, defaultRuntime, ctx.deps).catch((err) => {
				ctx.logGateway.warn(`agent failed node=${nodeId}: ${formatForLog(err)}`);
			});
			return;
		}
		case "chat.subscribe": {
			if (!evt.payloadJSON) return;
			const sessionKey = parseSessionKeyFromPayloadJSON(evt.payloadJSON);
			if (!sessionKey) return;
			ctx.nodeSubscribe(nodeId, sessionKey);
			return;
		}
		case "chat.unsubscribe": {
			if (!evt.payloadJSON) return;
			const sessionKey = parseSessionKeyFromPayloadJSON(evt.payloadJSON);
			if (!sessionKey) return;
			ctx.nodeUnsubscribe(nodeId, sessionKey);
			return;
		}
		case "exec.started":
		case "exec.finished":
		case "exec.denied": {
			const obj = parsePayloadObject(evt.payloadJSON);
			if (!obj) return;
			const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : `node-${nodeId}`;
			if (!sessionKey) return;
			if (!(loadConfig().tools?.exec?.notifyOnExit !== false)) return;
			const runId = typeof obj.runId === "string" ? obj.runId.trim() : "";
			const command = typeof obj.command === "string" ? obj.command.trim() : "";
			const exitCode = typeof obj.exitCode === "number" && Number.isFinite(obj.exitCode) ? obj.exitCode : void 0;
			const timedOut = obj.timedOut === true;
			const output = typeof obj.output === "string" ? obj.output.trim() : "";
			const reason = typeof obj.reason === "string" ? obj.reason.trim() : "";
			let text = "";
			if (evt.event === "exec.started") {
				text = `Exec started (node=${nodeId}${runId ? ` id=${runId}` : ""})`;
				if (command) text += `: ${command}`;
			} else if (evt.event === "exec.finished") {
				const exitLabel = timedOut ? "timeout" : `code ${exitCode ?? "?"}`;
				const compactOutput = compactExecEventOutput(output);
				if (!(timedOut || exitCode !== 0 || compactOutput.length > 0)) return;
				text = `Exec finished (node=${nodeId}${runId ? ` id=${runId}` : ""}, ${exitLabel})`;
				if (compactOutput) text += `\n${compactOutput}`;
			} else {
				text = `Exec denied (node=${nodeId}${runId ? ` id=${runId}` : ""}${reason ? `, ${reason}` : ""})`;
				if (command) text += `: ${command}`;
			}
			enqueueSystemEvent(text, {
				sessionKey,
				contextKey: runId ? `exec:${runId}` : "exec"
			});
			requestHeartbeatNow({ reason: "exec-event" });
			return;
		}
		case "push.apns.register": {
			const obj = parsePayloadObject(evt.payloadJSON);
			if (!obj) return;
			const token = typeof obj.token === "string" ? obj.token : "";
			const topic = typeof obj.topic === "string" ? obj.topic : "";
			const environment = obj.environment;
			try {
				await registerApnsToken({
					nodeId,
					token,
					topic,
					environment
				});
			} catch (err) {
				ctx.logGateway.warn(`push apns register failed node=${nodeId}: ${formatForLog(err)}`);
			}
			return;
		}
		default: return;
	}
};

//#endregion
export { handleNodeEvent };