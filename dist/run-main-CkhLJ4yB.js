import { a as normalizeEnv, an as getCommandPath, cn as getPrimaryCommand, dn as hasHelpOrVersion, l as enableConsoleCapture, ln as getVerboseFlag, on as getFlagValue, r as isTruthyEnvValue, rn as normalizeWindowsArgv, sn as getPositiveIntFlagValue, un as hasFlag, v as defaultRuntime } from "./entry.js";
import "./auth-profiles-D22D1tnt.js";
import "./agent-scope-Coy2hU9C.js";
import "./exec-G9-WTRVN.js";
import "./github-copilot-token-RNgXBxZS.js";
import "./host-env-security-DyQuUnEd.js";
import "./model-PL9Vv3mu.js";
import "./pi-model-discovery-CwESh4K1.js";
import "./frontmatter-17nP3KZr.js";
import "./skills-CWeJXlIQ.js";
import "./manifest-registry-BPlNBgie.js";
import { Mt as loadDotEnv } from "./config-8-je4WFT.js";
import { r as VERSION } from "./env-vars-iFkEK4MO.js";
import "./dock-vJULnCiC.js";
import "./message-channel-CIQTys4Q.js";
import "./sessions-DnWz3mBp.js";
import "./plugins-DvKi6MS1.js";
import "./accounts-g8UOA9ZQ.js";
import "./accounts-iAP56FFD.js";
import "./accounts-B7WS3ElX.js";
import "./bindings-BbU737An.js";
import "./logging-CFvkxgcX.js";
import "./send-BI_oS-O2.js";
import "./send-BQqBpjvF.js";
import "./subagent-registry-Dw-friub.js";
import "./paths-Dvmk_rXi.js";
import "./chat-envelope-BG_U_muK.js";
import "./client-BtjXMOD6.js";
import "./call-DPV6oCJz.js";
import "./pairing-token-qLzAsGdq.js";
import "./net-BEAjYacy.js";
import "./ip-m9Sjsn1o.js";
import "./tailnet-BOWO-AaH.js";
import "./tokens-D60Twogq.js";
import "./with-timeout-Cnopj6MR.js";
import "./deliver-9xjVesO1.js";
import "./diagnostic-J4rp2SRl.js";
import "./diagnostic-session-state-CT36_PCE.js";
import "./send-BwQmBBRl.js";
import "./image-ops-CdtmwUCR.js";
import "./pi-embedded-helpers-CUnO4-yq.js";
import "./sandbox-g9sAo3Nf.js";
import "./tool-catalog-DfeHwYkI.js";
import "./chrome-CANFQ1CL.js";
import "./tailscale-B21pc9dr.js";
import "./auth-Dw00sIWu.js";
import "./server-context-BDt9HA5B.js";
import "./redact-CjuqjXFe.js";
import { r as formatUncaughtError } from "./errors-DjnYuRJy.js";
import "./fs-safe-Cwp1VOPx.js";
import "./trash-CX7nB-3e.js";
import "./ssrf-BjDQh-0k.js";
import "./store-CP7czNHW.js";
import "./ports-CCM0e3iq.js";
import "./server-middleware-ti_BzwRQ.js";
import "./tool-images-DfuwmJ1p.js";
import "./thinking-BF74hBT8.js";
import "./models-config-C5xBkghi.js";
import "./exec-approvals-allowlist-BjFQS72U.js";
import "./exec-safe-bin-runtime-policy-D0oN33zd.js";
import "./reply-prefix-qWQjldya.js";
import "./manager-CoPj1rZi.js";
import "./gemini-auth-DN4H9iDm.js";
import "./fetch-guard-Dr618l5w.js";
import "./query-expansion-BI-SeFWF.js";
import "./retry-BpId8ooT.js";
import "./target-errors-DC5XTZKh.js";
import "./memory-cli-BsxoaEGv.js";
import "./chunk-BvqBAgzS.js";
import "./markdown-tables-DQTjtBah.js";
import "./local-roots-COWFLIjh.js";
import "./ir-CzZBRKhG.js";
import "./render-Bdn0My43.js";
import "./commands-BYJbc8Zu.js";
import "./commands-registry-C7HAdU56.js";
import "./image-CKyFOMEz.js";
import "./tool-display-Dgs8w-fd.js";
import { u as installUnhandledRejectionHandler } from "./runner-BRV4W8vJ.js";
import "./model-catalog-CpS_x7oW.js";
import "./pairing-store-1rtMKGCJ.js";
import "./fetch-SlSeGGhh.js";
import "./exec-approvals-B-M763CP.js";
import "./nodes-screen-BPGhiVFW.js";
import "./session-utils-DeyAFUX0.js";
import "./session-cost-usage-CvGuEEE6.js";
import "./skill-commands-D4Z4G94U.js";
import "./workspace-dirs-89PKlkQ6.js";
import "./channel-activity-DwztdGg8.js";
import "./tables-v6PcGfjo.js";
import "./server-lifecycle-BqO0h382.js";
import "./stagger-wClkZ9EC.js";
import "./channel-selection-BHkr2O0z.js";
import "./send-MOrPjcYX.js";
import "./outbound-attachment-C4fRhB3G.js";
import "./delivery-queue-ChFqRLAV.js";
import "./send-C5qGxwtz.js";
import "./resolve-route-BHtIWRaf.js";
import "./proxy-WehDGK1u.js";
import "./links-DNSoSnpZ.js";
import "./cli-utils-DyGKoc5l.js";
import "./help-format-CSCL71i7.js";
import "./progress-NYYdD1uh.js";
import "./replies-VOQW8ITc.js";
import "./onboard-helpers-DrCs3JdA.js";
import "./prompt-style-EoDyMHYF.js";
import "./pairing-labels-Ckll1_Oi.js";
import "./pi-tools.policy-3Jqks9s8.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-Bt9QsA1u.js";
import "./catalog-qxFkHr5X.js";
import "./note-BvX_qH_V.js";
import "./plugin-auto-enable-CnIXd7M7.js";
import { t as ensurePluginRegistryLoaded } from "./plugin-registry-m1RdPTew.js";
import { t as assertSupportedRuntime } from "./runtime-guard-D09-7j7u.js";
import { t as emitCliBanner } from "./banner-sD7eFxVG.js";
import "./doctor-config-flow-D9lsS9UP.js";
import { n as ensureConfigReady } from "./config-guard-Dp1RGI5c.js";
import process$1 from "node:process";
import { fileURLToPath } from "node:url";

//#region src/cli/program/routes.ts
const routeHealth = {
	match: (path) => path[0] === "health",
	loadPlugins: true,
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		const timeoutMs = getPositiveIntFlagValue(argv, "--timeout");
		if (timeoutMs === null) return false;
		const { healthCommand } = await import("./health-DNASItKU.js").then((n) => n.i);
		await healthCommand({
			json,
			timeoutMs,
			verbose
		}, defaultRuntime);
		return true;
	}
};
const routeStatus = {
	match: (path) => path[0] === "status",
	loadPlugins: true,
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const deep = hasFlag(argv, "--deep");
		const all = hasFlag(argv, "--all");
		const usage = hasFlag(argv, "--usage");
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		const timeoutMs = getPositiveIntFlagValue(argv, "--timeout");
		if (timeoutMs === null) return false;
		const { statusCommand } = await import("./status-Bq45DoOa.js").then((n) => n.t);
		await statusCommand({
			json,
			deep,
			all,
			usage,
			timeoutMs,
			verbose
		}, defaultRuntime);
		return true;
	}
};
const routeSessions = {
	match: (path) => path[0] === "sessions" && !path[1],
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const allAgents = hasFlag(argv, "--all-agents");
		const agent = getFlagValue(argv, "--agent");
		if (agent === null) return false;
		const store = getFlagValue(argv, "--store");
		if (store === null) return false;
		const active = getFlagValue(argv, "--active");
		if (active === null) return false;
		const { sessionsCommand } = await import("./sessions-DoEYJtW1.js").then((n) => n.n);
		await sessionsCommand({
			json,
			store,
			agent,
			allAgents,
			active
		}, defaultRuntime);
		return true;
	}
};
const routeAgentsList = {
	match: (path) => path[0] === "agents" && path[1] === "list",
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const bindings = hasFlag(argv, "--bindings");
		const { agentsListCommand } = await import("./agents-Bt0FUl7F.js").then((n) => n.t);
		await agentsListCommand({
			json,
			bindings
		}, defaultRuntime);
		return true;
	}
};
const routeMemoryStatus = {
	match: (path) => path[0] === "memory" && path[1] === "status",
	run: async (argv) => {
		const agent = getFlagValue(argv, "--agent");
		if (agent === null) return false;
		const json = hasFlag(argv, "--json");
		const deep = hasFlag(argv, "--deep");
		const index = hasFlag(argv, "--index");
		const verbose = hasFlag(argv, "--verbose");
		const { runMemoryStatus } = await import("./memory-cli-BsxoaEGv.js").then((n) => n.t);
		await runMemoryStatus({
			agent,
			json,
			deep,
			index,
			verbose
		});
		return true;
	}
};
function getCommandPositionals(argv) {
	const out = [];
	const args = argv.slice(2);
	for (const arg of args) {
		if (!arg || arg === "--") break;
		if (arg.startsWith("-")) continue;
		out.push(arg);
	}
	return out;
}
function getFlagValues(argv, name) {
	const values = [];
	const args = argv.slice(2);
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (!arg || arg === "--") break;
		if (arg === name) {
			const next = args[i + 1];
			if (!next || next === "--" || next.startsWith("-")) return null;
			values.push(next);
			i += 1;
			continue;
		}
		if (arg.startsWith(`${name}=`)) {
			const value = arg.slice(name.length + 1).trim();
			if (!value) return null;
			values.push(value);
		}
	}
	return values;
}
const routes = [
	routeHealth,
	routeStatus,
	routeSessions,
	routeAgentsList,
	routeMemoryStatus,
	{
		match: (path) => path[0] === "config" && path[1] === "get",
		run: async (argv) => {
			const pathArg = getCommandPositionals(argv)[2];
			if (!pathArg) return false;
			const json = hasFlag(argv, "--json");
			const { runConfigGet } = await import("./config-cli-C5k3Pt7X.js");
			await runConfigGet({
				path: pathArg,
				json
			});
			return true;
		}
	},
	{
		match: (path) => path[0] === "config" && path[1] === "unset",
		run: async (argv) => {
			const pathArg = getCommandPositionals(argv)[2];
			if (!pathArg) return false;
			const { runConfigUnset } = await import("./config-cli-C5k3Pt7X.js");
			await runConfigUnset({ path: pathArg });
			return true;
		}
	},
	{
		match: (path) => path[0] === "models" && path[1] === "list",
		run: async (argv) => {
			const provider = getFlagValue(argv, "--provider");
			if (provider === null) return false;
			const all = hasFlag(argv, "--all");
			const local = hasFlag(argv, "--local");
			const json = hasFlag(argv, "--json");
			const plain = hasFlag(argv, "--plain");
			const { modelsListCommand } = await import("./models-yk4ML09x.js").then((n) => n.t);
			await modelsListCommand({
				all,
				local,
				provider,
				json,
				plain
			}, defaultRuntime);
			return true;
		}
	},
	{
		match: (path) => path[0] === "models" && path[1] === "status",
		run: async (argv) => {
			const probeProvider = getFlagValue(argv, "--probe-provider");
			if (probeProvider === null) return false;
			const probeTimeout = getFlagValue(argv, "--probe-timeout");
			if (probeTimeout === null) return false;
			const probeConcurrency = getFlagValue(argv, "--probe-concurrency");
			if (probeConcurrency === null) return false;
			const probeMaxTokens = getFlagValue(argv, "--probe-max-tokens");
			if (probeMaxTokens === null) return false;
			const agent = getFlagValue(argv, "--agent");
			if (agent === null) return false;
			const probeProfileValues = getFlagValues(argv, "--probe-profile");
			if (probeProfileValues === null) return false;
			const probeProfile = probeProfileValues.length === 0 ? void 0 : probeProfileValues.length === 1 ? probeProfileValues[0] : probeProfileValues;
			const json = hasFlag(argv, "--json");
			const plain = hasFlag(argv, "--plain");
			const check = hasFlag(argv, "--check");
			const probe = hasFlag(argv, "--probe");
			const { modelsStatusCommand } = await import("./models-yk4ML09x.js").then((n) => n.t);
			await modelsStatusCommand({
				json,
				plain,
				check,
				probe,
				probeProvider,
				probeProfile,
				probeTimeout,
				probeConcurrency,
				probeMaxTokens,
				agent
			}, defaultRuntime);
			return true;
		}
	}
];
function findRoutedCommand(path) {
	for (const route of routes) if (route.match(path)) return route;
	return null;
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
function shouldSkipPluginCommandRegistration(params) {
	if (params.hasBuiltinPrimary) return true;
	if (!params.primary) return hasHelpOrVersion(params.argv);
	return false;
}
function shouldEnsureCliPath(argv) {
	if (hasHelpOrVersion(argv)) return false;
	const [primary, secondary] = getCommandPath(argv, 2);
	if (!primary) return true;
	if (primary === "status" || primary === "health" || primary === "sessions") return false;
	if (primary === "config" && (secondary === "get" || secondary === "unset")) return false;
	if (primary === "models" && (secondary === "list" || secondary === "status")) return false;
	return true;
}
async function runCli(argv = process$1.argv) {
	const normalizedArgv = normalizeWindowsArgv(argv);
	loadDotEnv({ quiet: true });
	normalizeEnv();
	if (shouldEnsureCliPath(normalizedArgv)) ensureOpenClawCliOnPath();
	assertSupportedRuntime();
	if (await tryRouteCli(normalizedArgv)) return;
	enableConsoleCapture();
	const { buildProgram } = await import("./program-CX7A0vK8.js");
	const program = buildProgram();
	installUnhandledRejectionHandler();
	process$1.on("uncaughtException", (error) => {
		console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
		process$1.exit(1);
	});
	const parseArgv = rewriteUpdateFlagArgv(normalizedArgv);
	const primary = getPrimaryCommand(parseArgv);
	if (primary) {
		const { getProgramContext } = await import("./program-context-DMkrV4MF.js").then((n) => n.n);
		const ctx = getProgramContext(program);
		if (ctx) {
			const { registerCoreCliByName } = await import("./command-registry-B281Ld3E.js").then((n) => n.t);
			await registerCoreCliByName(program, ctx, primary, parseArgv);
		}
		const { registerSubCliByName } = await import("./register.subclis-C9WnWpTo.js").then((n) => n.a);
		await registerSubCliByName(program, primary);
	}
	if (!shouldSkipPluginCommandRegistration({
		argv: parseArgv,
		primary,
		hasBuiltinPrimary: primary !== null && program.commands.some((command) => command.name() === primary)
	})) {
		const { registerPluginCliCommands } = await import("./cli-CpVwDkmI.js");
		const { loadConfig } = await import("./config-8-je4WFT.js").then((n) => n.t);
		registerPluginCliCommands(program, loadConfig());
	}
	await program.parseAsync(parseArgv);
}

//#endregion
export { runCli };