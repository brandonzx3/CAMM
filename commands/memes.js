import fs from "fs";
import {EmbedBuilder} from "discord.js";

export default {
    name: "memes",
    description: "view all the saved memes",
    handler: async(invocation) => {
        invocation.will_reply_eventually();
        let files_string = "";
        let totalFiles = 0;
        fs.readdirSync("saved").forEach(file => {
            console.log(file);
            files_string = files_string + file.split(".")[0] + "\n";
            totalFiles++;
        });
                
        if(totalFiles == 0) {
            invocation.reply("no memes saved");
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('AQUA')
            .setTitle(`every saved meme`)
            .setAuthor({name: "CAMM", iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org'})
            .addFields({ name: 'memes', value: files_string, inline: false })
            .setTimestamp();
        invocation.reply({ embeds: [embed]});
    }
}