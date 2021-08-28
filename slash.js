const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!').addUserOption(option => option.setName('target').setDescription('Select a user')),
	new SlashCommandBuilder().setName('role').setDescription('Replies with role info!').addRoleOption(option => option.setName('target').setDescription('Select a role')),
	new SlashCommandBuilder().setName('kick').setDescription('Kicks a user.').addUserOption(option => option.setName('target').setDescription('Select a person')),
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