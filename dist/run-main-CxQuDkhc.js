import { c as enableConsoleCapture, i as normalizeEnv, n as isTruthyEnvValue, p as defaultRuntime } from "./entry.js";
import "./auth-profiles-OdU3_yD3.js";
import { p as resolveConfigDir } from "./utils-kK6fjsN0.js";
import "./exec-B8JKbXKW.js";
import "./agent-scope-BPbP3nUY.js";
import "./github-copilot-token-SLWintYd.js";
import "./pi-model-discovery-DzEIEgHL.js";
import { j as VERSION } from "./config-DWFc1sJR.js";
import "./manifest-registry-Cu0J9bfE.js";
import "./server-context-Di_oV8Uv.js";
import "./chrome-C-gAdv-3.js";
import { r as formatUncaughtError } from "./errors-JRo_LuMk.js";
import "./control-service-t48DoF4G.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-Mj23v3sw.js";
import "./tailscale-iX1Q6arn.js";
import "./client-Dzx1FlLz.js";
import "./auth-DVIDxtSd.js";
import "./call-AlDhuZZQ.js";
import "./message-channel-BlgPSDAh.js";
import "./links-Dh-sSJXk.js";
import "./plugin-auto-enable-D1MC6c50.js";
import "./plugins-pICDrOYL.js";
import "./logging-CfEk_PnX.js";
import "./accounts-DLdxtdRR.js";
import { Mt as installUnhandledRejectionHandler } from "./loader-D1fSA4zX.js";
import "./progress-Da1ehW-x.js";
import "./prompt-style-Dc0C5HC9.js";
import "./note-Ci08TSbV.js";
import "./clack-prompter-DuBVnTKy.js";
import "./onboard-channels-D8g7ALPG.js";
import "./archive-D0z3LZDK.js";
import "./skill-scanner-Bp1D9gra.js";
import "./installs-DNzuaAfs.js";
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
import "./channels-status-issues-CSSVsvAH.js";
import { n as ensurePluginRegistryLoaded } from "./command-options-DhbsFK9n.js";
import { a as getCommandPath, c as getPrimaryCommand, d as hasHelpOrVersion } from "./register.subclis-D_ovGplK.js";
import "./completion-cli-BKUD0ONj.js";
import "./gateway-rpc-C1hgTUEu.js";
import "./deps-CsJlqqD0.js";
import { h as assertSupportedRuntime } from "./daemon-runtime-D359XoF_.js";
import "./service-DDPRbf8a.js";
import "./systemd-BEWwfwn0.js";
import "./service-audit-nIA2TVUt.js";
import "./table-bnfGkIN7.js";
import "./widearea-dns-C-xzPxiS.js";
import "./audit-BT68GBYq.js";
import "./onboard-skills-JOuJOCVg.js";
import "./health-format-CKRwfpfu.js";
import "./update-runner-C6yxWJkC.js";
import "./github-copilot-auth-BhFMMhY3.js";
import "./logging-DJkpOGZF.js";
import "./hooks-status-Cn8_mGAg.js";
import "./status-CMbuqZAN.js";
import "./skills-status-DJBHAFFn.js";
import "./tui-CnGB3ybA.js";
import "./agent-DYJAdU_L.js";
import "./node-service-u8g85nD3.js";
import "./auth-health-qAauFdxn.js";
import { a as findRoutedCommand, n as emitCliBanner, t as ensureConfigReady } from "./config-guard-C1AQZQtJ.js";
import "./help-format-CUnac_bT.js";
import "./configure-CnormYb3.js";
import "./systemd-linger-CDo2UbHM.js";
import "./doctor-DukdWoQc.js";
import path from "node:path";
import process$1 from "node:process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

//#region src/infra/dotenv.ts
function loadDotEnv(opts) {
	const quiet = opts?.quiet ?? true;
	dotenv.config({ quiet });
	const globalEnvPath = path.join(resolveConfigDir(process.env), ".env");
	if (!fs.existsSync(globalEnvPath)) return;
	dotenv.config({
		quiet,
		path: globalEnvPath,
		override: false
	});
}

//#endregion
//#region src/cli/route.ts
async function prepareRoutedCommand(params) {
	emitCliBanner(VERSION, { argv: params.argv });
	await ensureConfigReady({
		runtime: defaultRuntime,
		commandPath: params.commandPath
	});
	if (params.loadPlugins) ensurePluginRegistryLoaded();
}
async function tryRouteCli(argv) {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_ROUTE_FIRST)) return false;
	if (hasHelpOrVersion(argv)) return false;
	const path = getCommandPath(argv, 2);
	if (!path[0]) return false;
	const route = findRoutedCommand(path);
	if (!route) return false;
	await prepareRoutedCommand({
		argv,
		commandPath: path,
		loadPlugins: route.loadPlugins
	});
	return route.run(argv);
}

//#endregion
//#region src/cli/run-main.ts
function rewriteUpdateFlagArgv(argv) {
	const index = argv.indexOf("--update");
	if (index === -1) return argv;
	const next = [...argv];
	next.splice(index, 1, "update");
	return next;
}
async function runCli(argv = process$1.argv) {
	const normalizedArgv = stripWindowsNodeExec(argv);
	loadDotEnv({ quiet: true });
	normalizeEnv();
	ensureOpenClawCliOnPath();
	assertSupportedRuntime();
	if (await tryRouteCli(normalizedArgv)) return;
	enableConsoleCapture();
	const { buildProgram } = await import("./program-Db0j1y4e.js");
	const program = buildProgram();
	installUnhandledRejectionHandler();
	process$1.on("uncaughtException", (error) => {
		console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
		process$1.exit(1);
	});
	const parseArgv = rewriteUpdateFlagArgv(normalizedArgv);
	const primary = getPrimaryCommand(parseArgv);
	if (primary) {
		const { registerSubCliByName } = await import("./register.subclis-D_ovGplK.js").then((n) => n.i);
		await registerSubCliByName(program, primary);
	}
	if (!(!primary && hasHelpOrVersion(parseArgv))) {
		const { registerPluginCliCommands } = await import("./cli-Bzvhwo5d.js");
		const { loadConfig } = await import("./config-DWFc1sJR.js").then((n) => n.t);
		registerPluginCliCommands(program, loadConfig());
	}
	await program.parseAsync(parseArgv);
}
function stripWindowsNodeExec(argv) {
	if (process$1.platform !== "win32") return argv;
	const stripControlChars = (value) => {
		let out = "";
		for (let i = 0; i < value.length; i += 1) {
			const code = value.charCodeAt(i);
			if (code >= 32 && code !== 127) out += value[i];
		}
		return out;
	};
	const normalizeArg = (value) => stripControlChars(value).replace(/^['"]+|['"]+$/g, "").trim();
	const normalizeCandidate = (value) => normalizeArg(value).replace(/^\\\\\\?\\/, "");
	const execPath = normalizeCandidate(process$1.execPath);
	const execPathLower = execPath.toLowerCase();
	const execBase = path.basename(execPath).toLowerCase();
	const isExecPath = (value) => {
		if (!value) return false;
		const normalized = normalizeCandidate(value);
		if (!normalized) return false;
		const lower = normalized.toLowerCase();
		return lower === execPathLower || path.basename(lower) === execBase || lower.endsWith("\\node.exe") || lower.endsWith("/node.exe") || lower.includes("node.exe") || path.basename(lower) === "node.exe" && fs.existsSync(normalized);
	};
	const filtered = argv.filter((arg, index) => index === 0 || !isExecPath(arg));
	if (filtered.length < 3) return filtered;
	const cleaned = [...filtered];
	if (isExecPath(cleaned[1])) cleaned.splice(1, 1);
	if (isExecPath(cleaned[2])) cleaned.splice(2, 1);
	return cleaned;
}

//#endregion
export { runCli };