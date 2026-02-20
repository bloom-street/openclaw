import { o as createSubsystemLogger } from "./entry.js";
import "./auth-profiles-zEppz1dW.js";
import "./utils-kK6fjsN0.js";
import "./exec-B8JKbXKW.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-nWSUqWp6.js";
import "./github-copilot-token-SLWintYd.js";
import "./pi-model-discovery-DzEIEgHL.js";
import { i as loadConfig } from "./config-Cz6PlSb8.js";
import "./manifest-registry-Cu0J9bfE.js";
import "./server-context-Di_oV8Uv.js";
import "./chrome-C-gAdv-3.js";
import "./control-service-1sfEiP_b.js";
import "./client-Dzx1FlLz.js";
import "./call--K7CqSE5.js";
import "./message-channel-BlgPSDAh.js";
import "./links-Dh-sSJXk.js";
import "./plugins-B-QGH1FX.js";
import "./logging-CfEk_PnX.js";
import "./accounts-DLdxtdRR.js";
import { t as loadOpenClawPlugins } from "./loader-Ds3or8QX.js";
import "./progress-Da1ehW-x.js";
import "./prompt-style-Dc0C5HC9.js";
import "./manager-BghcUcWX.js";
import "./paths-C27OFaz1.js";
import "./sqlite-DODNHWJb.js";
import "./routes-BZSffgT3.js";
import "./pi-embedded-helpers-CCNP0B92.js";
import "./deliver-D6MIjM7L.js";
import "./sandbox-npOXJ84S.js";
import "./tui-formatters-BdppNVAm.js";
import "./wsl-RTs6kjQP.js";
import "./skills-7JHw-ZEf.js";
import "./image-xjbY_CBB.js";
import "./redact-BHmk44DI.js";
import "./tool-display-CefFeFx1.js";
import "./channel-selection-B-ovKJj_.js";
import "./session-cost-usage-72xDw9gJ.js";
import "./commands-CFg6P_WC.js";
import "./pairing-store-ByGGu2oo.js";
import "./login-qr-BYs1-VOE.js";
import "./pairing-labels-trbTEDI9.js";

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