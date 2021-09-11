const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token_freya } = require('./config.json');
let token = token_freya
const commands = [
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	
	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!').addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true)),
	
	new SlashCommandBuilder().setName('role').setDescription('Replies with role info!').addRoleOption(option => option.setName('target').setDescription('Select a role').setRequired(true)),
	
	new SlashCommandBuilder().setName('kick').setDescription('Kicks a user.').addUserOption(option => option.setName('target').setDescription('Select a person').setRequired(true)),
	
	new SlashCommandBuilder().setName('kickban').setDescription('Bans a user.').addUserOption(option => option.setName('target').setDescription('Select a person').setRequired(true)),
	
	new SlashCommandBuilder().setName('warn').setDescription('Warns a user.')
	.addUserOption(option => option.setName('target').setDescription('Select person').setRequired(true))
	.addStringOption(option => option.setName('reason').setDescription('Add reason').setRequired(true)),

	new SlashCommandBuilder().setName('addquote').setDescription('Saves a quote.')
	.addStringOption(option => option.setName('quote').setDescription('Text').setRequired(true))
	.addStringOption(option => option.setName('person').setDescription('Person').setRequired(true))	
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();
