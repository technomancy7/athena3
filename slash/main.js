//const { SlashCommandBuilder } = require('@discordjs/builders');
const discord = require('discord.js');
const { Permissions } = require('discord.js');
var axios = require("axios")
async function handleVerifyRole(ctx, member){
    let guild = ctx.client.guilds.cache.get("680834114605416452");
    let url = "https://devtest.wrathplus.com/api/discord/getDiscordDonators";
    const response = await axios.get(url);
    let elite = guild.roles.cache.find(role => role.name === 'Elite');
    let contributor = guild.roles.cache.find(role => role.name === 'Contributor');
    let champion = guild.roles.cache.find(role => role.name === 'Champion');
    let supreme = guild.roles.cache.find(role => role.name === 'Supreme');
    let resp = response.data;

    for(let user of resp){
        if(user.discord_uuid == member.user.id){
            if(user.rank_donate == 2){
                if(member.roles.cache.some(role => role.name === "Contributor")) member.roles.remove(contributor)
                if(member.roles.cache.some(role => role.name === "Champion")) member.roles.remove(champion)
                if(member.roles.cache.some(role => role.name === "Supreme")) member.roles.remove(supreme)
                if(!member.roles.cache.some(role => role.name === "Elite")) member.roles.add(elite)
            } else if(user.rank_donate == 3){
                if(!member.roles.cache.some(role => role.name === "Contributor")) member.roles.add(contributor)
                if(member.roles.cache.some(role => role.name === "Champion")) member.roles.remove(champion)
                if(member.roles.cache.some(role => role.name === "Supreme")) member.roles.remove(supreme)
                if(member.roles.cache.some(role => role.name === "Elite")) member.roles.remove(elite)
            } else if(user.rank_donate == 4){
                if(member.roles.cache.some(role => role.name === "Contributor")) member.roles.remove(contributor)
                if(!member.roles.cache.some(role => role.name === "Champion")) member.roles.add(champion)
                if(member.roles.cache.some(role => role.name === "Supreme")) member.roles.remove(supreme)
                if(member.roles.cache.some(role => role.name === "Elite")) member.roles.remove(elite)
            } else if(user.rank_donate == 5){
                if(member.roles.cache.some(role => role.name === "Contributor")) member.roles.remove(contributor)
                if(member.roles.cache.some(role => role.name === "Champion")) member.roles.remove(champion)
                if(!member.roles.cache.some(role => role.name === "Supreme")) member.roles.add(supreme)
                if(member.roles.cache.some(role => role.name === "Elite")) member.roles.remove(elite)
            }
        }
    }
}
global.waiting_for_verify = {};

const errors = {
	"account-already-verified": "This account is already verified.",
	"no-such-email": "That email does not exist in our database, try another.",
	"no-discord-uuid": "Could not retrieve Discord User ID, try again later.",
	"no-such-user": "User could not be found in the database.",
	"invalid-update-data": "There was a problem updating the database. Excuse me while I call for help.\n\nHEY <@!680661841609097231> IT BROKE"
};

function getErr(code){
	if(code == undefined) return "An unknown error occurred.";
	if(errors[code] != undefined) return errors[code];
	else return `An error has occurred handling that request. ${code}`
}

exports.confirm = {
	async execute(ctx, slash) {
		const code = slash.options.getString('code');
		const url2 = "https://devtest.wrathplus.com/api/verifyDiscord/2";

		if(waiting_for_verify[slash.member.user.id] != undefined){
			console.log(waiting_for_verify[[slash.member.user.id]])
			const pin = user_id = waiting_for_verify[slash.member.user.id].pin
			if(code != pin){
				waiting_for_verify[slash.member.user.id].attempts++;
				if(waiting_for_verify[slash.member.user.id].attempts < 3){
					await slash.reply({content: `Pin did not match, try again. (Attempt ${waiting_for_verify[slash.member.user.id].attempts})`, ephemeral: true});
				} else {
					await slash.reply({content: `Too many attempts, process ended.`, ephemeral: true});
					delete waiting_for_verify[slash.member.user.id];
				}

			} else {
				let user_id = waiting_for_verify[slash.member.user.id].user_id
				let p2 = {status: "success", user_id: user_id, discord_uuid: slash.member.user.id}
				const response = await axios.get(url2, {params: p2});
				console.log(JSON.stringify(response.data));
				if(response.data.status == "ok"){
					await slash.reply({content: "Verification process has been completed.\nIf you have donated to the server already, your rank will be applied automatically soon.", ephemeral: true});
					handleVerifyRole(slash, slash.member);
					let verified = slash.member.guild.roles.cache.get('713086790009094254');
					slash.member.roles.add(verified);
				} else {
					await slash.reply({content: getErr(resp.details), ephemeral: true});
				}
				delete waiting_for_verify[slash.member.user.id];
			}
		} else {
			await slash.reply({content: "No verification waiting for you.", ephemeral: true});
		}
	}
}
exports.verify = {
	async execute(ctx, slash) {
		const email = slash.options.getString('email');
		const filter = m => slash.member.user.id === m.author.id;
		//const headers = {headers: {"Content-Type": "application/json"}};


        const url1 = "https://devtest.wrathplus.com/api/verifyDiscord/1"

        //await ctx.send(`Debug: Sending email as ${email}.`)
        //const response = await axios.post(url1, {email: email, token: ""}, headers);
        const response = await axios.get(url1, {params: {
            account_email:email, 
            discord_uuid:slash.member.user.id,
            token: "bjXNN6kGqJgUp6wpCsV5BpsuqEMS7Zm8zbdjfstxG8UqQnYkfjxDUR8V73GduNnq"
        }});

		let resp = response.data;
        console.log(JSON.stringify(resp));
        //await ctx.send("```js\n"+JSON.stringify(resp)+"\n```");
        if(resp.status == "ok"){
            await slash.reply({content: "A Verification PIN code has been sent to your email.\nOnce you receive it, respond with /confirm PIN (For example: /confirm 091249) to complete the verification process.", ephemeral: true});
            waiting_for_verify[slash.member.user.id] = {pin: resp.pin, user_id: resp.user_id, attempts: 0}
        } else if(resp.status == "error"){ await slash.reply({content: getErr(resp.details), ephemeral: true}); }
	},
};

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

exports.unmute = {
	async execute(ctx, interaction) {
		let target = interaction.options.getMember('target');
		let member = interaction.member;

		if (member.permissions.has([Permissions.FLAGS.MANAGE_MESSAGES])
		|| member.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS])) {
			let muted = interaction.guild.roles.cache.find(role => role.name === 'Muted')
			if (target.roles.cache.some(role => role.name == "Muted")) {
				
				target.roles.remove(muted);
				await interaction.reply(`User ${target} was unmuted.`);

				let data = getData("mute");
				if(data[target.id] != undefined){
					delete data[target.id]
					saveData("mute");
				}
				
			} else {
				await interaction.reply("User is not muted.");
			}
		} else {
			await interaction.reply("You don't have permission to do that.");
		}

	},
}

exports.mutes = {
	async execute(ctx, interaction) {
		let data = getData("mute");
		const em = new discord.MessageEmbed();
		let fields = 0;
		for (let info of Object.keys(data)){	
			let muted = data[info];
			let guild = interaction.client.guilds.cache.get(muted.guild);

			let members = await ctx.guild.members.fetch();
			let member = members.get(muted.member);
			let channel = guild.channels.cache.get(muted.channel);
			let moderator = members.get(muted.muted_by);
			em.addField(`${member.user.username} (${member.id})`,`${member}
			Channel: ${channel}
			Reason: ${muted.reason} (From ${moderator})
			Time remaining: ${muted.time}`);
			fields++;
		}
		if(fields == 0){
			em.addField(`None`,`No mutes saved.`);
		}
		await interaction.reply({ embeds: [em] });
	}
}

exports.mute = {
	async execute(ctx, interaction) {
		let target = interaction.options.getMember('target');
		let time = interaction.options.getInteger('time');
		let reason = interaction.options.getString('reason');
		if(reason == null) reason = "No reason given.";
		let member = interaction.member;
		let channel = interaction.channel;

		if (member.permissions.has([Permissions.FLAGS.MANAGE_MESSAGES])
		|| member.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS])) {
			let muted = interaction.guild.roles.cache.find(role => role.name === 'Muted')
			if (!target.roles.cache.some(role => role.name == "Muted")) {
				
				target.roles.add(muted);

				if (time == null) time = "∞";
				setDataVar("mute", target.user.id, {time: time, guild: channel.guild.id, muted_by: member.id, reason: reason, member: target.user.id, channel: channel.id}); 
				saveData("mute"); 
				await interaction.reply(`User ${target} was muted, ${reason}. (${time}s)`);
			} else {
				await interaction.reply(`User ${target} was already muted.`);
			}
		} else {
			await interaction.reply("You don't have permission to do that.");
		}

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