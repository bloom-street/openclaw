import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { cn as getPrimaryCommand, dn as hasHelpOrVersion, in as buildParseArgv, r as isTruthyEnvValue } from "./entry.js";
import { r as resolveActionArgs } from "./helpers-3Jby5ubi.js";

//#region src/cli/program/action-reparse.ts
async function reparseProgramFromActionArgs(program, actionArgs) {
	const actionCommand = actionArgs.at(-1);
	const rawArgs = (actionCommand?.parent ?? program).rawArgs;
	const actionArgsList = resolveActionArgs(actionCommand);
	const fallbackArgv = actionCommand?.name() ? [actionCommand.name(), ...actionArgsList] : actionArgsList;
	const parseArgv = buildParseArgv({
		programName: program.name(),
		rawArgs,
		fallbackArgv
	});
	await program.parseAsync(parseArgv);
}

//#endregion
//#region src/cli/program/command-tree.ts
function removeCommand(program, command) {
	const commands = program.commands;
	const index = commands.indexOf(command);
	if (index < 0) return false;
	commands.splice(index, 1);
	return true;
}
function removeCommandByName(program, name) {
	const existing = program.commands.find((command) => command.name() === name);
	if (!existing) return false;
	return removeCommand(program, existing);
}

//#endregion
//#region src/cli/program/register.subclis.ts
var register_subclis_exports = /* @__PURE__ */ __exportAll({
	getSubCliCommandsWithSubcommands: () => getSubCliCommandsWithSubcommands,
	getSubCliEntries: () => getSubCliEntries,
	registerSubCliByName: () => registerSubCliByName,
	registerSubCliCommands: () => registerSubCliCommands
});
const shouldRegisterPrimaryOnly = (argv) => {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_LAZY_SUBCOMMANDS)) return false;
	if (hasHelpOrVersion(argv)) return false;
	return true;
};
const shouldEagerRegisterSubcommands = (_argv) => {
	return isTruthyEnvValue(process.env.OPENCLAW_DISABLE_LAZY_SUBCOMMANDS);
};
const loadConfig = async () => {
	return (await import("./config-8-je4WFT.js").then((n) => n.t)).loadConfig();
};
const entries = [
	{
		name: "acp",
		description: "Agent Control Protocol tools",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./acp-cli-Cre5IbZj.js")).registerAcpCli(program);
		}
	},
	{
		name: "gateway",
		description: "Run, inspect, and query the WebSocket Gateway",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./gateway-cli-Cfo_OWtx.js")).registerGatewayCli(program);
		}
	},
	{
		name: "daemon",
		description: "Gateway service (legacy alias)",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./daemon-cli-Dw0fvFG8.js").then((n) => n.t)).registerDaemonCli(program);
		}
	},
	{
		name: "logs",
		description: "Tail gateway file logs via RPC",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./logs-cli-DMLAOtDn.js")).registerLogsCli(program);
		}
	},
	{
		name: "system",
		description: "System events, heartbeat, and presence",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./system-cli-iVq-XFv-.js")).registerSystemCli(program);
		}
	},
	{
		name: "models",
		description: "Discover, scan, and configure models",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./models-cli-Do4_B4vX.js")).registerModelsCli(program);
		}
	},
	{
		name: "approvals",
		description: "Manage exec approvals (gateway or node host)",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./exec-approvals-cli-BdBt0tfR.js")).registerExecApprovalsCli(program);
		}
	},
	{
		name: "nodes",
		description: "Manage gateway-owned node pairing and node commands",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./nodes-cli-DXddra3m.js")).registerNodesCli(program);
		}
	},
	{
		name: "devices",
		description: "Device pairing + token management",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./devices-cli-B8cgzIBO.js")).registerDevicesCli(program);
		}
	},
	{
		name: "node",
		description: "Run and manage the headless node host service",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./node-cli-Cydy0VJN.js")).registerNodeCli(program);
		}
	},
	{
		name: "sandbox",
		description: "Manage sandbox containers for agent isolation",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./sandbox-cli-Bl3x7Sqa.js")).registerSandboxCli(program);
		}
	},
	{
		name: "tui",
		description: "Open a terminal UI connected to the Gateway",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./tui-cli-vm4LAGuZ.js")).registerTuiCli(program);
		}
	},
	{
		name: "cron",
		description: "Manage cron jobs via the Gateway scheduler",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./cron-cli-BgJR1_aa.js")).registerCronCli(program);
		}
	},
	{
		name: "dns",
		description: "DNS helpers for wide-area discovery (Tailscale + CoreDNS)",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./dns-cli-CWoKmXFq.js")).registerDnsCli(program);
		}
	},
	{
		name: "docs",
		description: "Search the live OpenClaw docs",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./docs-cli-BfH1b9E_.js")).registerDocsCli(program);
		}
	},
	{
		name: "hooks",
		description: "Manage internal agent hooks",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./hooks-cli-D1tVTsLt.js")).registerHooksCli(program);
		}
	},
	{
		name: "webhooks",
		description: "Webhook helpers and integrations",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./webhooks-cli-BMokPPr8.js")).registerWebhooksCli(program);
		}
	},
	{
		name: "qr",
		description: "Generate iOS pairing QR/setup code",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./qr-cli-SVk4R2Ac.js").then((n) => n.t)).registerQrCli(program);
		}
	},
	{
		name: "clawbot",
		description: "Legacy clawbot command aliases",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./clawbot-cli-CXM2NOQz.js")).registerClawbotCli(program);
		}
	},
	{
		name: "pairing",
		description: "Secure DM pairing (approve inbound requests)",
		hasSubcommands: true,
		register: async (program) => {
			const { registerPluginCliCommands } = await import("./cli-sYzxX_Ih.js");
			registerPluginCliCommands(program, await loadConfig());
			(await import("./pairing-cli-1QyGAXmA.js")).registerPairingCli(program);
		}
	},
	{
		name: "plugins",
		description: "Manage OpenClaw plugins and extensions",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./plugins-cli-DJ5PPwDT.js")).registerPluginsCli(program);
			const { registerPluginCliCommands } = await import("./cli-sYzxX_Ih.js");
			registerPluginCliCommands(program, await loadConfig());
		}
	},
	{
		name: "channels",
		description: "Manage connected chat channels (Telegram, Discord, etc.)",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./channels-cli-BmCBoZch.js")).registerChannelsCli(program);
		}
	},
	{
		name: "directory",
		description: "Lookup contact and group IDs (self, peers, groups) for supported chat channels",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./directory-cli-zLor3f7f.js")).registerDirectoryCli(program);
		}
	},
	{
		name: "security",
		description: "Security tools and local config audits",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./security-cli-u7w8xW6Z.js")).registerSecurityCli(program);
		}
	},
	{
		name: "skills",
		description: "List and inspect available skills",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./skills-cli-CH24UMr3.js")).registerSkillsCli(program);
		}
	},
	{
		name: "update",
		description: "Update OpenClaw and inspect update channel status",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./update-cli-_giLRfoG.js")).registerUpdateCli(program);
		}
	},
	{
		name: "completion",
		description: "Generate shell completion script",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./completion-cli-D-xlBEFa.js").then((n) => n.n)).registerCompletionCli(program);
		}
	}
];
function getSubCliEntries() {
	return entries;
}
function getSubCliCommandsWithSubcommands() {
	return entries.filter((entry) => entry.hasSubcommands).map((entry) => entry.name);
}
async function registerSubCliByName(program, name) {
	const entry = entries.find((candidate) => candidate.name === name);
	if (!entry) return false;
	removeCommandByName(program, entry.name);
	await entry.register(program);
	return true;
}
function registerLazyCommand(program, entry) {
	const placeholder = program.command(entry.name).description(entry.description);
	placeholder.allowUnknownOption(true);
	placeholder.allowExcessArguments(true);
	placeholder.action(async (...actionArgs) => {
		removeCommand(program, placeholder);
		await entry.register(program);
		await reparseProgramFromActionArgs(program, actionArgs);
	});
}
function registerSubCliCommands(program, argv = process.argv) {
	if (shouldEagerRegisterSubcommands(argv)) {
		for (const entry of entries) entry.register(program);
		return;
	}
	const primary = getPrimaryCommand(argv);
	if (primary && shouldRegisterPrimaryOnly(argv)) {
		const entry = entries.find((candidate) => candidate.name === primary);
		if (entry) {
			registerLazyCommand(program, entry);
			return;
		}
	}
	for (const candidate of entries) registerLazyCommand(program, candidate);
}

//#endregion
export { register_subclis_exports as a, registerSubCliCommands as i, getSubCliEntries as n, removeCommandByName as o, registerSubCliByName as r, reparseProgramFromActionArgs as s, getSubCliCommandsWithSubcommands as t };