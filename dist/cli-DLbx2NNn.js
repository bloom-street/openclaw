import "./paths-DVBShlw6.js";
import { t as createSubsystemLogger } from "./subsystem-DPnkvS73.js";
import "./utils-DC1T2Vz-.js";
import "./pi-embedded-helpers-D3awaIK3.js";
import { ut as loadOpenClawPlugins } from "./reply-C_Xb7msU.js";
import "./exec-DFOtZbI0.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-BimPHsgV.js";
import "./model-selection-D3KJIAFQ.js";
import "./github-copilot-token-BW-SEg7E.js";
import "./boolean-BgXe2hyu.js";
import "./env-B5YXooWp.js";
import { i as loadConfig } from "./config-CuE2AFLW.js";
import "./manifest-registry-D9xpkqNV.js";
import "./plugins-DiRwLd6W.js";
import "./sandbox-C5BO8EWI.js";
import "./image-B2Bt9id4.js";
import "./pi-model-discovery-CV2V1HHz.js";
import "./chrome-Pu3QpMVX.js";
import "./skills-BpAg7sFB.js";
import "./routes-C74EP3ey.js";
import "./server-context-BO-cIZX0.js";
import "./message-channel-DDb2JxXt.js";
import "./logging-kuFzZMsG.js";
import "./accounts-DfGQnxc5.js";
import "./paths-BuajeM4x.js";
import "./redact-CVRUv382.js";
import "./tool-display-Ie79i5v6.js";
import "./deliver-D1qmU1uO.js";
import "./dispatcher-C6dI7SNB.js";
import "./manager-8Vxg8NaH.js";
import "./sqlite-B5oxikhe.js";
import "./tui-formatters-DcJ3P0Ac.js";
import "./net-CYzQzbew.js";
import "./call-DLNOeLcz.js";
import "./login-qr-CymkVkGG.js";
import "./pairing-store-D95EkSwB.js";
import "./links-Rt4SFKTM.js";
import "./progress-COzt9PNY.js";
import "./pi-tools.policy-TBFiVNRK.js";
import "./prompt-style-DjZDxcFg.js";
import "./pairing-labels-D6CBX9y8.js";
import "./session-cost-usage-BLg4_A0k.js";
import "./control-service-CTg8kHVc.js";
import "./channel-selection-cxry228H.js";

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