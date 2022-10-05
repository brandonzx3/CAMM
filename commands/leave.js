import { connection } from "../main.js"

export default {
    name: "leave",
    description: "leave the vc",
    handler: async(invocation) => {
        if(connection == null || connection._state.status == "destroyed") {
            invocation.reply_private("no");
            return;
        }
        connection.destroy();
    }
}