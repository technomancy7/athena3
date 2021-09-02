var common = require('../common.js');
const print = common.print;
const util = require('util');
const discord = require('discord.js');
const vmsq = require('vmsq');
const Gamedig = require('gamedig');
const fs = require("fs");
const luaState = require('lua-in-js');
const luaEnv = luaState.createEnv();
var needle = require('needle');
const cheerio = require('cheerio');
const checks = require('../checks.js');
const nc = require('../netcrawler.js');
const querystring = require('querystring');
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

exports.replytest = {
	help: "Test",
	aliases: ['reply'],
	group: "utility",
	usage: "",
	flags: ["$hidden"],
	execute: async function(ctx){
		ctx.reply("Test")
        ctx.message.reply("hm")
        return "Tested"
	}
};


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
exports.whois = {
	help: "IP information lookup",
	aliases: ['ip'],
	group: "utility",
	usage: "[IP Address]",
	execute: async function(ctx) {
		let args = ctx.args;
		const em = new discord.MessageEmbed();
		if (args.length == 0){ctx.channel.send("IP required."); return;}
		needle.get(`https://rest.db.ripe.net/search.json?query-string=${args[0]}&flags=no-filtering&source=RIPE`,function(error, data){
			for (const c of data.body.objects.object){
				let m = "";
				for (const attr of c.attributes.attribute){
					m += `${attr.name}: ${attr.value}\n`;
				}
				
				em.addField(c["primary-key"].attribute[0].name+" : "+c["primary-key"].attribute[0].value, m);

			}
			ctx.say(em);
		});
	
	}
};

exports.weather = {
	help: "Current weather for location",
	aliases: ['w'],
	group: "utility",
	usage: "[location]",
	execute: async function(ctx) {
		let args = ctx.args;
		if (args.length == 0){ctx.channel.send("location required."); return;}
		const w = new nc.WeatherAPI(ctx.cfg.get('weatherapikey'));

		await w.current(args.join(" "), function(data){
			console.log(data);
			const name = `${data.location.name}, ${data.location.region}, ${data.location.country} (${data.location.tz_id})`;
			const condition = `The current weather is ${data.current.condition.text}.`;
			const tempr = `The temperature is ${data.current.temp_c}°C / ${data.current.temp_f}°F (Feels like ${data.current.feelslike_c}°C / ${data.current.feelslike_f}°F)`;
			const winds = `There is winds from the ${data.current.wind_dir} with speeds of ${data.current.wind_kph} KPH.`;
			const em = new discord.MessageEmbed()
			.addField(name, `${condition}\n${tempr}\n${winds}`)
			.setThumbnail(`https:${data.current.condition.icon}`)
			.setFooter("Powered by WeatherAPI", "https://www.weatherapi.com/");
			ctx.channel.send(em);

		});
	}
};

exports.forecast = {
	help: "Current weather for location",
	aliases: ['fc'],
	group: "utility",
	usage: "[location]",
	execute: async function(ctx) {
		let args = ctx.args;
		if (args.length == 0){ctx.channel.send("location required."); return;}
		const w = new nc.WeatherAPI(ctx.cfg.get('weatherapikey'));

		const em = new discord.MessageEmbed();
		
		em.setFooter("Powered by WeatherAPI", "https://www.weatherapi.com/");
		await w.forecast(args.join(" "), 7 , function(data){
			for (const day of data.forecast.forecastday){
				console.log(day);
				const name = day.date;
				const condition = `The weather will be ${day.day.condition.text}.`;
				const tempr = `The temperature will be ${day.day.temp_c}°C / ${day.day.temp_f}°F (Feels like ${day.day.feelslike_c}°C / ${day.day.feelslike_f}°F)`;
				const winds = `There will be winds from the ${day.day.wind_dir} with speeds of ${day.day.wind_kph} KPH.`;
				const astro = `Sunrise will be at ${day.astro.sunrise}, and sunset will be at ${day.astro.sunset}.\Moonrise will be at ${day.astro.moonrise}, and moonset will be at ${day.astro.moonset}`;
				
				em.addField(name, `${condition}\n${tempr}\n${winds}\n${astro}`);
				
				em.setDescription(`${data.location.name}, ${data.location.region}, ${data.location.country} (${data.location.tz_id})`);
			}

			
			ctx.channel.send(em);

		});
	}
};

exports.youtube = {
	help: "Searches youtube.",
	aliases: ['yt'],
	group: "fun",
	execute: async function(ctx) {

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

exports.debug = {
	help: "Debugging properties.",
	group: "admin",
	flags: ['$hidden'],
	execute: async function(ctx) {
		let args = ctx.args;
		ctx.channel.send(`${ctx.member}\n${args}`);
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

exports.gm = {
	help: "Pings a GMOD server.",
	group: "gaming",
	usage: "[ip] [port]",
	aliases: [],
	execute: async function(ctx) {
		let args = ctx.args;
		var host = "185.38.150.28",
			port = "27055";
		
		if (args.length == 2){
			host = args[0];
			port = args[1];
		}
		
		Gamedig.query({
			type: 'garrysmod',
			host: host,
			port: port
		}).then((state) => {
			resp = `**Name**: ${state.name}\n`;
			resp += `**Map**: ${state.map}\n`;
			resp += `**Version**: ${state.raw.version}\n`;
			resp += `**Game**: ${state.raw.game}\n`;
			resp += `**Ping**: ${state.ping}\n`;
			resp += `**Players**: ${state.raw.numplayers}/${state.maxplayers}\n`;
			ctx.channel.send(resp);
		}).catch((error) => {
			ctx.channel.send("Server is offline");
		});	
	}
};

exports.gms = {
	help: "Searches for a GMOD server.",
	group: "gaming",
	usage: "[term]",
	aliases: [],
	execute: async function(ctx) {
		let name = ctx.argsRaw; // "*"+ctx.argsRaw+"*";
		let index = 0;
		let game = "garrysmod";
		const stream = vmsq('hl2master.steampowered.com:27011', vmsq.EUROPE, {gamedir: game, name_match: name});
		const servers = [];

		stream.on('error', console.error);
		stream.on('data', (ip) => {
			console.log(ip);
			servers.push(ip);
		});
		stream.on('end', () => {
			console.log(`got ${servers.length} servers`);
			if(servers.length == 0){ctx.say("No results.");return;}
			if(index >= servers.length) index = (servers.length - 1);
			let ip = servers[index];
			if(ip == undefined){ctx.say(`Bad server index. (0-${servers.length})`);return;}
			
			Gamedig.query({type: game, host: ip.split(":")[0], port: ip.split(":")[1]
						  }).then((state) => {
							  let resp = ``;
							  resp += `**Map**: ${state.map}\n`;
							  resp += `**Version**: ${state.raw.version}\n`;
							  resp += `**Game**: ${state.raw.game}\n`;
							  resp += `**Ping**: ${state.ping}\n`;
							  resp += `**Players**: ${state.raw.numplayers}/${state.maxplayers}\n`;
							  let em = new discord.MessageEmbed().addField(`${state.name} [${ip}]`, resp);
							  ctx.say(em);
						  }).catch((error) => {ctx.say(`Connection to ${ip} failed.\n${error}`);});	
		});
	}
};

exports.cat = {
    help: " ",
    group: "animals",
    aliases: [],
    execute: async function(ctx) {
        const h = {"x-api-key": "dca2da26-0ed8-406b-a99d-b8e86d165c99"};

        needle.get('https://api.thecatapi.com/v1/images/search', h, (error, response) => {
            if (!error && response.statusCode == 200)
                ctx.reply(response.body[0]['url']);
        });
    }
};

exports.dog = {
    help: " ",
    group: "animals",
    execute: async function(ctx) {
        needle.get('https://random.dog/woof.json', (error, response) => {
            if (!error && response.statusCode == 200)
                ctx.reply(response.body.url);
        });
        
    }
};

exports.catfact = {
	help: " ",
	group: "animals",
	execute: async function(ctx) {
		needle.get('https://some-random-api.ml/facts/cat', (error, response) => {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.fact);
		});		
	}
};

exports.dogfact = {
	help: " ",
	group: "animals",
	execute: async function(ctx) {
		needle.get('https://some-random-api.ml/facts/dog', (error, response) => {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.fact);
		});		
	}
};
	
exports.dog2 = {
	help: "",
	group: "animals",
	aliases: [],
	execute: async function(ctx) {
		needle.get('https://dog.ceo/api/breeds/image/random', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.message);
		});
	}
};

exports.bird = {
	help: "",
	group: "animals",
	aliases: [],
	execute: async function(ctx) {
		needle.get('http://shibe.online/api/birds?count=1&urls=true', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body[0]);
		});
	}
};

exports.shibe = {
	help: "",
	group: "animals",
	aliases: [],
	execute: async function(ctx) {
		needle.get('http://shibe.online/api/shibes?count=1&urls=true', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body[0]);
		});
	}
};

exports.fox = {
	help: "",
	group: "animals",
	aliases: [],
	execute: async function(ctx) {
		needle.get('https://randomfox.ca/floof/', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.image);
		});		
	}
};

exports.bun = {
	help: "",
	group: "animals",
	aliases: [],
	execute: async function(ctx) {
		needle.get('https://dotbun.com/', function(error, response) {
			if (!error && response.statusCode == 200){
				let $ = cheerio.load(response.body);
				const image = $('img').get(1);
				const b = $(image).attr('src');
				ctx.channel.send("https://dotbun.com/"+b);
			}
		});
	}
};

exports.pika = {
	group: "meme",
	execute: async function(ctx) {
		needle.get('https://some-random-api.ml/pikachuimg', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.link);
		});		
	}
};

exports.hug = {
	group: "meme",
	execute: async function(ctx) {
		needle.get('https://some-random-api.ml/animu/hug', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.link);
		});
	}
};

exports.pat = {
	group: "meme",
	execute: async function(ctx) {
		needle.get('https://some-random-api.ml/animu/pat', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.link);
		});		
	}
};

exports.wink = {
	group: "meme",
	execute: async function(ctx) {
		needle.get('https://some-random-api.ml/animu/wink', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.link);
		});		
	}
};

exports.duck = {
	group: "animals",
	execute: async function(ctx) {
		needle.get('https://random-d.uk/api/quack', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.url);
		});
	}
};

exports.redpanda = {
	group: "animals",
	execute: async function(ctx) {
		needle.get('https://some-random-api.ml/img/red_panda', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.link);
		});
	}
};

exports.panda = {
	group: "animals",
	execute: async function(ctx) {
		needle.get('https://some-random-api.ml/img/panda', function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.link);
		});		
	}
};

exports.urban = {
	group: "api",
	execute: async function(ctx) {
		let page = 0;
		const ut = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);

		if (!isNaN(ctx.args[0])){page = ctx.args.shift().toNumber();}
		const query = querystring.stringify({ term: ctx.args.join(' ') });
		needle.get(`https://api.urbandictionary.com/v0/define?${query}`, function(error, response) {
			if (!error && response.statusCode == 200){
				let list = response.body.list;
				let answer = list[page];
				if (answer == undefined){ctx.say(`${ctx.args.join(' ')} not found.`); return;}
				const embed = new discord.MessageEmbed()
					  .setColor('#EFFF00')
					  .setTitle(answer.word)
					  .setURL(answer.permalink)
					  .addFields(
						  { name: 'Definition', value: ut(answer.definition, 1024) },
						  { name: 'Example', value: ut(answer.example, 1024) },
						  { name: 'Rating', value: `👍 ${answer.thumbs_up} / 👎 ${answer.thumbs_down}` }
					  );

				ctx.channel.send(embed);
			}
		});		
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
