import { joinVoice, connection, __dirname, player } from "../main.js";
import { createAudioPlayer, createAudioResource } from "@discordjs/voice";
import path from "path";
import fs from "fs";
import { play_sound } from "../control_panel/server.js";

export default {
    name: "join",
    description: "join the vc",
    handler: async(invocation) => {
        if(invocation.interaction.member.voice.channel == null) {
            invocation.reply_private("you need to be in a vc to use this command");
            return;
        }
        joinVoice(invocation);
        connection.subscribe(player);
        let sounds = ["whats_up2", "hello1", "hello2", "hi1", "what_up"];

        play_sound(`assets/${sounds[Math.floor(Math.random() * sounds.length)]}.mp3`);
    }
}