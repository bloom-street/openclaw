import "./paths-DVBShlw6.js";
import { R as theme, c as defaultRuntime } from "./subsystem-DPnkvS73.js";
import "./utils-DC1T2Vz-.js";
import "./pi-embedded-helpers-D3awaIK3.js";
import "./exec-DFOtZbI0.js";
import "./agent-scope-BimPHsgV.js";
import "./model-selection-D3KJIAFQ.js";
import "./github-copilot-token-BW-SEg7E.js";
import "./boolean-BgXe2hyu.js";
import "./env-B5YXooWp.js";
import "./config-CuE2AFLW.js";
import "./manifest-registry-D9xpkqNV.js";
import "./plugins-DiRwLd6W.js";
import "./sandbox-C5BO8EWI.js";
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
import "./tui-formatters-DcJ3P0Ac.js";
import "./net-CYzQzbew.js";
import "./call-DLNOeLcz.js";
import { t as formatDocsLink } from "./links-Rt4SFKTM.js";
import { t as parseTimeoutMs } from "./parse-timeout-DV8NQQWk.js";
import { t as runTui } from "./tui-DNAVcWYQ.js";

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