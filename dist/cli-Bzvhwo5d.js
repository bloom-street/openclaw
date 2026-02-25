import { o as createSubsystemLogger } from "./entry.js";
import "./auth-profiles-OdU3_yD3.js";
import "./utils-kK6fjsN0.js";
import "./exec-B8JKbXKW.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-BPbP3nUY.js";
import "./github-copilot-token-SLWintYd.js";
import "./pi-model-discovery-DzEIEgHL.js";
import { i as loadConfig } from "./config-DWFc1sJR.js";
import "./manifest-registry-Cu0J9bfE.js";
import "./server-context-Di_oV8Uv.js";
import "./chrome-C-gAdv-3.js";
import "./control-service-t48DoF4G.js";
import "./client-Dzx1FlLz.js";
import "./call-AlDhuZZQ.js";
import "./message-channel-BlgPSDAh.js";
import "./links-Dh-sSJXk.js";
import "./plugins-pICDrOYL.js";
import "./logging-CfEk_PnX.js";
import "./accounts-DLdxtdRR.js";
import { t as loadOpenClawPlugins } from "./loader-D1fSA4zX.js";
import "./progress-Da1ehW-x.js";
import "./prompt-style-Dc0C5HC9.js";
import "./manager-jKI45zas.js";
import "./paths-C27OFaz1.js";
import "./sqlite-DODNHWJb.js";
import "./routes-BdrRAaSk.js";
import "./pi-embedded-helpers-DHL4Qb_-.js";
import "./deliver-CnKfciqq.js";
import "./sandbox-BE3PG9bB.js";
import "./tui-formatters-CXFcP4ae.js";
import "./wsl-CPEOavWT.js";
import "./skills-7JHw-ZEf.js";
import "./image-BuBGE4R3.js";
import "./redact-BHmk44DI.js";
import "./tool-display-DeuTTGth.js";
import "./channel-selection-DpXNItTn.js";
import "./session-cost-usage-72xDw9gJ.js";
import "./commands-fHGxReKT.js";
import "./pairing-store-C9HZP3A3.js";
import "./login-qr-B_PNpSWR.js";
import "./pairing-labels-9nsonX3b.js";

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