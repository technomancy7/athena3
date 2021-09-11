var common = require('../common.js');
const print = common.print;
const util = require('util');
const discord = require('discord.js');
const fs = require("fs");
const luaState = require('lua-in-js');
const luaEnv = luaState.createEnv();
var moment = require('moment');
const checks = require('../checks.js');
const { createCanvas, loadImage } = require('canvas')

async function convertImage(path, toType = "jpeg", cb){
    loadImage(path).then((img) => {
        const canvas = createCanvas(img.height, img.width)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0);
        let paths = path.split("/")
        let outf = paths[paths.length-1].split(".")[0]
        let out;
        let stream;
        if(toType == "jpeg" || toType == "jpg") {
			outf = outf+".jpeg"
            stream = canvas.createJPEGStream()
        } else {
			outf = outf+".png"
            stream = canvas.createPNGStream()
        }
		out = fs.createWriteStream(rootDir+'/img/'+outf)
        stream.pipe(out)
        out.on('finish', () =>  console.log(`The ${toType} file was created.`))
		if(cb != undefined){
			cb(outf, stream);
		}
      }).catch(err => {
        console.log('oh no!', err)
    })
}

async function handleMsgAttachments(msg){
	let autofmt_exts = ["bmp"];
	msg.attachments.each(async (atch) => {
		if(autofmt_exts.includes(atch.name.split(".")[1])){
			convertImage(atch.url, 'jpg', function(filename, stream) {
				const attachment = new discord.MessageAttachment(stream, filename);
				msg.reply({ files: [attachment] });
			});
		}
	});
}

async function handleUserJoin(member){
	let cfg = require(rootDir+'config.json')
	if(cfg[member.guild.id] && cfg[member.guild.id].alertChannel){
		const em = new discord.MessageEmbed();

		em.addField(`${member.displayName} (${member.id})`,`Joined at ${member.joinedAt.toDateString()}
		Registered ${member.user.createdAt.toDateString()}
		Flags: ${member.user.flags.toArray()}
		${member.toString()}`);
		em.setThumbnail(member.user.displayAvatarURL());
		let chan = member.guild.channels.cache.some(c => c.id === "421285829818974209")
		await chan.send(em);
	}
}

exports.onRemove = function(ext){
	ext.client.removeListener('messageCreate', handleMsgAttachments);
	ext.client.removeListener('guildMemberAdd', handleUserJoin);
}

exports.onLoad = function(ext) {
	ext.client.on('messageCreate', handleMsgAttachments);
	ext.client.on('guildMemberAdd', handleUserJoin);
}

exports.inspect = {
	help: "Views source code of a JS object.",
	aliases: ['src'],
	group: "utility",
	usage: "[fn]",
	execute: async function(ctx){
		let fn = undefined;
		if (ctx.args[0] == "cmd"){
			fn = ctx.commands.commands[ctx.args[1]].execute;
		}else if (ctx.args[0] == "common"){
			fn = common[ctx.args[1]];
		}else if (ctx.args[0] == "ctx"){
			if (ctx.args.length == 2)
				fn = ctx[ctx.args[1]];
			else if (ctx.args.length == 3)
				fn = ctx[ctx.args[1]][ctx.args[2]];
		}

		if (fn != undefined){ctx.code(fn.toString(), 'js');}else{ctx.say("Function definition not found.");}
		
	}
};

exports.run = {
	help: "Simulate command settings.",
	group: "admin",
	flags: ['$owner'],
	execute: async function(ctx) {
		let args = ctx.args;
		if (!checks.isOwner(ctx)){return;}
		const mode = args.shift();
		const target = args.shift();
		const command = args.shift();
		const cargs = args;

		if (mode == "as"){
			const m = ctx.findMember(target);
			var n = await ctx.newCtx(ctx.message);
			n.args = cargs;
			n.argsRaw = cargs.join(" ");
			n.member = m;
			n.author = m.user;

			ctx.channel.send(`Will run \`${command} [${n.argsRaw}]\` ${mode} ${m}`);

			await n.invoke(command);
		}else if ( mode == "in" ){
			const m = ctx.findChannel(target);
			var n = await ctx.newCtx(ctx.message);
						n.args = cargs;
			n.argsRaw = cargs.join(" ");
			n.channel = m;
			ctx.channel.send(`Will run \`${command} [${n.argsRaw}]\` ${mode} ${m}`);
			await n.invoke(command);			
		}
	}
};

exports.echo = {
	help: "I repeat, echo.",
	group: "admin",
	flags: ['$hidden'],
	execute: async function(ctx) {
		ctx.channel.send(ctx.argsRaw);
	}
};

exports.set = {
	help: "Sets a var.",
	group: "admin",
	flags: ['$owner'],
	usage: "[key] [value]",
	execute: async function(ctx) {
		let args = ctx.args;
		if (!checks.isOwner(ctx)){return;}
		let group = "";
		let key = args.shift();
		var value = args.join(" ");
		if (['undefined',  'nil', 'null', 'none'].includes(value)){ value = undefined; }
		if (['[]', 'new Array()'].includes(value)){ value = []; }

		if(key.includes(".")){
			group = key.split(".")[0];
			if(group == ":guild"){
				group = ctx.guild.id;
			}
			key = key.split(".")[1];
			let nv = ctx.cfg[group];
			if(nv == undefined) nv = {};
			nv[key] = value;
			ctx.cfg[group] = nv;
			fs.writeFileSync(ctx.cfg.rootDir+"config.json", JSON.stringify(ctx.cfg, null, 2));
			ctx.channel.send(`Setting **${group} -> ${key}** to **${value}** (${typeof(value)}).`);
		} else {
			ctx.cfg[key] = value;
			fs.writeFileSync(ctx.cfg.rootDir+"config.json", JSON.stringify(ctx.cfg, null, 2));
			ctx.channel.send(`Setting **${key}** to **${value}** (${typeof(value)}).`);
		}
		



	}
};

exports.get = {
	help: "Gets a var.",
	group: "admin",
	flags: ['$owner'],
	usage: "[key] [value]",
	execute: async function(ctx) {
		let args = ctx.args;
		if (!checks.isOwner(ctx)){return;}
		ctx.reply(ctx.cfg[args.join (" ")]);
	}
};

exports.whitelist = {
	help: "Manages whitelisted users.",
	group: "admin",
	flags: ['$owner'],
	usage: "[member]",
	execute: async function(ctx) {
		let args = ctx.args;
		var ls = ctx.cfg.get('whitelist', []);
		
		if (args.length == 0){
			if (ls.length > 0){ ctx.channel.send(ls.join(", "));return; }else{ctx.channel.send("None.");return;}
		}
		
		if (!checks.isOwner(ctx)){ctx.channel.send("Access denied.");return;}
		var m = ctx.findMember(args.join(" "));
		if (m == undefined){ctx.channel.send("Member not found."); return;}
		
		if (ls.includes(m.id)){
			ls.splice (ls.indexOf(m.id), 1);
			console.log(ls);
			ctx.cfg.set('whitelist', ls);
			ctx.channel.send(`De-whitelisted ${m}.`);
		}else{
			ls.push(m.id);
			console.log(ls);
			ctx.cfg.set('whitelist', ls);
			ctx.channel.send(`Whitelisted ${m}.`);
		}
	}
};

exports.unload = {
	help: "Unloads extensions",
	group: "admin",
	flags: ['$owner'],
	usage: "[optional: module]",
	execute: async function(ctx) {
		let args = ctx.args;
		if (!checks.isOwner(ctx)){return;}
		if (args.length == 0){
			const out = ctx.commands.unload_ext();
			ctx.channel.send(`Extensions unloaded.\n${out}`);
		}else{
			const out = ctx.commands.unload_ext(args[0]);
			ctx.channel.send(`Extension ${args[0]} unloaded (${out}).`);
		}
	}
};
exports.reload = {
	help: "Reloads extensions",
	group: "admin",
	flags: ['$owner'],
	usage: "[optional: module]",
	execute: async function(ctx) {
		let args = ctx.args;
		if (!checks.isOwner(ctx)){return;}
		if (args.length == 0){
			const out = ctx.commands.reload_ext();
			ctx.channel.send(`Extensions reloaded.\n${out}`);
		}else{
			const out = ctx.commands.reload_ext(args[0]);
			ctx.channel.send(`Extension ${args[0]} reloaded (${out}).`);
		}
	}
};

exports.sreload = {
	help: "Reloads slash commands",
	group: "admin",
	flags: ['$owner'],
	usage: "[optional: module]",
	execute: async function(ctx) {
		let args = ctx.args;
		if (!checks.isOwner(ctx)){return;}
		if (args.length == 0){
			const out = ctx.commands.reload_slash();
			ctx.channel.send(`Slash commands reloaded.\n${out}`);
		}else{
			const out = ctx.commands.reload_slash(args[0]);
			ctx.channel.send(`Slash commands ${args[0]} reloaded (${out}).`);
		}
	}
};

exports.help = {
	help: "Gets help.",
	flags: ['$hidden'],
	execute: async function(ctx) {
		let args = ctx.args;
		if (args.length != 0){
			var target = ctx.commands.commands[args[0]];

			if (target == undefined){
				for (const c of Object.keys(ctx.commands.commands)){
					const com = ctx.commands.commands[c];

					if (com.aliases.includes(args[0])){
						target = com;
						break;
					}
				}
			}

			
			if (target == undefined){
				ctx.channel.send(`Command ${args[0]} not found.`);
			}else{
				var output = "["+target.name.toUpperCase()+"]";
				
				if (target.group != undefined){output += "\nGroup: "+target.group;}

				if (target.aliases.length > 0){
					const al = target.name+"|"+target.aliases.join("|");
					output += "\nUsage: "+ctx.commands.prefix+"["+al+"] ";
				}else{
					output += "\nUsage: "+ctx.commands.prefix+target.name.toLowerCase()+" ";
				}
				
				if (target.usage){output += target.usage;}
				
				if (target.help){output += "\n"+target.help;}

				if (target.flags.length > 0){
					output += "\nFlags: ";
					output += target.flags.join(", ");
				}
				
				ctx.channel.send(common.code(output, 'ini'));
			}
		}else{
			var sorts = {};
			for (const c of ctx.commands.asList()) {
				var cmd = ctx.commands.getCommand(c);
				if (cmd.group == undefined){
					if(!cmd.flags.includes("$hidden")){
						if(sorts["others"] == undefined){sorts["others"] = [];}
						sorts["others"].push(cmd);
					}
				}else{
					if(cmd.group != "#hidden" && !cmd.flags.includes("$hidden")){
						if(sorts[cmd.group] == undefined){sorts[cmd.group] = [];}
						sorts[cmd.group].push(cmd);
					}
				}

			}
			var h = "";
			let commands = 0;

			for (const group of Object.keys(sorts)){
				h += "["+group+"]\n";
				for (const command of sorts[group]){
					commands += 1;

					if (commands > 25){
						commands = 0;
						ctx.channel.send(common.code(h, 'ini'));
						h = "";
					}
					h += "  "+command.name+common.space("  "+command.name, 20, command.brief)+"\n";
				}
			}
			ctx.channel.send(common.code(h, 'ini'));
		}
	}
};

exports.inviteme = {
	help: "Creates an invitation",
	group: "bot",
	aliases: ['inv', 'iv'],
	execute: async function(ctx) {
		ctx.channel.send("<https://discordapp.com/oauth2/authorize?client_id=507218821673648148&scope=bot>");	
	}
};

exports.unban = {
	help: "Unbans a user",
	execute: async function(ctx){
		ctx.guild.fetchBans().then(function(bans){
			for (const ban of bans.array()) {
				if (ban.user.id == ctx.args[0])
				ctx.guild.members.unban(ban.user.id).then(user => ctx.say(`Unbanned ${user.username} from ${ctx.guild.name}`));
			}
		});
	}
};

exports.quote = {
	help: "",
	group: "utility",
	execute: async function(ctx) {
		let buildQuote = function(q){
			let em = new discord.MessageEmbed();
			em.addField(q.from, q.content+"\n*Submitted by "+q.added_by+" on "+q.timestamp+"*")
			em.setColor("RANDOM");
			return em
		}
		let cmd = ctx.args.shift();
		let line = ctx.args.join(" ");
		let quotes = {}
		switch(cmd) {
			case "add":
				let quote = line.split("~")[0].trim();
				let quoted = line.split("~")[1].trim();
				let ts = moment().format('D-MM-YYYY');
				let built = {"content": quote, "from": quoted, "added_by": ctx.member.toString(), "timestamp": ts}
				quotes = require(rootDir+'/data/quotes.json');
				quotes.items.push(built);
				quotes.total = quotes.items.length;
				fs.writeFileSync(ctx.cfg.rootDir+"data/quotes.json", JSON.stringify(quotes, null, 2));
				await ctx.reply({content: `Quote saved. (#${quotes.total-1})`, embeds: [buildQuote(built)]});
			  break;
			case "show":
				quotes = require(rootDir+'/data/quotes.json');

				if (isNaN(line)) {
					for(let q of quotes.items){
						if(q.content.includes(line) || line == q.from){
							await ctx.reply({embeds: [buildQuote(q)]});
						}
					}
				} else {
					let q = quotes.items[parseInt(line)];
					await ctx.reply({embeds: [buildQuote(q)]});
				}

			  	break;
			case "delete":
				quotes = require(rootDir+'/data/quotes.json');
				break;
			default:
				await ctx.reply("Undefined subcommand.")
		  }
	}
};

// idea for feedback, send message showing 0/x_number_found
// then edit the 0 to be how many messages have been deleted so far
exports.purge = {
	help: "",
	group: "admin",
	execute: async function(ctx) {
		if(!ctx.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)){
			ctx.reply("You don't have permission to do this.")
			return;
		}
		let cid = ctx.argsRaw;
		const channel = ctx.client.channels.cache.get(cid);
		channel.messages.fetch({ limit: 100 }).then(messages => {
			console.log(`Received ${messages.size} messages`);
			//Iterate through the messages here with the variable "messages".
			messages.forEach(message => message.delete())
		  })
		  .catch((err) => ctx.reply(`ERROR: ${err}`))
	}
};
	

exports.lua = {
	help: "Evaluates arbtirary LUA code.",
	group: "utility",
	aliases: [],
	flags: ['$whitelist'],
	usage: ['[code]'],
	execute: async function(ctx) {
		let args = ctx.args;
		if (!checks.isWhitelisted(ctx)){ctx.channel.send("Access denied.");return;}
		args = args.join(" ");
		args = args.replace("```lua", "");
		args = args.replace("```", "");
		console.log(`args ${args}`);
		const em = new discord.MessageEmbed();

		var intercept = require("intercept-stdout"),
			captured_text = "";

		var unhook_intercept = intercept(function(txt) {
			captured_text += txt;
		});
		
		let returnValue = undefined;
		
		try{
		returnValue = luaEnv.parse(args).exec();
		}catch(err){returnValue = `Error! ${err}`;}

		unhook_intercept();

		if (captured_text != ""){em.addField("Captured Text", "```\n"+captured_text+"\n```" );}
		if (returnValue != undefined){em.addField("Returned", "```\n"+returnValue+"\n```" );}
		
		em.setAuthor(ctx.member.nickname, ctx.member.user.avatarURL(), '');
		em.setColor('#0099ff');
		em.setTimestamp();

		if (captured_text == "" && returnValue == undefined) { ctx.channel.send("No data returned."); return;}
		ctx.channel.send(em);
	}
};

exports.js = {
	help: "Evaluates arbtirary javascript code.\nAccess is only given to whitelisted people.",
	brief: "Javascript interpreter.",
	group: "utility",
	aliases: ['eval'],
	flags: ['$whitelist'],
	usage: ['[code]'],
	execute: async function(ctx) {
		let args = ctx.args;
		if (!checks.isWhitelisted(ctx)){ctx.channel.send("Access denied.");return;}
		args = args.join(" ");
		args = args.replace("```js", "");
		args = args.replace("```", "");
		let outs = 0;
		
		if (args == ""){ctx.reply("```Requires code to execute.```");
		}else{
			try {
				const em = new discord.MessageEmbed();
				var intercept = require("intercept-stdout"),
					captured_text = "";
				var unhook_intercept = intercept(function(txt) {
					captured_text += txt;
				});
				let evaled = eval(args);
				if (evaled instanceof Promise) evaled = await evaled;
				unhook_intercept();
				if (captured_text == ""){captured_text = "undefined";}
				
				em.setAuthor(ctx.member.nickname, ctx.member.user.avatarURL(), '');
				em.setColor('#0099ff');
				em.setTimestamp();
				
				if (captured_text != "" && captured_text != "undefined" && captured_text != undefined){em.addField("Captured Text", "```\n"+captured_text+"\n```" );outs += 1;}
				if (evaled != undefined){em.addField("Returned", "```\n"+evaled+"\n```" );outs += 1;}

				if (outs > 0)
					ctx.channel.send(em);
				
			} catch (err) {
				ctx.channel.send("```"+err+"```");
			}
		}
	}
};