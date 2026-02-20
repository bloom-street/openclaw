import { c as enableConsoleCapture, i as normalizeEnv, n as isTruthyEnvValue, p as defaultRuntime } from "./entry.js";
import "./auth-profiles-zEppz1dW.js";
import { p as resolveConfigDir } from "./utils-kK6fjsN0.js";
import "./exec-B8JKbXKW.js";
import "./agent-scope-nWSUqWp6.js";
import "./github-copilot-token-SLWintYd.js";
import "./pi-model-discovery-DzEIEgHL.js";
import { j as VERSION } from "./config-Cz6PlSb8.js";
import "./manifest-registry-Cu0J9bfE.js";
import "./server-context-Di_oV8Uv.js";
import "./chrome-C-gAdv-3.js";
import { r as formatUncaughtError } from "./errors-JRo_LuMk.js";
import "./control-service-1sfEiP_b.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-Mj23v3sw.js";
import "./tailscale-iX1Q6arn.js";
import "./client-Dzx1FlLz.js";
import "./auth-DVIDxtSd.js";
import "./call--K7CqSE5.js";
import "./message-channel-BlgPSDAh.js";
import "./links-Dh-sSJXk.js";
import "./plugin-auto-enable-C9YNTk3o.js";
import "./plugins-B-QGH1FX.js";
import "./logging-CfEk_PnX.js";
import "./accounts-DLdxtdRR.js";
import { Mt as installUnhandledRejectionHandler } from "./loader-Ds3or8QX.js";
import "./progress-Da1ehW-x.js";
import "./prompt-style-Dc0C5HC9.js";
import "./note-Ci08TSbV.js";
import "./clack-prompter-DuBVnTKy.js";
import "./onboard-channels-kxI3_baa.js";
import "./archive-D0z3LZDK.js";
import "./skill-scanner-Bp1D9gra.js";
import "./installs-DNzuaAfs.js";
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
import "./channels-status-issues-BthewJlG.js";
import { n as ensurePluginRegistryLoaded } from "./command-options-BA_srPlo.js";
import { a as getCommandPath, c as getPrimaryCommand, d as hasHelpOrVersion } from "./register.subclis-B0_zejJO.js";
import "./completion-cli-Cnvh4nr5.js";
import "./gateway-rpc-Cu95hbYd.js";
import "./deps-BrnYfb2t.js";
import { h as assertSupportedRuntime } from "./daemon-runtime-nbFDEt3d.js";
import "./service-DDPRbf8a.js";
import "./systemd-BEWwfwn0.js";
import "./service-audit-Bf1JrA1B.js";
import "./table-bnfGkIN7.js";
import "./widearea-dns-C-xzPxiS.js";
import "./audit-C8fKP_pz.js";
import "./onboard-skills-BMZpHZe4.js";
import "./health-format-CO_2F0Gi.js";
import "./update-runner-5heBZKYk.js";
import "./github-copilot-auth-COb5oGZR.js";
import "./logging-DJkpOGZF.js";
import "./hooks-status-Cn8_mGAg.js";
import "./status-D3DcFF4F.js";
import "./skills-status-DJBHAFFn.js";
import "./tui-CvbxznTw.js";
import "./agent-C-LFFPB6.js";
import "./node-service-u8g85nD3.js";
import "./auth-health-BKjcLUpk.js";
import { a as findRoutedCommand, n as emitCliBanner, t as ensureConfigReady } from "./config-guard-SoicVFB6.js";
import "./help-format-CUnac_bT.js";
import "./configure-MwZ3jPFl.js";
import "./systemd-linger-CDo2UbHM.js";
import "./doctor-D-NCiVx1.js";
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
	const { buildProgram } = await import("./program-D0icYwef.js");
	const program = buildProgram();
	installUnhandledRejectionHandler();
	process$1.on("uncaughtException", (error) => {
		console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
		process$1.exit(1);
	});
	const parseArgv = rewriteUpdateFlagArgv(normalizedArgv);
	const primary = getPrimaryCommand(parseArgv);
	if (primary) {
		const { registerSubCliByName } = await import("./register.subclis-B0_zejJO.js").then((n) => n.i);
		await registerSubCliByName(program, primary);
	}
	if (!(!primary && hasHelpOrVersion(parseArgv))) {
		const { registerPluginCliCommands } = await import("./cli-DECiVSgx.js");
		const { loadConfig } = await import("./config-Cz6PlSb8.js").then((n) => n.t);
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