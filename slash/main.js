//const { SlashCommandBuilder } = require('@discordjs/builders');
const discord = require('discord.js');
exports.server = {
	async execute(interaction) {
		await interaction.reply('Server info?!');
	},
};
exports.user = {
	async execute(ctx, interaction) {
		let member = interaction.options.getMember('target');
		console.log(member.user.flags.toArray());
		const em = new discord.MessageEmbed();
		em.addField(`${member.displayName} (${member.id})`,`Joined at ${member.joinedAt.toDateString()}
		Registered ${member.user.createdAt.toDateString()}
		Flags: ${member.user.flags.toArray()}
		${member.toString()}
`);
		em.setThumbnail(member.user.displayAvatarURL());
		await interaction.reply({ embeds: [em] });
	},
};

exports.role = {
	async execute(ctx, interaction) {
		let role = interaction.options.getRole('target');
		const em = new discord.MessageEmbed();
		em.addField(`${role.name} (${role.id})`,`Created ${role.createdAt.toDateString()}
		Managed: ${role.managed}
		Colour: ${role.hexColor} / ${role.color}
		${role.toString()}
`);
		em.setColor(role.color);
		await interaction.reply({ embeds: [em] });
	},
};


exports.addquote = {
	async execute(ctx, interaction) {
		let quote = interaction.options.getString('quote');
		let quoted = interaction.options.getString('person');
		let quotes = require('./data/quotes.json');
		let ts = moment().format('D-MM-YYYY');
		let built = {"content": quote, "from": quoted, "added_by": interaction.member.toString(), "timetamp": ts}
		quotes.items.push(built);
		quotes.total = quotes.items.length;
		fs.writeFileSync(ctx.cfg.rootDir+"data/quotes.json", JSON.stringify(quotes, null, 2));
		await interaction.reply(`Quote saved. (#${quotes.total-1}) `);
	},
};