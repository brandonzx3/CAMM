import { client } from "./../main.js";

export default {
    name: "save",
    description: "save a meme to repost later",

    contents: [
        {
            name: "content1",
            description: "the id of the message",
            type: "string",
            required: true,
        },
        {
            name: "content2",
            description: "the id of the message",
            type: "string",
            required: true,
        }
    ],

    handler: async(invocation) => {
        let message_id = invocation.contents.message;
        console.log(invocation.contents);
        client.channels.fetch(invocation.interaction.channelId).then(channel => {
            channel.messages.fetch(message_id).then(message => {
                //console.log(message.content);
            });
        });
        invocation.reply_private("sus");
    }
}