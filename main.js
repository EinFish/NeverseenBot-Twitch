// @ts-check

import CONFIG from "./config.json" assert { type: "json" };
import WebSocket from "ws";
import Log from "./lib/log.js";

Log.options = { level: "INFO", timestamp: true };

const CLIENT = new WebSocket("ws://irc-ws.chat.twitch.tv:80");

CLIENT.on("open", () => {
	console.log("Running!");
	CLIENT.send(`PASS oauth:${CONFIG.token}`);
	CLIENT.send(`NICK ${CONFIG.user}`);
	for (let i of CONFIG.channel) {
		CLIENT.send(`JOIN #${i}`)
	}

	CLIENT.send(`PRIVMSG #${CONFIG.channel} :This is a sample message`);
});

CLIENT.on("message", event => {
	const MESSAGE = event.toString();

	if (MESSAGE.startsWith("PING")) {
		Log.append("Recieved PING, sending PONG...", { level: "WARN" });

		CLIENT.send("PONG :tmi.twitch.tv");
		return;
	}

	for (const LINE of MESSAGE.split("\r\n")) {
		if (LINE)
			Log.append(LINE);
	}

	if (/\btest\b/.test(MESSAGE)) {
		console.log(/#[0-9_a-z]+\s/.exec(MESSAGE))
		CLIENT.send(`PRIVMSG #${/#\w+\s/.exec(MESSAGE)} :HeyGuys <3 PartyTime`);
	}

	if (/\!neverseenbot\b/.test(MESSAGE)) {
		CLIENT.send(`PRIVMSG #${/#\w+\s/.exec(MESSAGE)} :Der NeverseenBot ist im Moment noch in Entwicklung. Für Mehr Infos bitte per Discord eine Direcknachricht an LeFish schreiben.`);
	}


});

CLIENT.on("close", event => {
	console.log('Connection Closed: ' + event.toString());
});

CLIENT.on("error", error => {
	Log.append(error.toString(), { level: "ERROR" });
});