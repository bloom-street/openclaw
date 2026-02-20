import { C as setVerbose, O as isRich, k as theme, n as isTruthyEnvValue, p as defaultRuntime } from "./entry.js";
import "./auth-profiles-zEppz1dW.js";
import { n as replaceCliName, r as resolveCliName } from "./command-format-ayFsmwwz.js";
import "./utils-kK6fjsN0.js";
import "./exec-B8JKbXKW.js";
import "./agent-scope-nWSUqWp6.js";
import "./github-copilot-token-SLWintYd.js";
import "./pi-model-discovery-DzEIEgHL.js";
import { j as VERSION } from "./config-Cz6PlSb8.js";
import "./manifest-registry-Cu0J9bfE.js";
import "./server-context-Di_oV8Uv.js";
import "./chrome-C-gAdv-3.js";
import "./control-service-1sfEiP_b.js";
import "./tailscale-iX1Q6arn.js";
import "./client-Dzx1FlLz.js";
import "./auth-DVIDxtSd.js";
import "./call--K7CqSE5.js";
import "./message-channel-BlgPSDAh.js";
import { t as formatDocsLink } from "./links-Dh-sSJXk.js";
import "./plugin-auto-enable-C9YNTk3o.js";
import "./plugins-B-QGH1FX.js";
import "./logging-CfEk_PnX.js";
import "./accounts-DLdxtdRR.js";
import "./loader-Dopq6jJs.js";
import "./progress-Da1ehW-x.js";
import "./prompt-style-Dc0C5HC9.js";
import "./note-Ci08TSbV.js";
import "./clack-prompter-DuBVnTKy.js";
import "./onboard-channels-B_QBLTmt.js";
import "./archive-D0z3LZDK.js";
import "./skill-scanner-Bp1D9gra.js";
import "./installs-DNzuaAfs.js";
import "./manager-D1zXa3hH.js";
import "./paths-C27OFaz1.js";
import "./sqlite-DODNHWJb.js";
import "./routes-BZSffgT3.js";
import "./pi-embedded-helpers-DADHYT5R.js";
import "./deliver-D2ePv4wG.js";
import "./sandbox-ClPjss8U.js";
import "./tui-formatters-BhYqNYxn.js";
import "./wsl-RTs6kjQP.js";
import "./skills-7JHw-ZEf.js";
import "./image-DczSXg_X.js";
import "./redact-BHmk44DI.js";
import "./tool-display-DeuTTGth.js";
import "./channel-selection-B-ovKJj_.js";
import "./session-cost-usage-72xDw9gJ.js";
import "./commands-DYKf-d9g.js";
import "./pairing-store-ByGGu2oo.js";
import "./login-qr-BYs1-VOE.js";
import "./pairing-labels-trbTEDI9.js";
import "./channels-status-issues-BthewJlG.js";
import { n as ensurePluginRegistryLoaded } from "./command-options-Czcsm_MA.js";
import { n as resolveCliChannelOptions } from "./channel-options-CJFOG10f.js";
import { a as getCommandPath, d as hasHelpOrVersion, l as getVerboseFlag } from "./register.subclis-BaDggyu4.js";
import "./completion-cli-B2Ex1_rg.js";
import "./gateway-rpc-Cu95hbYd.js";
import "./deps-Bq-RI5WJ.js";
import "./daemon-runtime-nbFDEt3d.js";
import "./service-DDPRbf8a.js";
import "./systemd-BEWwfwn0.js";
import "./service-audit-Bf1JrA1B.js";
import "./table-bnfGkIN7.js";
import "./widearea-dns-C-xzPxiS.js";
import "./audit-5ixh2dfm.js";
import "./onboard-skills-zPXsz97s.js";
import "./health-format-DBidTl02.js";
import "./update-runner-DKxNER7E.js";
import "./github-copilot-auth--jHonjyA.js";
import "./logging-DJkpOGZF.js";
import "./hooks-status-Cn8_mGAg.js";
import "./status-BJR85Sa4.js";
import "./skills-status-DJBHAFFn.js";
import "./tui-Co3naBo0.js";
import "./agent-C5DCCaAZ.js";
import "./node-service-u8g85nD3.js";
import { t as forceFreePort } from "./ports-BEoMoDmN.js";
import "./auth-health-BKjcLUpk.js";
import { i as hasEmittedCliBanner, n as emitCliBanner, o as registerProgramCommands, r as formatCliBannerLine, t as ensureConfigReady } from "./config-guard-DYEUD2bp.js";
import "./help-format-CUnac_bT.js";
import "./configure-GYHSUG-V.js";
import "./systemd-linger-CDo2UbHM.js";
import "./doctor-CAChjqHd.js";
import { Command } from "commander";

//#region src/cli/program/context.ts
function createProgramContext() {
	const channelOptions = resolveCliChannelOptions();
	return {
		programVersion: VERSION,
		channelOptions,
		messageChannelOptions: channelOptions.join("|"),
		agentChannelOptions: ["last", ...channelOptions].join("|")
	};
}

//#endregion
//#region src/cli/program/help.ts
const CLI_NAME = resolveCliName();
const EXAMPLES = [
	["openclaw channels login --verbose", "Link personal WhatsApp Web and show QR + connection logs."],
	["openclaw message send --target +15555550123 --message \"Hi\" --json", "Send via your web session and print JSON result."],
	["openclaw gateway --port 18789", "Run the WebSocket Gateway locally."],
	["openclaw --dev gateway", "Run a dev Gateway (isolated state/config) on ws://127.0.0.1:19001."],
	["openclaw gateway --force", "Kill anything bound to the default gateway port, then start it."],
	["openclaw gateway ...", "Gateway control via WebSocket."],
	["openclaw agent --to +15555550123 --message \"Run summary\" --deliver", "Talk directly to the agent using the Gateway; optionally send the WhatsApp reply."],
	["openclaw message send --channel telegram --target @mychat --message \"Hi\"", "Send via your Telegram bot."]
];
function configureProgramHelp(program, ctx) {
	program.name(CLI_NAME).description("").version(ctx.programVersion).option("--dev", "Dev profile: isolate state under ~/.openclaw-dev, default gateway port 19001, and shift derived ports (browser/canvas)").option("--profile <name>", "Use a named profile (isolates OPENCLAW_STATE_DIR/OPENCLAW_CONFIG_PATH under ~/.openclaw-<name>)");
	program.option("--no-color", "Disable ANSI colors", false);
	program.configureHelp({
		sortSubcommands: true,
		sortOptions: true,
		optionTerm: (option) => theme.option(option.flags),
		subcommandTerm: (cmd) => theme.command(cmd.name())
	});
	program.configureOutput({
		writeOut: (str) => {
			const colored = str.replace(/^Usage:/gm, theme.heading("Usage:")).replace(/^Options:/gm, theme.heading("Options:")).replace(/^Commands:/gm, theme.heading("Commands:"));
			process.stdout.write(colored);
		},
		writeErr: (str) => process.stderr.write(str),
		outputError: (str, write) => write(theme.error(str))
	});
	if (process.argv.includes("-V") || process.argv.includes("--version") || process.argv.includes("-v")) {
		console.log(ctx.programVersion);
		process.exit(0);
	}
	program.addHelpText("beforeAll", () => {
		if (hasEmittedCliBanner()) return "";
		const rich = isRich();
		return `\n${formatCliBannerLine(ctx.programVersion, { richTty: rich })}\n`;
	});
	const fmtExamples = EXAMPLES.map(([cmd, desc]) => `  ${theme.command(replaceCliName(cmd, CLI_NAME))}\n    ${theme.muted(desc)}`).join("\n");
	program.addHelpText("afterAll", ({ command }) => {
		if (command !== program) return "";
		const docs = formatDocsLink("/cli", "docs.openclaw.ai/cli");
		return `\n${theme.heading("Examples:")}\n${fmtExamples}\n\n${theme.muted("Docs:")} ${docs}\n`;
	});
}

//#endregion
//#region src/cli/program/preaction.ts
function setProcessTitleForCommand(actionCommand) {
	let current = actionCommand;
	while (current.parent && current.parent.parent) current = current.parent;
	const name = current.name();
	const cliName = resolveCliName();
	if (!name || name === cliName) return;
	process.title = `${cliName}-${name}`;
}
const PLUGIN_REQUIRED_COMMANDS = new Set([
	"message",
	"channels",
	"directory"
]);
function registerPreActionHooks(program, programVersion) {
	program.hook("preAction", async (_thisCommand, actionCommand) => {
		setProcessTitleForCommand(actionCommand);
		const argv = process.argv;
		if (hasHelpOrVersion(argv)) return;
		const commandPath = getCommandPath(argv, 2);
		if (!(isTruthyEnvValue(process.env.OPENCLAW_HIDE_BANNER) || commandPath[0] === "update" || commandPath[0] === "completion" || commandPath[0] === "plugins" && commandPath[1] === "update")) emitCliBanner(programVersion);
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		setVerbose(verbose);
		if (!verbose) process.env.NODE_NO_WARNINGS ??= "1";
		if (commandPath[0] === "doctor" || commandPath[0] === "completion") return;
		await ensureConfigReady({
			runtime: defaultRuntime,
			commandPath
		});
		if (PLUGIN_REQUIRED_COMMANDS.has(commandPath[0])) ensurePluginRegistryLoaded();
	});
}

//#endregion
//#region src/cli/program/build-program.ts
function buildProgram() {
	const program = new Command();
	const ctx = createProgramContext();
	const argv = process.argv;
	configureProgramHelp(program, ctx);
	registerPreActionHooks(program, ctx.programVersion);
	registerProgramCommands(program, ctx, argv);
	return program;
}

//#endregion
export { buildProgram };