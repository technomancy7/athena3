exports.kick = {
	async execute(ctx, interaction) {
        let sender = interaction.member;
		let member = interaction.options.getMember('target');

        if (true) { ///needs permissions check
            await interaction.reply("Good to go.");
        } else {
            await interaction.reply("Not good.");
        }
	},
};