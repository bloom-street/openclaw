import "./paths-B4BZAPZh.js";
import "./utils-7gb3VEps.js";
import "./thinking-EAliFiVK.js";
import { _t as loadOpenClawPlugins } from "./reply-B71GWwIQ.js";
import { l as resolveAgentWorkspaceDir, u as resolveDefaultAgentId } from "./agent-scope-nvzGbP5e.js";
import { t as createSubsystemLogger } from "./subsystem-C5Sd3JES.js";
import "./exec-DnsD91Q4.js";
import "./model-selection-DooR7GQG.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-BgXe2hyu.js";
import "./env-DkKx0PT3.js";
import "./host-env-security-ljCLeQmh.js";
import "./message-channel-C8Keu0lE.js";
import "./send-K9smqp-y.js";
import { i as loadConfig } from "./config-DNKWBHAH.js";
import "./env-vars-CvvqezS9.js";
import "./manifest-registry-C6u54rI3.js";
import "./dock-ivyty9f-.js";
import "./runner-BEGrwMIi.js";
import "./image-DhuBIJBJ.js";
import "./models-config-ixfzwQFB.js";
import "./pi-model-discovery-Bakt-Qrp.js";
import "./pi-embedded-helpers-BsRZNe-O.js";
import "./sandbox-EJpX6-Td.js";
import "./tool-catalog-B7bNs0Qm.js";
import "./chrome-DG3CD5t4.js";
import "./tailscale-iTlFoOvr.js";
import "./ip-D0zgNmBV.js";
import "./tailnet-CEudzG0i.js";
import "./ws-BTdBA7Dw.js";
import "./auth-Byh9Posp.js";
import "./server-context-Dko19I6m.js";
import "./frontmatter-DR47FZL2.js";
import "./skills-H7U30Ato.js";
import "./redact-DKEWQ4ef.js";
import "./errors-DiV2hVgY.js";
import "./fs-safe-DwCRJYoe.js";
import "./trash-BlINPotY.js";
import "./ssrf-D0C-ivqd.js";
import "./image-ops-CT4_RMYw.js";
import "./store-to0SxvTa.js";
import "./ports-CMYOQ1Xv.js";
import "./server-middleware-CQ0JmE7W.js";
import "./sessions-BVFFX_jz.js";
import "./plugins-BpAzc5Av.js";
import "./accounts-CvQo4BE0.js";
import "./accounts-C-f1i1Zq.js";
import "./accounts-D5BIfedQ.js";
import "./bindings-n9iduK6p.js";
import "./logging-B-Pt-Wis.js";
import "./send-Wc_G_Dsy.js";
import "./paths-DI5fQaUg.js";
import "./chat-envelope-CurikSJo.js";
import "./tool-images-GXybOr7q.js";
import "./tool-display-KYKCFyFz.js";
import "./fetch-guard-CTPIWqvT.js";
import "./api-key-rotation-Cxcwtq4h.js";
import "./local-roots-0gW1HLRP.js";
import "./query-expansion-Bo6ZAbxf.js";
import "./model-catalog-CpfIFRmQ.js";
import "./tokens-PTnOjHgI.js";
import "./deliver-BipvxMSl.js";
import "./commands-C2YxYKKq.js";
import "./commands-registry-DO8Ftxlm.js";
import "./pairing-store-BQL9BwgW.js";
import "./fetch-eEAfxvAs.js";
import "./retry-dPM748IP.js";
import "./client-Bri_7bSd.js";
import "./call--R2Hm6fa.js";
import "./pairing-token-CQfAUfX7.js";
import "./exec-approvals-iddzAkMA.js";
import "./exec-approvals-allowlist-C38D7mVU.js";
import "./exec-safe-bin-runtime-policy-HsbYVqrh.js";
import "./nodes-screen-opLf0Qii.js";
import "./target-errors-Bbcb8HkZ.js";
import "./diagnostic-session-state-JV4FeXBS.js";
import "./with-timeout-Ddc1l_S2.js";
import "./diagnostic--FsaT1D9.js";
import "./send-Ch5nPbw4.js";
import "./model-BwDKysjD.js";
import "./reply-prefix-GUnERdIb.js";
import "./manager-DlMbml4y.js";
import "./memory-cli-CjaBzQyD.js";
import "./chunk-gB6ZX5eV.js";
import "./markdown-tables-DCCnx4EK.js";
import "./ir-DwskLeFt.js";
import "./render-CJf9B8C2.js";
import "./channel-activity-BCt2tLHC.js";
import "./tables-CgwwjLs4.js";
import "./send-BQ9LFDyS.js";
import "./proxy-R5TjOIFS.js";
import "./links-syoLpaiN.js";
import "./cli-utils-BeUql7qI.js";
import "./help-format-DupoBL1v.js";
import "./progress-CzLXOXj6.js";
import "./resolve-route-2uU1JdZu.js";
import "./replies-DgZvyImS.js";
import "./skill-commands-Djl590Nh.js";
import "./workspace-dirs-jYWdJnJD.js";
import "./channel-selection-DpfnuVd0.js";
import "./outbound-attachment-DaFMk2CL.js";
import "./delivery-queue-IAlLZqh_.js";
import "./session-cost-usage-DY1V4m1N.js";
import "./send-Bwo_oFc_.js";
import "./onboard-helpers-pFN8AubL.js";
import "./prompt-style-Cpb9Qgq-.js";
import "./pairing-labels-hp8UWhD3.js";
import "./server-lifecycle-DRkdnrWW.js";
import "./stagger-C9cy2z6C.js";
import "./pi-tools.policy-BpTbZ0iD.js";

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