const { Client, Intents } = require('discord.js');
const fs = require('fs');
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
    com.reload_slash();
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
	if (interaction.isCommand()) {
        const command = com.slash[interaction.commandName];

        if (!command) return;
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }


});

client.login(token);