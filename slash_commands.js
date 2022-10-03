//Written with <3 by Christian

function verify_type(type) { return (obj) => typeof obj === type ? null : `Not of type ${type}`; }
function verify_struct(struct) {
	return (obj) => typeof obj === "object" ?
		Array.from(Object.keys(struct))
		.map(item => { const e = struct[item](obj[item]); return e == null ? null : `Field "${item}": < ${e} >`; })
		.reduce((a, b) => a == null ? b : a + (b == null ? "" : `,${b}`))
	: "Not of type object";
}
function verify_collection(check) {
	return (obj) => Array.isArray(obj) ?
		obj.map((item, i) => { const e = check(item); return e == null ? null : `Element ${i}: < ${e} >`; })
		.reduce((a, b) => a == null ? b : a + (b == null ? "" : `,${b}`))
	: "Not of type array";
}
function verify_optional(check) { return (obj) => obj == null ? null : check(obj) }
function verify_both(a, b) { return (obj) => { const ar = a(obj); return ar == null ? b(obj) : ar; } }

const command_content_types = {
	string: 3,
	number: 10,
	integer: 4,
	boolean: 5,
	user: 6,
	channel: 7,
	role: 8,
	mentionable: 9,
	subcommand: 10,
	subcommand_group: 11,
};
const channel_types = {
	guild_text: 0,
	dm: 1,
	guild_voice: 2,
	group_dm: 3,
	guild_channel_category: 4,
	guild_news_channel: 5,
	guild_store_channel: 6,
	guild_news_thread: 10,
	guild_public_thread: 11,
	guild_private_thread: 12,
	guild_stage_voice: 13,
};

const check_choices_structure = verify_both(verify_collection(verify_struct({
	name: verify_type("string"),
	value: (obj) => typeof obj === "string" || typeof obj === "number" ? null : "Not of type string or number",
})), obj => obj.length <= 25 ? null : "Choices has max length of 25");

const check_commands_structure = verify_collection(verify_struct({
	name: verify_type("string"),
	description: verify_type("string"),
	enabled_by_default: verify_optional(verify_type("boolean")),
	contents: verify_optional(verify_collection(verify_struct({
		name: verify_type("string"),
		description: verify_type("string"),
		required: verify_type("boolean"),
		type: (type) => type in command_content_types ? null : "Not a valid argument type",
		autocomplete_handler: verify_optional(verify_type("function")),
		choices: verify_optional(check_choices_structure),
		subcommand_contents: verify_optional(verify_collection((obj) => check_config_structure(obj))),
		allowed_channel_types: verify_optional(verify_collection((type) => type in channel_types ? null : "Not a valid channel type")),
		min_number: verify_optional(verify_type("number")),
		max_number: verify_optional(verify_type("number")),
	}))),
	handler: verify_type("function"),
}));


export default async function(client, commands) {
	let config_error = check_commands_structure(commands);
	if (config_error != null) {
		config_error = "Slash Command Config Error: " + config_error;
		console.error(config_error);
		throw config_error;
	}

	const cmds = await client.application.commands.set(commands.map(config => ({
		name: config.name,
		description: config.description,
		defaultPermission: config.enabled_by_default ?? true,
		type: 1,
		options: (config.contents ?? []).map(item => ({
			type: command_content_types[item.type],
			name: item.name,
			description: item.description,
			required: item.required,
			choices: item.choices != null ? Array.from(item.choices) : undefined,
			//autocomplete: item.choices == null ? item.autocomplete_handler != null : undefined,
			...(item.choices == null ? { autocomplete: item.autocomplete_handler != null } : {}),
			options: item.subcommand_contents ?? undefined,
			channelTypes: item.allowed_channel_types?.map(type => channel_types[type]) ?? undefined,
			minValue: item.min_number ?? undefined,
			maxValue: item.max_number ?? undefined,
		}))
	})));

	const registered_commands = new Map();
	async function interaction_handler(interaction) {
		const handler = registered_commands.get(interaction.commandId);
		if (handler != null) handler(interaction);
	}
	client.on("interactionCreate", interaction_handler);

	commands.forEach((config, i) => {
		const default_contents = {};
		function snapify_default_contents(contents) {
			for (const item of contents) {
				if (item.type === command_content_types.subcommand || item.type === command_content_types.subcommand_group) {
					snapify_default_contents(item.subcommand_contents);
				} else {
					default_contents[item.name] = null;
				}
			}
		}
		snapify_default_contents(config.contents ?? []);

		function resolve_options(options, ret) {
			let subcommand = null;
			for (const option of options) {
				if (option.type === "BOOLEAN" || option.type === "NUMBER" || option.type === "INTEGER" || option.type === "STRING") ret[option.name] = option.value;
				else if (option.type === "USER") ret[option.name] = option.user;
				else if (option.type === "CHANNEL") ret[option.name] = option.channel;
				else if (option.type === "ROLE") ret[option.name] = option.role;
				else if (option.type === "MENTIONABLE") ret[option.name] = option.user ?? option.channel ?? option.role;
				else if (option.type === "SUB_COMMAND" || option.type === "SUB_COMMAND_GROUP") {
					subcommand = option.name;
					const subsub = resolve_options(option.options, ret);
					if (subsub != null) subcommand += "/" + subsub;
				}
				if (option.focused === true) ret.__focused = option.name;
			}
			return subcommand;
		}

		registered_commands.set(cmds.at(i).id, async interaction => {
			if (interaction.type === "APPLICATION_COMMAND" || interaction.type === 2) {
				try {
					const contents = { ...default_contents };									
					const subcommand = resolve_options(interaction.options.data ?? [], contents);
					let has_replied = false;
					let has_deferred = null;
					function my_reply(is_private, ...args) {
						if (has_replied) throw new Error(`Double reply in command "${config.name}"`);
						has_replied = true;
						if (typeof args[0] === "string") args[0] = { content: args[0] };
						args[0].ephemeral = is_private;
						if (has_deferred == null) {
							return interaction.reply(...args);
						} else {
							return has_deferred.then(async msg => {
								await interaction.followUp(...args);
								//await msg.delete();
							});
						}
					}
					await Promise.resolve(config.handler({
						contents,
						subcommand,
						interaction,
						reply: my_reply.bind(null, false),
						reply_private: my_reply.bind(null, true),
						will_reply_eventually: () => { has_deferred = interaction.deferReply({ ephemeral: false, fetchReply: true }); },
						will_reply_private_eventually: () => { has_deferred = interaction.deferReply({ ephemeral: true, fetchReply: true }); },
					}));
					if (!interaction.deferred && !interaction.replied && !has_replied && !has_deferred) {
						console.error(`The command "${config.name}" did not provide a reply or defer`);
						my_reply(true, "The app did not provide a reply or defer T_T");
					}
				} catch (e) {
					console.error(`Error in command "${config.name}":`);
					console.error(e);
					try {
						interaction.ephemeral = true;
						await interaction.reply(e.toString());
					}
					catch {}
				}
			} else if (interaction.type === "APPLICATION_COMMAND_AUTOCOMPLETE" || interaction.type === 4) {
				let responded = false;
				try {
					const contents = { ...default_contents };									
					const subcommand = resolve_options(interaction.options?.data ?? [], contents);
					if (typeof contents.__focused === "string") {
						let item = null;
						function find_item(search_in) {
							for (const current_item of search_in) {
								if (current_item.name === contents.__focused) { item = current_item; }
								if (Array.isArray(current_item.subcommand_contents)) find_item(current_item.subcommand_contents);
							}
						}
						find_item(config.contents ?? []);
						if (typeof item?.autocomplete_handler === "function") {
							await Promise.resolve(item.autocomplete_handler({
								current_value: contents[item.name],
								contents,
								subcommand,
								interaction,
								provide_choices: async (choices) => {
									const err = check_choices_structure(choices);
									if (err != null) throw new Error(err);
									responded = true;
									await interaction.respond(choices);
								},
							}));
							if (!responded) console.error(`Autocompletion for command "${config.name}" did not respond`);
						} else {
							console.error(`Autocompletion for command "${config.name}" ended up in narnia`);
						}
					}
				} catch (e) {
					console.error(`Error in autocompletion for command "${config.name}":`);
					console.error(e);
				}
				if (!responded) try {
					await interaction.respond([]);					
				} catch {}
			}
		});
	});
}
