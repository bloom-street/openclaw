import { k as theme, p as defaultRuntime } from "./entry.js";
import "./auth-profiles-OdU3_yD3.js";
import "./utils-kK6fjsN0.js";
import "./exec-B8JKbXKW.js";
import "./agent-scope-BPbP3nUY.js";
import "./github-copilot-token-SLWintYd.js";
import "./config-DWFc1sJR.js";
import "./manifest-registry-Cu0J9bfE.js";
import "./server-context-Di_oV8Uv.js";
import "./chrome-C-gAdv-3.js";
import "./client-Dzx1FlLz.js";
import "./call-AlDhuZZQ.js";
import "./message-channel-BlgPSDAh.js";
import { t as formatDocsLink } from "./links-Dh-sSJXk.js";
import "./plugins-pICDrOYL.js";
import "./logging-CfEk_PnX.js";
import "./accounts-DLdxtdRR.js";
import "./paths-C27OFaz1.js";
import "./routes-BdrRAaSk.js";
import "./pi-embedded-helpers-DHL4Qb_-.js";
import "./sandbox-BE3PG9bB.js";
import "./tui-formatters-CXFcP4ae.js";
import "./skills-7JHw-ZEf.js";
import "./redact-BHmk44DI.js";
import "./tool-display-DeuTTGth.js";
import { t as parseTimeoutMs } from "./parse-timeout-DFSPLxpY.js";
import { t as runTui } from "./tui-CnGB3ybA.js";

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