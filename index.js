const { Client, Intents } = require('discord.js');
const fs = require('fs');
global.cfg = require('./config.json');
let token = cfg.token_valk;
prefix = cfg.prefix;
let { print, KLogger } = require("./common.js")
var ext = require('./ext.js');
var colors = require('colors');
var last_channel = undefined;
for (let tok of process.argv){
    if (tok.startsWith("token")){
        let tok_key = "token_"+tok.split(":")[1]
        token = cfg[tok_key]
    }
}

process.on('unhandledRejection', (error) => console.error('Uncaught Promise Rejection', error));
process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
    console.log(err.stack)
	if (last_channel != undefined) {
        last_channel.send(`Unhandled Error: ${err}`);
    };
});

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
var com = new ext.ExtManager(client, prefix);
global.extman = com;
global.rootDir = cfg.rootDir;
global.logger = new KLogger(rootDir+"logs/system.log");

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
        print(' [ '+msg.channel.name+' : '+msg.guild.name+' ] '+msg.author.tag+': '+msg.content, {tag: 'say', logger: logger});
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
