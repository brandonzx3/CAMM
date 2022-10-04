import { joinVoice, connection, __dirname, player } from "../main.js";
import { createAudioPlayer, createAudioResource } from "@discordjs/voice";
import path from "path";
import fs from "fs";
import { play_sound } from "../soundboard/soundboard.js";

export default {
    name: "join",
    description: "join the vc",
    handler: async(invocation) => {
        joinVoice(invocation);
        connection.subscribe(player);
        play_sound("assets/whats_up2.mp3");
    }
}