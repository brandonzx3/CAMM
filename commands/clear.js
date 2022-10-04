import {PermissionsBitField} from "discord.js";

export default {
    name: "clear",
    description: "deletes a number of messages",
    contents: [
        {
            name: "ammount",
            description: "ammount of message to clear",
            type: "number",
            required: true,
        }
    ],
    handler: async(invocation) => {
        invocation.will_reply_private_eventually();
        let ammount = invocation.contents.ammount;

        if(!invocation.interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            invocation.reply_private("you dont have permissions to do this");
            return;
        }

        invocation.interaction.channel.bulkDelete(ammount).then(() => {
            invocation.reply_private(`removed ${ammount} messages`);
        });
    }
}