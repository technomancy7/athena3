const {Permissions, MessageEmbed} = require('discord.js');

exports.kick = {
    async execute(ctx, interaction) {
        let sender = interaction.member;
        let member = interaction.options.getMember('target');
        if (sender.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            const em = new MessageEmbed();
            em.addField(`${member.displayName} (${member.id})`,`Joined at ${member.joinedAt.toDateString()}
            ${member.toString()}
            Say 'y' to confirm removal.`);
            em.setThumbnail(member.user.displayAvatarURL());
            let msg = await interaction.reply({ embeds: [em] });

            const filter = m => interaction.user.id === m.author.id;
            interaction.channel.awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
                .then(messages => {
                    interaction.followUp(`You've entered: ${messages.first().content}`);
                    msg.delete();
                })
                .catch(() => {
                    interaction.followUp('You did not enter any input!');
                });
        } else {
            await interaction.reply("Not good.");
        }
    }
};

exports.kickban = {
    async execute(ctx, interaction) {
        let sender = interaction.member;
        let member = interaction.options.getMember('target');
        if (sender.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            console.log('This member can kick and ban');
        } else {
            await interaction.reply("Not good.");
        }
    }
};  
