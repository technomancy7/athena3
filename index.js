const { Client, Intents } = require('discord.js');
const fs = require('fs');
global.cfg = require('./config.json');
token = cfg.token;
prefix = cfg.prefix;
let { print } = require("./common.js")
var ext = require('./ext.js');
var colors = require('colors');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
var com = new ext.ExtManager(client, prefix);
global.extman = com;
global.rootDir = cfg.rootDir;

client.once('ready', () => {
	com.load_ext();
	com.reload_threads();
    com.reload_slash();
	console.log('Ready!');
    client.user.setActivity('with Node.js.');
});

client.on('messageCreate', async (msg) => {
    if (!msg.author.bot) {
        last_channel = msg.channel;
        print(' [ '+msg.channel.name+' : '+msg.guild.name+' ] '+msg.author.tag+': '+msg.content, tag='say');
        com.process_commands(client, cfg, msg);
    }
});

client.on('guildMemberAdd', async member => {
});

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
        await com.process_slash(client, cfg, interaction);
    }


});

client.login(token);