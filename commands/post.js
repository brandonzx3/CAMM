import fs from "fs";


function getFiles() {
    let files = [];
    fs.readdirSync("saved").forEach(file => {
        files.push(file.split(".")[0]);
    });
    return files
}


export default {
    name: "post",
    description: "post a saved meme",
    contents: [
        {
            name: "filename",
            description: "name of the file",
            type: "string",
            required: true,
            autocomplete_handler: ({ current_value, provide_choices }) => {
                provide_choices(getFiles().map(file => ({ name: file, value: file })));
            }
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