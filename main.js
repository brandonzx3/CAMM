import { Client, GatewayIntentBits } from "discord.js";
import slash_commands from "./slash_commands.js";
import commands from "./commands/commands.js";
import info from "./info.json" assert { type: "json"};
import fs from "fs";

if(!fs.existsSync("saved/")) {
    fs.mkdirSync("saved");
}

export const client = new Client( {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    ],
})

console.log(commands);

client.on("ready", async () => {
    console.log(`logged in as ${client.user.tag}`);
    await slash_commands(client, commands);
});

client.login(info.token);