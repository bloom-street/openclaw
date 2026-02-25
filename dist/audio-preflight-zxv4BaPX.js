import "./agent-scope-Cn3C2ptS.js";
import "./paths-C9do7WCN.js";
import { J as logVerbose, Z as shouldLogVerbose } from "./subsystem-OjJSGqSf.js";
import "./workspace-CqHof6MR.js";
import "./model-selection-wi8K54ui.js";
import "./github-copilot-token-BkwQAVvU.js";
import "./env-1KrR5vLt.js";
import "./boolean-mcn6kL0s.js";
import "./plugins-CusfI6F2.js";
import "./accounts-BtvdrZM5.js";
import "./bindings-C3a3c5HV.js";
import "./accounts-Db1Y0y43.js";
import "./image-ops-BeXtPfpf.js";
import "./pi-model-discovery-C-yOXpma.js";
import "./message-channel-7XB7U9SO.js";
import "./pi-embedded-helpers-Nkel9jt9.js";
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
import "./image-CLOK6lEA.js";
import "./gemini-auth-DUMxnS68.js";
import "./fetch-guard-lOn4SJJB.js";
import "./local-roots-B9dknNG2.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-0wsR1Jhq.js";

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