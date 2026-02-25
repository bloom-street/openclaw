import "./accounts-CR5voC9r.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./plugins-BHWQdgX0.js";
import { Z as logVerbose, et as shouldLogVerbose } from "./subsystem-loAAXGlc.js";
import "./config-CizIEHaM.js";
import "./command-format-DI57or3f.js";
import "./model-selection-BosKk3MZ.js";
import "./agent-scope-CdRMHY-e.js";
import "./manifest-registry-Bp7G4UCL.js";
import "./dock-CxoYogfi.js";
import "./redact-Cdy8PC2e.js";
import "./errors-BCGY_vDh.js";
import "./image-ops-BFqsv6C1.js";
import "./ssrf-CnX37IfG.js";
import "./fetch-guard-CpixodvE.js";
import "./local-roots-Bxw9w4l7.js";
import "./message-channel-BFQTPrdc.js";
import "./bindings-z9sNcO29.js";
import "./tool-images-1es22JxN.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-DyYDYPJn.js";
import "./skills-Dh-eevlN.js";
import "./chrome-D2V1rfF9.js";
import "./accounts-lUR9W-qK.js";
import "./accounts-C33JUvW2.js";
import "./sessions-DO4EfGhu.js";
import "./paths-B-NY-HdV.js";
import "./store-DpxE4Wbf.js";
import "./pi-embedded-helpers-1f0vep5s.js";
import "./thinking-BpFZfHN9.js";
import "./image-C5NZzytb.js";
import "./pi-model-discovery-CNP1dAqt.js";
import "./api-key-rotation-Ctq1GYSb.js";

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