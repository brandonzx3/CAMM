export default {
    name: "ping",
    description: "pong",
    handler: async(invocation) => { invocation.reply_private("PONG!") }
}