import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioPlayer } from "@discordjs/voice";
import slash_commands from "./slash_commands.js";
import commands from "./commands/commands.js";
import info from "./info.json" assert { type: "json"};
import fs from "fs";
import {fileURLToPath} from 'url';
import path from 'path';
import {start_server} from "./soundboard/soundboard.js"

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


if(!fs.existsSync("saved/")) {
    fs.mkdirSync("saved");
}

start_server();

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

export const player = createAudioPlayer();
export var connection = null;

export function joinVoice(invocation) {
    connection =  joinVoiceChannel({
        channelId: invocation.interaction.member.voice.channel.id,
        guildId: invocation.interaction.guild.id,
        adapterCreator: invocation.interaction.guild.voiceAdapterCreator,
    });
}

client.on("ready", async () => {
    console.log(`logged in as ${client.user.tag}`);
    await slash_commands(client, commands);
});

client.login(info.token);