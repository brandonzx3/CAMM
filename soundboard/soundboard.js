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

app.post('/hi', (req, res) => {
    play_sound("/assets/hi1.mp3");
    res.sendStatus(200);
});

app.post('/wow', (req, res) => {
    play_sound("/assets/wowwww.mp3");
    res.sendStatus(200);
});

app.post('/yes', (req, res) => {
    play_sound("/assets/yes.mp3");
    res.sendStatus(200);
});

app.post('/no', (req, res) => {
    play_sound("/assets/no1.mp3");
    res.sendStatus(200);
});

export function play_sound(sound) {
    const resource = createAudioResource(fs.createReadStream(path.join(__dirname, sound)));
    player.play(resource);
}