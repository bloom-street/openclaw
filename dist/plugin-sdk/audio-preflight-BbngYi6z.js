import "./accounts-nRb69JLQ.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./plugins-B2hFdD-S.js";
import { Z as logVerbose, et as shouldLogVerbose } from "./subsystem-D1LlWNKh.js";
import "./config-uHVtgeU4.js";
import "./command-format-DoSIFR_b.js";
import "./model-selection-Bu_zRfMm.js";
import "./agent-scope-C7lDXLcL.js";
import "./manifest-registry-Ctatc67v.js";
import "./dock-C9iUCMgm.js";
import "./redact-CamFT8Bc.js";
import "./errors-DxNipVio.js";
import "./image-ops-CJzX8elj.js";
import "./ssrf-CnX37IfG.js";
import "./fetch-guard-BR59nV6r.js";
import "./local-roots-DNyWXNDd.js";
import "./message-channel-2ePfk9N2.js";
import "./bindings-Chpkg0py.js";
import "./tool-images-uaytAzph.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-cRpqABfy.js";
import "./skills-CtkhJHXI.js";
import "./chrome-Dk9eANqq.js";
import "./accounts-BhEg4pJ-.js";
import "./accounts-CCH31kh4.js";
import "./sessions-BQRS1nKH.js";
import "./paths-B-NY-HdV.js";
import "./store-hRWN63IF.js";
import "./pi-embedded-helpers-D2M-UL2S.js";
import "./thinking-BpFZfHN9.js";
import "./image-Dw_QFvOy.js";
import "./pi-model-discovery-CNP1dAqt.js";
import "./api-key-rotation-DD7GCMT6.js";

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