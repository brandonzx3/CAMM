import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioPlayer } from "@discordjs/voice";
import slash_commands from "./slash_commands.js";
import commands from "./commands/commands.js";
import info from "./info.json" assert { type: "json"};
import fs from "fs";
import {fileURLToPath} from 'url';
import path from 'path';
import {start_server} from "./control_panel/server.js"

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

let sadie_message = `In accordance with the Sadie Inclusion Act of 1983:\n\n<@${info.sadie}>\n\n> *I am a bot. This action was performed automatically.*`;
client.on("messageCreate", async (message) => {
    let normal_ping = message.content.split(/<@\d+>/).length - 1;
    let mass_ping = message.content.split(/<@&\d+>|@everyone|@here/).length - 1;
    if(mass_ping >= 1) {
        message.channel.send(sadie_message);
    } else if(normal_ping >= 3) {
        message.channel.send(sadie_message);
    }
});

client.login(info.token);