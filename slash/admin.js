const {Permissions, MessageEmbed} = require('discord.js');

exports.warn = {
    async execute(ctx, interaction) {
        let sender = interaction.member;
        let member = interaction.options.getMember('target');
        if (sender.permissions.has(Permissions.FLAGS.KICK_MEMBERS) || sender.id == "206903283090980864") {
            const em = new MessageEmbed();
            em.addField(`${member.displayName} (${member.id})`,`Joined at ${member.joinedAt.toDateString()}
            ${member.toString()}`);
            em.setThumbnail(member.user.displayAvatarURL());
            if(ctx.cfg.users == undefined) ctx.cfg.users = {};
            if(ctx.cfg.users[member.id] == undefined) ctx.cfg.users[member.id] = {}
            
            let msg = await interaction.reply(`This is a test: ${ctx.cfg["rootDir"]}`, { embeds: [em] });
            
        } else {
            await interaction.reply("You do not have permission to do that.");
        }
    }
};

exports.kick = {
    async execute(ctx, interaction) {
        let sender = interaction.member;
        let member = interaction.options.getMember('target');
        if (sender.permissions.has(Permissions.FLAGS.KICK_MEMBERS) || sender.id == "206903283090980864") {
            const em = new MessageEmbed();
            em.addField(`${member.displayName} (${member.id})`,`Joined at ${member.joinedAt.toDateString()}
            ${member.toString()}`);
            em.setThumbnail(member.user.displayAvatarURL());
            let msg = await interaction.reply({ embeds: [em] });
            
        } else {
            await interaction.reply("You do not have permission to do that.");
        }
    }
};

exports.kickban = {
    async execute(ctx, interaction) {
        let sender = interaction.member;
        let member = interaction.options.getMember('target');
        if (sender.permissions.has(Permissions.FLAGS.KICK_MEMBERS) || sender.id == "206903283090980864") {
            const em = new MessageEmbed();
            em.addField(`${member.displayName} (${member.id})`,`Joined at ${member.joinedAt.toDateString()}
            ${member.toString()}`);
            em.setThumbnail(member.user.displayAvatarURL());
            let msg = await interaction.reply({ embeds: [em] });
            
        } else {
            await interaction.reply("You do not have permission to do that.");
        }
    }
};  
