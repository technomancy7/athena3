var needle = require('needle');
var fs = require('fs');
var common = require("../common.js");
const discord = require('discord.js');
var emoji = require('node-emoji');
const nc = require('../netcrawler.js');
const cheerio = require('cheerio');
const querystring = require('querystring');


exports.wquery = {
	help: "",
 	group: "api",
	aliases: ["wq"],
	execute: async function(ctx) {
		let url = "https://api.wolframalpha.com/v1/simple?i="+ctx.args.join('%20').replace('?', '%3F')+"&appid="+ctx.cfg.get("wolfram");
		/*needle.get(url, { output: 'wolfram.gif'}, function(err, resp, body) {
			ctx.channel.send({files: ['wolfram.gif']});
			});*/
		echo(url);
		needle.get(url, function(error, response) {
			if (error) throw error;
			if (!error && response.statusCode == 200)
				fs.writeFile('wolfram.gif', new Buffer.from(response.body), function(err){
					if (err) throw err;
					ctx.channel.send({files: ['wolfram.gif']});
				});
				
		});		
	}
};
exports.wolfram = {
	help: "",
	group: "api",
	aliases: [],
	execute: async function(ctx) {
        let config = require('../config.json');
        if(config.wolfram == undefined || config.wolfram == "")ctx.reply("No wolfram API key.");
		let url = "https://api.wolframalpha.com/v1/result?i="+ctx.args.join('%20').replace('?', '%3F')+"&appid="+config.wolfram;
		needle.get(url, function(error, response) {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body);
		});		
	}
};
exports.translate = {
	help: "",
	group: "api",
	aliases: [],
	execute: async function(ctx) {
		let url = "https://translate.mentality.rip/translate";
		let text = ctx.args.join(' ');
		var data = {headers: {"Content-Type": "application/json"}};
		var p = {"q": text, "source": "auto", "target": "en"}
		needle.post(url, p, data, function(error, response) {
			if (!error && response.statusCode == 200){
				let resp = response.body.translatedText;
				ctx.reply(resp);
			}
		});		
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



// ANIMALS


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

exports.stonerdog = {
    help: "Gets a very nice doggo.",
    group: "animals",
    execute: async function(ctx) {
        needle.get('https://wrathplus.com/api/freya/get_stoner_dog', (error, response) => {
            if (!error && response.statusCode == 200){
                ctx.reply(response.body.content);
			}

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
	help: "Information about good boy",
	group: "animals",
	execute: async function(ctx) {
		needle.get('https://some-random-api.ml/facts/dog', (error, response) => {
			if (!error && response.statusCode == 200)
				ctx.reply(response.body.fact);
		});		
	}
};
	
exports.dog2 = {
	help: "A random good boy",
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