const { Client, Intents } = require('discord.js');
const fs = require('fs');
global.$cfg = require('./config.json');
let token = $cfg.token_valk;
prefix = $cfg.prefix;
let { print, KLogger } = require("./common.js")
var ext = require('./ext.js');
var colors = require('colors');
var last_channel = undefined;
global.DISABLED_EXT = $cfg.disabled_extensions.global

for (let tok of process.argv){
    if (tok.startsWith("token")){
        global.BOT_ID = tok.split(":")[1]
        let tok_key = "token_"+BOT_ID
        token = $cfg[tok_key]
        if($cfg.disabled_extensions[BOT_ID] != undefined){
            global.DISABLED_EXT = [...DISABLED_EXT, ...$cfg.disabled_extensions[BOT_ID]]
            console.log("Ignored modules: ");
            console.log(DISABLED_EXT);
        }
    }
}

process.on('unhandledRejection', (error) => console.error('Uncaught Promise Rejection', error));
process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
    console.log(err.stack)
	if (last_channel != undefined) {
        //last_channel.send(`Unhandled Error: ${err}`);
    };
});

global.rootDir = $cfg.rootDir;

function checkDirectorySanity(){
    let dn = function(err) {
        if (err) return console.error(err);
        console.log('Directory created successfully!');
    }
    console.log("Checking sanity.")
    if(!fs.existsSync( rootDir+"audio/" )) fs.mkdir(rootDir+"audio/", dn);
    if(!fs.existsSync( rootDir+"data/" )) fs.mkdir(rootDir+"data/", dn);
    if(!fs.existsSync( rootDir+"ext/" )) fs.mkdir(rootDir+"ext/", dn);
    if(!fs.existsSync( rootDir+"logs/" )) fs.mkdir(rootDir+"logs/", dn);
    if(!fs.existsSync( rootDir+"img/" )) fs.mkdir(rootDir+"img/", dn);
    if(!fs.existsSync( rootDir+"factory/" )) fs.mkdir(rootDir+"factory/", dn);
    if(!fs.existsSync( rootDir+"slash/" )) fs.mkdir(rootDir+"slash/", dn);
    if(!fs.existsSync( rootDir+"target/" )) fs.mkdir(rootDir+"target/", dn);
    if(!fs.existsSync( rootDir+"threads/" )) fs.mkdir(rootDir+"threads/", dn);
}
checkDirectorySanity();
const client = new Client({ intents: [
        Intents.FLAGS.GUILD_MEMBERS, 
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES, 
        Intents.FLAGS.GUILD_VOICE_STATES, 
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ] 
});
var com = new ext.ExtManager(client, prefix);
global.extman = com;

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
        com.process_commands(client, $cfg, msg);
    }
});

client.on('guildMemberAdd', async member => {
});

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
        await com.process_slash(client, $cfg, interaction);
    }


});

client.login(token);
