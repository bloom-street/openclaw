import "./agent-scope-n6jqebe_.js";
import "./paths-BY8fKpqm.js";
import { J as logVerbose, Z as shouldLogVerbose } from "./subsystem-Ck26JAQG.js";
import "./model-selection-BZb5eKSX.js";
import "./github-copilot-token-D8k4aAom.js";
import "./env-BlZ2KU7g.js";
import "./plugins-DEHNsYb3.js";
import "./accounts-BoFg1f6e.js";
import "./bindings-Xx2te2_w.js";
import "./accounts-D7QA6mSG.js";
import "./image-ops-C3xvxQ4C.js";
import "./pi-model-discovery-DaNAekda.js";
import "./message-channel-CTEYhii8.js";
import "./pi-embedded-helpers-512fSENC.js";
import "./config-Do3_2XKe.js";
import "./manifest-registry-RfG50-0E.js";
import "./dock-rKANCYu8.js";
import "./chrome-CUMsXXth.js";
import "./ssrf-B7akL5oa.js";
import "./skills-DV5x8-Ny.js";
import "./redact-DuzbwM25.js";
import "./errors-DPA8_FS3.js";
import "./store-DcTT8D3L.js";
import "./sessions-untMh16U.js";
import "./accounts-Ct8GydwU.js";
import "./paths-DbuO2gD6.js";
import "./tool-images-BOH9bz51.js";
import "./thinking-ZaPrKXBc.js";
import "./image-B2ui7nMH.js";
import "./gemini-auth-Bwo12bxy.js";
import "./fetch-guard-CSB-4H7q.js";
import "./local-roots-B0MxBUw9.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-mtJ5lYXD.js";

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