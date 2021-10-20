const {Permissions, MessageEmbed} = require('discord.js');
var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

exports.clearwarns = {
    async execute(ctx, interaction) {
        let sender = interaction.member;
        let member = interaction.options.getMember('target');
        if (sender.permissions.has(Permissions.FLAGS.KICK_MEMBERS) || sender.id == "206903283090980864") {
            let warns = getDataVar("users/"+member.user.id, "warns", 0);

            warns = 0;
            setDataVar("users/"+member.user.id, "warns", warns);

            saveData("users/"+member.user.id);

            await interaction.reply("Warnings cleared.");
            
        } else {
            await interaction.reply("You do not have permission to do that.");
        }
    }
};

exports.undowarn = {
    async execute(ctx, interaction) {
        let sender = interaction.member;
        let member = interaction.options.getMember('target');
        if (sender.permissions.has(Permissions.FLAGS.KICK_MEMBERS) || sender.id == "206903283090980864") {
            const em = new MessageEmbed();
            let warns = getDataVar("users/"+member.user.id, "warns", 0);

            warns--;
            setDataVar("users/"+member.user.id, "warns", warns);

            let history = getDataVar("users/"+member.user.id, "warn_history", []);
            
            if( history.length > 0 ) {
                let removed = history.pop();
                em.addField(`${member.displayName} (${member.id})`,`Removed: ${removed.text}, - ${removed.sender} @ ${removed.timestamp}`) 
            } else 
                em.addField(`${member.displayName} (${member.id})`,`Last warning removed.`) 
            
            setDataVar("users/"+member.user.id, "warn_history", history);

            saveData("users/"+member.user.id);

            await interaction.reply({ embeds: [em] });
            
        } else {
            await interaction.reply("You do not have permission to do that.");
        }
    }
};

exports.showwarns = {
    async execute(ctx, interaction) {
        let sender = interaction.member;
        let member = interaction.options.getMember('target');
        let reason = interaction.options.getString('reason');
        if (sender.permissions.has(Permissions.FLAGS.KICK_MEMBERS) || sender.id == "206903283090980864") {
            let warns = getDataVar("users/"+member.user.id, "warns", 0);
            let history = getDataVar("users/"+member.user.id, "warn_history", []);
            const em = new MessageEmbed();
            em.addField(`${member.displayName} (${member.id})`,`Joined at ${member.joinedAt.toDateString()}
            **Total warns**: ${warns}
            ${member.toString()}`);
            em.setThumbnail(member.user.displayAvatarURL());

            let i = 0
            for (let winfo of history){
                if(i == 5) break;
                em.addField(`#${i}`, `${winfo.text}\n${winfo.sender} @ ${winfo.timestamp}`)
                i++;
            }

            await interaction.reply({ embeds: [em] });
            
        } else {
            await interaction.reply("You do not have permission to do that.");
        }
    }
};

exports.warn = {
    async execute(ctx, interaction) {
        let sender = interaction.member;
        let member = interaction.options.getMember('target');
        let reason = interaction.options.getString('reason');
        if (sender.permissions.has(Permissions.FLAGS.KICK_MEMBERS) || sender.id == "206903283090980864") {
            const em = new MessageEmbed();
            em.addField(`${member.displayName} (${member.id})`,`Joined at ${member.joinedAt.toDateString()}
            ${member.toString()}`);

            let warns = getDataVar("users/"+member.user.id, "warns", 0);
            warns++;
            setDataVar("users/"+member.user.id, "warns", warns);

            let history = getDataVar("users/"+member.user.id, "warn_history", []);
            let n = dayjs.tz().tz("Europe/London").format("DD/MM/YYYY hh:mm A");
            history.push({text: reason, sender: member.toString(), timestamp: n});
            setDataVar("users/"+member.user.id, "warn_history", history);

            saveData("users/"+member.user.id);

            em.addField(`New warning`, `**Total**: ${warns}\n**Reason**: ${reason}`)
            em.setThumbnail(member.user.displayAvatarURL());
            await interaction.reply({ embeds: [em] });
            
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
