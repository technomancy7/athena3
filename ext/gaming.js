const vmsq = require('vmsq');
const Gamedig = require('gamedig');
var needle = require('needle');

function cleanupHost(i){
	i = i.replace("Ã¿", "");
	i = i.replace("Ã¿Ã¿Ã¿", "");
	i = i.replace("ÂÃ¿", "");
	i = i.replace("Ã¿Â", "");
	i = i.replace("Ã¿", "");
	return i;
}

exports.srv = {
	help: "Show a server query",
	aliases: ["cservers"],
	group: "api",
	execute: async function(ctx){
		var ls = ctx.cfg.get("custom_servers_"+ctx.guild.id, []);
		for (i=0;i<ls.length;i++){
			let servern = ls[i];
			console.log("333networks.com/json/"+servern);
			needle.get("333networks.com/json/"+servern, function(error, response) {
				const embed = new discord.MessageEmbed();
				if (!error && response.statusCode == 200){
					const server = response.body;
					console.log(server);
					var cf = "";
					if (server.country != undefined) cf = emoji.get("flag-"+server.country.toLowerCase());
					var text = `**Map**: ${server.mapname}\n**Game**: ${server.gametype}\n**Admin**: ${server.adminname} (${server.adminemail})\n**Address**: ${server.ip}:${server.port}\n`;

					if (server.mutators != "None"){text += `**Mutators**: ${server.mutators}\n`;}
					if (server.goalteamscore != undefined){text += `**Team Score Limit**: ${server.goalteamscore}\n`;}
					if (server.fraglimit != undefined){text += `**Frag Limit**: ${server.fraglimit}\n`;}
					embed.addField(`${cf} ${cleanupHost(server.hostname)} (${server.numplayers}/${server.maxplayers})`, text);

					for (i=0;i<server.numplayers;i++){
						let p = server[`player_${i}`];
						embed.addField(p.player, `**Ping**: ${p.ping} | **Frags**: ${p.frags} | ${p.skin}; ${p.mesh}\n`);
					}
				}else{
					embed.addField("ERROR", `Host address did not respond. ${error} ${response.statusCode}`);
				}
				
				ctx.say(embed);
			});
		}
	}
};

exports.tri = {
	help: "List 333networks",
	aliases: ["list", "dx", "serv", "srv", "servers"],
	group: "api",
	execute: async function(ctx){
		const url = "333networks.com/json/";
		if (ctx.argsRaw == "" && ctx.guild.id == "518736692346093569") ctx.argsRaw = "unreal";
		if (ctx.argsRaw.startsWith("#")){ctx.argsRaw = ctx.cfg.get("333alias_"+ctx.argsRaw.replace("#", ""));}
		if (ctx.argsRaw == "undefined"){ctx.say("Error handling input...");return;}
		if (ctx.argsRaw.includes("/")){ //SERVER mode
			needle.get(url+ctx.argsRaw, function(error, response) {
				const embed = new discord.MessageEmbed();
				if (!error && response.statusCode == 200){
					
					const server = response.body;
					var cf = "";
					if (server.country != undefined) cf = emoji.get("flag-"+server.country.toLowerCase());
					var text = `**Map**: ${server.mapname}\n**Game**: ${server.gametype}\n**Admin**: ${server.adminname} (${server.adminemail})\n**Address**: ${server.ip}:${server.port}\n`;

					if (server.mutators != "None"){text += `**Mutators**: ${server.mutators}\n`;}
					if (server.goalteamscore != undefined){text += `**Team Score Limit**: ${server.goalteamscore}\n`;}
					if (server.fraglimit != undefined){text += `**Frag Limit**: ${server.fraglimit}\n`;}
					embed.addField(`${cf} ${cleanupHost(server.hostname)} (${server.numplayers}/${server.maxplayers})`, text);

					for (i=0;i<server.numplayers;i++){
						console.log(i);
						let p = server[`player_${i}`];
						embed.addField(p.player, `**Ping**: ${p.ping} | **Frags**: ${p.frags} | ${p.skin}; ${p.mesh}\n`);
					}
				}else{
					embed.addField("ERROR", `Host address did not respond. ${error} ${response.statusCode}`);
				}
				
				ctx.say(embed);
			});	
		}else{ //MS-LIST mode
			var g = ctx.argsRaw;
			var page = 0;
			if (g.includes(";")){
				page = g.split(";")[1].toNumber();
				g = g.split(";")[0];
			}
			var start = 0;
			var end = 10;
			if (page > 0){
				start = page*10;
				end = (page+1)*10;
			}
			needle.get(url+g+"?s=numplayers&o=d", function(error, response) {
				const embed = new discord.MessageEmbed();
				if (!error && response.statusCode == 200){
					
					var i = 0;

					for (const server of response.body[0]){
						if (i >= start){
							var cf = "";
							if (server.country != undefined)
								cf = emoji.get("flag-"+server.country.toLowerCase());
							embed.addField(`${cf} ${cleanupHost(server.hostname)} (${server.numplayers}/${server.maxplayers})`,
										   `**Map**: ${server.mapname}\n**Game**: ${server.gametype}\n**Address**: ${server.ip}:${server.hostport}`);
						}
						i += 1;
						if (i == end) break;
					}

					embed.addField(`Results Page #${page} (${start}-${end})`,
								   `Game: ${g.lower()}\nServers: ${response.body[1].total}\nPlayers: ${response.body[1].players}`);
				}else{
					console.log(response.body)
					embed.addField("ERROR", response.statusCode);
				}
				ctx.say(embed);
			});		
		}
		
	}
};

exports.trih = {
	help: "Searches 333networks",
	aliases: ["listh"],
	group: "api",
	execute: async function(ctx){
		const url = "333networks.com/json/";
		if (ctx.argsRaw == "" && ctx.guild.id == "518736692346093569") ctx.argsRaw = "unreal/176.9.50.118";

		var g = ctx.argsRaw.split("/")[0];
		var search = ctx.argsRaw.split("/")[1];

		needle.get(url+g+"?s=numplayers&o=d", function(error, response) {
			const embed = new discord.MessageEmbed();
			if (!error && response.statusCode == 200){
				var i = 0;

				for (const server of response.body[0]){
					if(server.ip.startsWith(search)){
						var cf = emoji.get("flag-"+server.country.toLowerCase());
						embed.addField(`${cf} ${cleanupHost(server.hostname)} (${server.numplayers}/${server.maxplayers})`,
									   `**Map**: ${server.mapname}\n**Game**: ${server.gametype}\n**Address**: ${server.ip}:${server.hostport}`);
					}
					
				}

				embed.addField(`Results`,
							   `Game: ${g.lower()}\nServers: ${response.body[1].total}\nPlayers: ${response.body[1].players}`);
			}else{
				embed.addField("ERROR", error);
			}
			ctx.say(embed);
		});		
	}
};

exports.tris = {
	help: "Searches 333networks",
	aliases: ["lists"],
	group: "api",
	execute: async function(ctx){
		const url = "333networks.com/json/";
		if (ctx.argsRaw == "" && ctx.guild.id == "518736692346093569") ctx.argsRaw = "unreal/newbiesplayground";

		var g = ctx.argsRaw.split("/")[0];
		var search = ctx.argsRaw.split("/")[1];

		needle.get(url+g+"?s=numplayers&o=d&q="+search, function(error, response) {
			const embed = new discord.MessageEmbed();
			if (!error && response.statusCode == 200){
				var i = 0;

				for (const server of response.body[0]){
						var cf = emoji.get("flag-"+server.country.toLowerCase());
						embed.addField(`${cf} ${cleanupHost(server.hostname)} (${server.numplayers}/${server.maxplayers})`,
									   `**Map**: ${server.mapname}\n**Game**: ${server.gametype}\n**Address**: ${server.ip}:${server.hostport}`);
					i += 1;
					if (i == 10) break;
				}

				embed.addField(`Results`,
							   `Game: ${g.lower()}\nServers: ${response.body[1].total}\nPlayers: ${response.body[1].players}`);
			}else{
				embed.addField("ERROR", error);
			}
			ctx.say(embed);
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
