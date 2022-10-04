import { client } from "./../main.js";
import fs from "fs";
import request from "request";

export default {
    name: "save",
    description: "save a meme to repost later",

    contents: [
        {
            name: "message_id",
            description: "the id of the message",
            type: "string",
            required: true,
        },
        {
            name: "filename",
            description: "name to save the file under",
            type: "string",
            required: true,
        }
    ],

    handler: async(invocation) => {
        invocation.will_reply_eventually();
        let {message_id, filename} = invocation.contents;
        client.channels.fetch(invocation.interaction.channelId).then(channel => {
            channel.messages.fetch(message_id).then(message => {
                if(message.attachments.length == 0) {
                    invocation.reply("message has no attachments");
                    return;
                }

                request.get(message.attachments.first().url).pipe(fs.createWriteStream(`saved/${filename}.${message.attachments.first().contentType.split("/")[1]}`))
                invocation.reply(`saved meme as ${filename}.${message.attachments.first().contentType.split("/")[1]}`);
            });
        });
    }
}