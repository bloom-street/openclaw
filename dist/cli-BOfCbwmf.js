import "./paths-DVBShlw6.js";
import { t as createSubsystemLogger } from "./subsystem-DPnkvS73.js";
import "./utils-DC1T2Vz-.js";
import "./pi-embedded-helpers-BvbxDxSx.js";
import { ut as loadOpenClawPlugins } from "./reply-CUwCtVzh.js";
import "./exec-DFOtZbI0.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-TEKvyC71.js";
import "./model-selection-BSjmwr-2.js";
import "./github-copilot-token-BW-SEg7E.js";
import "./boolean-BgXe2hyu.js";
import "./env-B5YXooWp.js";
import { i as loadConfig } from "./config-DE7StXS1.js";
import "./manifest-registry-D9xpkqNV.js";
import "./plugins-Dyk3sGJx.js";
import "./sandbox-C2s8_C_t.js";
import "./image-CSx7jj7z.js";
import "./pi-model-discovery-CV2V1HHz.js";
import "./chrome-DI--0Dvj.js";
import "./skills-BpAg7sFB.js";
import "./routes-DPxZWkgO.js";
import "./server-context-vpTNR47p.js";
import "./message-channel-DDb2JxXt.js";
import "./logging-kuFzZMsG.js";
import "./accounts-DfGQnxc5.js";
import "./paths-BuajeM4x.js";
import "./redact-CVRUv382.js";
import "./tool-display-Ie79i5v6.js";
import "./deliver-DZFwPB6N.js";
import "./dispatcher-D5WOyG_M.js";
import "./manager-ALweQy23.js";
import "./sqlite-B5oxikhe.js";
import "./tui-formatters-D76y1ElX.js";
import "./net-BS4Hcnhx.js";
import "./call-Ch49AeEh.js";
import "./login-qr-PdyE2DG0.js";
import "./pairing-store-BVZmfaef.js";
import "./links-Rt4SFKTM.js";
import "./progress-COzt9PNY.js";
import "./pi-tools.policy-_2OxbWhe.js";
import "./prompt-style-DjZDxcFg.js";
import "./pairing-labels-4Uikaa-0.js";
import "./session-cost-usage-BLg4_A0k.js";
import "./control-service-BBr3nqAS.js";
import "./channel-selection-D4DZ8-Da.js";

//#region src/plugins/cli.ts
const log = createSubsystemLogger("plugins");
function registerPluginCliCommands(program, cfg) {
	const config = cfg ?? loadConfig();
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	const logger = {
		info: (msg) => log.info(msg),
		warn: (msg) => log.warn(msg),
		error: (msg) => log.error(msg),
		debug: (msg) => log.debug(msg)
	};
	const registry = loadOpenClawPlugins({
		config,
		workspaceDir,
		logger
	});
	const existingCommands = new Set(program.commands.map((cmd) => cmd.name()));
	for (const entry of registry.cliRegistrars) {
		if (entry.commands.length > 0) {
			const overlaps = entry.commands.filter((command) => existingCommands.has(command));
			if (overlaps.length > 0) {
				log.debug(`plugin CLI register skipped (${entry.pluginId}): command already registered (${overlaps.join(", ")})`);
				continue;
			}
		}
		try {
			const result = entry.register({
				program,
				config,
				workspaceDir,
				logger
			});
			if (result && typeof result.then === "function") result.catch((err) => {
				log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
			});
			for (const command of entry.commands) existingCommands.add(command);
		} catch (err) {
			log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
		}
	}
}

//#endregion
export { registerPluginCliCommands };