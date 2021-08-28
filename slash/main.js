//const { SlashCommandBuilder } = require('@discordjs/builders');

exports.server = {
	async execute(interaction) {
		await interaction.reply('Server info?!');
	},
};
exports.user = {
	async execute(interaction) {
		let member = interaction.options.getMember('target');
		console.log(member.user.flags.toArray());
		await interaction.reply(`${member.displayName} (${member.id})
		${member.user.flags.toArray()}
		`);
	},
};