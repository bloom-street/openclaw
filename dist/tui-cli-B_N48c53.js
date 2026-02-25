import "./paths-DVBShlw6.js";
import { R as theme, c as defaultRuntime } from "./subsystem-DPnkvS73.js";
import "./utils-DC1T2Vz-.js";
import "./pi-embedded-helpers-BvbxDxSx.js";
import "./exec-DFOtZbI0.js";
import "./agent-scope-TEKvyC71.js";
import "./model-selection-BSjmwr-2.js";
import "./github-copilot-token-BW-SEg7E.js";
import "./boolean-BgXe2hyu.js";
import "./env-B5YXooWp.js";
import "./config-DE7StXS1.js";
import "./manifest-registry-D9xpkqNV.js";
import "./plugins-Dyk3sGJx.js";
import "./sandbox-C2s8_C_t.js";
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
import "./tui-formatters-D76y1ElX.js";
import "./net-BS4Hcnhx.js";
import "./call-Ch49AeEh.js";
import { t as formatDocsLink } from "./links-Rt4SFKTM.js";
import { t as parseTimeoutMs } from "./parse-timeout-DV8NQQWk.js";
import { t as runTui } from "./tui-D2JSZ-pa.js";

//#region src/cli/tui-cli.ts
function registerTuiCli(program) {
	program.command("tui").description("Open a terminal UI connected to the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (if required)").option("--session <key>", "Session key (default: \"main\", or \"global\" when scope is global)").option("--deliver", "Deliver assistant replies", false).option("--thinking <level>", "Thinking level override").option("--message <text>", "Send an initial message after connecting").option("--timeout-ms <ms>", "Agent timeout in ms (defaults to agents.defaults.timeoutSeconds)").option("--history-limit <n>", "History entries to load", "200").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/tui", "docs.openclaw.ai/cli/tui")}\n`).action(async (opts) => {
		try {
			const timeoutMs = parseTimeoutMs(opts.timeoutMs);
			if (opts.timeoutMs !== void 0 && timeoutMs === void 0) defaultRuntime.error(`warning: invalid --timeout-ms "${String(opts.timeoutMs)}"; ignoring`);
			const historyLimit = Number.parseInt(String(opts.historyLimit ?? "200"), 10);
			await runTui({
				url: opts.url,
				token: opts.token,
				password: opts.password,
				session: opts.session,
				deliver: Boolean(opts.deliver),
				thinking: opts.thinking,
				message: opts.message,
				timeoutMs,
				historyLimit: Number.isNaN(historyLimit) ? void 0 : historyLimit
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
export { registerTuiCli };