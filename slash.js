const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token_freya, slashGlobal } = require('./config.json');
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
	
	new SlashCommandBuilder().setName('verify').setDescription('Links your Discord account to your Wrath+ account.')
	.addStringOption(option => option.setName('email').setDescription('Your account email.').setRequired(true)),

	new SlashCommandBuilder().setName('confirm').setDescription('Confirms verification.')
	.addStringOption(option => option.setName('code').setDescription('Your pin number that would have been sent to your email.').setRequired(true)),

	new SlashCommandBuilder().setName('undowarn').setDescription('Removes last warning.')
	.addUserOption(option => option.setName('target').setDescription('Select person').setRequired(true)),
	
	new SlashCommandBuilder().setName('clearwarns').setDescription('Removes all warnings.')
	.addUserOption(option => option.setName('target').setDescription('Select person').setRequired(true)),

	new SlashCommandBuilder().setName('showwarns').setDescription('Shows a users warn history.')
	.addUserOption(option => option.setName('target').setDescription('Select person').setRequired(true)),

	new SlashCommandBuilder().setName('addquote').setDescription('Saves a quote.')
	.addStringOption(option => option.setName('quote').setDescription('Text').setRequired(true))
	.addStringOption(option => option.setName('person').setDescription('Person').setRequired(true)),

	new SlashCommandBuilder().setName('mute').setDescription('Mutes a user.')
	.addUserOption(option => option.setName('target').setDescription('Person to mute').setRequired(true))
	.addIntegerOption(option => option.setName('time').setDescription('Mute for how many seconds.'))	
	.addStringOption(option => option.setName('reason').setDescription('Reason for muting.')),
	
	new SlashCommandBuilder().setName('unmute').setDescription('Unutes a user.')
	.addUserOption(option => option.setName('target').setDescription('Person to unmute').setRequired(true)),

	new SlashCommandBuilder().setName('mutes').setDescription('Mute list.')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		if(slashGlobal != "true"){
			await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands },);
			console.log('Successfully registered application commands.');
		}else{
			await rest.put(Routes.applicationCommands(clientId), { body: commands },);
			console.log('Successfully registered global commands');
		}
		
	} catch (error) {
		console.error(error);
	}
})();
