import fs from "fs";

export default {
    name: "post",
    description: "post a saved meme",
    contents: [
        {
            name: "filename",
            description: "name of the file",
            type: "string",
            required: true,
        }
    ],
    handler: async(invocation) => {
        let filename = invocation.contents.filename;

        let found = false;
        let type = null;

        fs.readdirSync("saved").forEach(file => {
            if(file.split(".")[0] == filename) {
                found = true;
                type = file.split(".")[1];
            }
        });

        if(found) {
            invocation.reply({files: [`saved/${filename}.${type}`]})
        } else {
            invocation.reply_private("no file found");
        }
    }
}