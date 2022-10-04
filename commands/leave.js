import { connection } from "../main.js"

export default {
    name: "leave",
    description: "leave the vc",
    handler: async(invocation) => {
        connection.destroy();
    }
}