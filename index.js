const { Client, Intents } = require('discord.js');
var cfg = require('./config.json');
token = cfg.token;
prefix = cfg.prefix;
let { print } = require("./common.js")
var ext = require('./ext.js');
var colors = require('colors');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
var com = new ext.ExtManager(client, prefix);

client.once('ready', () => {
	com.reload_ext();
	com.reload_threads();
	console.log('Ready!');
});

client.on('messageCreate', async (msg) => {
    if (!msg.author.bot) {
        last_channel = msg.channel;
        print(' [ '+msg.channel.name+' : '+msg.guild.name+' ] '+msg.author.tag+': '+msg.content, tag='say');
        com.process_commands(client, cfg, msg);
    }
});

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()){
        const { commandName } = interaction;

        if (commandName === 'ping') {
            await interaction.reply('Pong!');
        } else if (commandName === 'server') {
            await interaction.reply('Server info.');
        } else if (commandName === 'user') {
            await interaction.reply('User info.');
        }
    }
});

client.login(token);