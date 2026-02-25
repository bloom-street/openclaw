import { F as sendMessageTelegram, I as sendMessageDiscord, Nr as sendMessageSlack, Or as sendMessageWhatsApp, r as sendMessageIMessage } from "./loader-D1fSA4zX.js";
import { m as sendMessageSignal } from "./deliver-CnKfciqq.js";

//#region src/cli/deps.ts
function createDefaultDeps() {
	return {
		sendMessageWhatsApp,
		sendMessageTelegram,
		sendMessageDiscord,
		sendMessageSlack,
		sendMessageSignal,
		sendMessageIMessage
	};
}
function createOutboundSendDeps(deps) {
	return {
		sendWhatsApp: deps.sendMessageWhatsApp,
		sendTelegram: deps.sendMessageTelegram,
		sendDiscord: deps.sendMessageDiscord,
		sendSlack: deps.sendMessageSlack,
		sendSignal: deps.sendMessageSignal,
		sendIMessage: deps.sendMessageIMessage
	};
}

//#endregion
export { createOutboundSendDeps as n, createDefaultDeps as t };