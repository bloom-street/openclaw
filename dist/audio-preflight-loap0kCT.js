import "./paths-B4BZAPZh.js";
import { F as shouldLogVerbose, M as logVerbose } from "./utils-7gb3VEps.js";
import "./thinking-EAliFiVK.js";
import "./agent-scope-nvzGbP5e.js";
import "./subsystem-C5Sd3JES.js";
import "./exec-DnsD91Q4.js";
import "./model-selection-DooR7GQG.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-BgXe2hyu.js";
import "./env-DkKx0PT3.js";
import "./host-env-security-ljCLeQmh.js";
import "./message-channel-C8Keu0lE.js";
import "./config-DNKWBHAH.js";
import "./env-vars-CvvqezS9.js";
import "./manifest-registry-C6u54rI3.js";
import "./dock-ivyty9f-.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, s as isAudioAttachment, t as buildProviderRegistry } from "./runner-BEGrwMIi.js";
import "./image-DhuBIJBJ.js";
import "./models-config-ixfzwQFB.js";
import "./pi-model-discovery-Bakt-Qrp.js";
import "./pi-embedded-helpers-BsRZNe-O.js";
import "./sandbox-EJpX6-Td.js";
import "./tool-catalog-B7bNs0Qm.js";
import "./chrome-DG3CD5t4.js";
import "./tailscale-iTlFoOvr.js";
import "./ip-D0zgNmBV.js";
import "./tailnet-CEudzG0i.js";
import "./ws-BTdBA7Dw.js";
import "./auth-Byh9Posp.js";
import "./server-context-Dko19I6m.js";
import "./frontmatter-DR47FZL2.js";
import "./skills-H7U30Ato.js";
import "./redact-DKEWQ4ef.js";
import "./errors-DiV2hVgY.js";
import "./fs-safe-DwCRJYoe.js";
import "./trash-BlINPotY.js";
import "./ssrf-D0C-ivqd.js";
import "./image-ops-CT4_RMYw.js";
import "./store-to0SxvTa.js";
import "./ports-CMYOQ1Xv.js";
import "./server-middleware-CQ0JmE7W.js";
import "./sessions-BVFFX_jz.js";
import "./plugins-BpAzc5Av.js";
import "./accounts-CvQo4BE0.js";
import "./accounts-C-f1i1Zq.js";
import "./accounts-D5BIfedQ.js";
import "./bindings-n9iduK6p.js";
import "./logging-B-Pt-Wis.js";
import "./paths-DI5fQaUg.js";
import "./chat-envelope-CurikSJo.js";
import "./tool-images-GXybOr7q.js";
import "./tool-display-KYKCFyFz.js";
import "./fetch-guard-CTPIWqvT.js";
import "./api-key-rotation-Cxcwtq4h.js";
import "./local-roots-0gW1HLRP.js";
import "./model-catalog-CpfIFRmQ.js";

//#region src/media-understanding/audio-preflight.ts
/**
* Transcribes the first audio attachment BEFORE mention checking.
* This allows voice notes to be processed in group chats with requireMention: true.
* Returns the transcript or undefined if transcription fails or no audio is found.
*/
async function transcribeFirstAudio(params) {
	const { ctx, cfg } = params;
	const audioConfig = cfg.tools?.media?.audio;
	if (!audioConfig || audioConfig.enabled === false) return;
	const attachments = normalizeMediaAttachments(ctx);
	if (!attachments || attachments.length === 0) return;
	const firstAudio = attachments.find((att) => att && isAudioAttachment(att) && !att.alreadyTranscribed);
	if (!firstAudio) return;
	if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribing attachment ${firstAudio.index} for mention check`);
	const providerRegistry = buildProviderRegistry(params.providers);
	const cache = createMediaAttachmentCache(attachments, { localPathRoots: resolveMediaAttachmentLocalRoots({
		cfg,
		ctx
	}) });
	try {
		const result = await runCapability({
			capability: "audio",
			cfg,
			ctx,
			attachments: cache,
			media: attachments,
			agentDir: params.agentDir,
			providerRegistry,
			config: audioConfig,
			activeModel: params.activeModel
		});
		if (!result || result.outputs.length === 0) return;
		const audioOutput = result.outputs.find((output) => output.kind === "audio.transcription");
		if (!audioOutput || !audioOutput.text) return;
		firstAudio.alreadyTranscribed = true;
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribed ${audioOutput.text.length} chars from attachment ${firstAudio.index}`);
		return audioOutput.text;
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcription failed: ${String(err)}`);
		return;
	} finally {
		await cache.cleanup();
	}
}

//#endregion
export { transcribeFirstAudio };