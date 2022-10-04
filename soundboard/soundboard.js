import { player, __dirname } from "../main.js";
import fs from "fs";
import path from "path";
import { createAudioResource } from "@discordjs/voice";
import express from "express";

const app = express();

export function start_server() {
    app.use(express.static(path.join(__dirname, '/soundboard/client')));
    app.listen(3000, () => {
        console.log(`app running on port 3000`);
    });
}

app.post('/*', (req, res) => {
    const files = fs.readdirSync(path.join(__dirname, '/assets'));
    files.forEach(file => {
        if(req.url.substring(1) == file.split(".")[0]) {
            play_sound(`assets/${req.url}.mp3`)
        }
    });

    res.sendStatus(200);
});

export function play_sound(sound) {
    const resource = createAudioResource(fs.createReadStream(path.join(__dirname, sound)));
    player.play(resource);
}