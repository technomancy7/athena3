var {getData, saveData} = require("../common.js");
const discord = require('discord.js');
var needle = require('needle');
const ytdl = require('ytdl-core');
const fs = require("fs");
const { 
    createAudioPlayer, AudioPlayerStatus, VoiceConnectionStatus, createAudioResource, NoSubscriberBehavior, joinVoiceChannel, StreamType, generateDependencyReport, demuxProbe, getVoiceConnection
} = require('@discordjs/voice');
const ytsr = require('ytsr');

let playlist = [];
let ytcache = {};

function nextResource(){
    return playlist.shift();
}
function destroyPlayer(ctx){
    if(ctx.ext.players == undefined) return;
    if(ctx.ext.players[ctx.guild.id] == undefined) return;
    let vc = getVoiceConnection(ctx.guild.id);
    vc.disconnect();
    vc.destroy();
    delete ctx.ext.players[ctx.guild.id];
}

function getPlayer(ctx){
    if(ctx.ext.players == undefined) ctx.ext.players = {}
    if(ctx.ext.players[ctx.guild.id] == undefined){
        ctx.ext.players[ctx.guild.id] = createAudioPlayer();
        ctx.ext.players[ctx.guild.id].on('error', error => {
            ctx.channel.send("Something broke!");
            console.error(error.stack);
        });
        
        ctx.ext.players[ctx.guild.id].on(AudioPlayerStatus.Idle, () => {
            if(playlist.length > 0){
                let next = nextResource();
                ctx.ext.players[ctx.guild.id].play(next.resource);
                console.log(ytcache[next.id]);
                if(ytcache[next.id] != undefined) ctx.channel.send({embeds: [ytcache[next.id]]});
            }

        });
    }
    return ctx.ext.players[ctx.guild.id];
}

async function playSong(ctx, path) {
	const resource = createAudioResource(path, { inputType: StreamType.Arbitrary });
    let player = getPlayer(ctx);
    console.log(player.state.status);

    if(player.state.status == "idle"){
        player.play(resource);
        return true;
    } else {
        let id = path.split("/").pop().split(".")[0];
        playlist.push({resource: resource, id: id});
        ctx.reply("Added to playlist.");
        return false;
    }
}

async function connectToChannel(ctx) {
    if(ctx.member.voice.channel == null || ctx.member.voice.channel == undefined){
        await ctx.reply("You aren't in a voice channel.");
        return null;
    }
    console.log("Joining channel.");
	const connection = joinVoiceChannel({
		channelId: ctx.member.voice.channel.id,
		guildId: ctx.channel.guild.id,
        selfMute: false,
        adapterCreator: ctx.channel.guild.voiceAdapterCreator
	});
    connection.subscribe(getPlayer(ctx));
	return connection;
}

function realMembers(list){
    var rm = 0;
    for (const mem of list){
        const member = mem[1];
        if(!member.user.bot) rm++;
    }
    return rm;
}
function checkVoiceState(oldState, newState){
    if(newState.channel == null && newState.member != newState.guild.me){
        let cid = oldState.channel.id;
        const chan = newState.guild.channels.cache.get(cid);
        console.log(realMembers(chan.members))
        if(realMembers(chan.members) == 0 ){
            let vc = getVoiceConnection(newState.guild.id);
            vc.disconnect();
            vc.destroy();
            delete extman.players[newState.guild.id];
        }
    }

}
exports.onRemove = function(ext){
	ext.client.removeListener('voiceStateUpdate', checkVoiceState);
}

exports.onLoad = function(ext) {
	ext.client.on('voiceStateUpdate', checkVoiceState);
}

exports.syncradio = {
    group: "audio",
    help: "",
    execute: async function(ctx){
        let url = "https://gitlab.com/codedmind/datasets/-/raw/master/internet_radio.csv?inline=false"
        needle.get(url, function(error, response) {
			if (error) throw error;
			if (!error && response.statusCode == 200){
				let csv = response.body;
                let outr = {};
                for(let line of csv.split("\n")){
                    let key = line.split(",")[0];
                    let name = line.split(",")[1];
                    let desc = line.split(",")[2];
                    let url = line.split(",")[3];
                    outr[key] = {name: name, description: desc, url: url}
                }
                saveData("radio", outr);
            }

		});		

    }
}
exports.radio = {
	help: "",
 	group: "audio",
	execute: async function(ctx) {
		let stations = getData("radio");
        if(stations[ctx.argsRaw] != undefined){
            console.log(stations[ctx.argsRaw].url);
            const connection = await connectToChannel(ctx);
            await playSong(ctx, stations[ctx.argsRaw].url);
            
            
        }

	}
};

exports.connect = {
	help: "",
 	group: "audio",
	execute: async function(ctx) {
        await connectToChannel(ctx);
	}
};

exports.playlist = {
    help: "",
    group: "audio",
    execute: async function(ctx){
        getPlayer(ctx).stop();
    }

}
exports.skip = {
    help: "",
    group: "audio",
    execute: async function(ctx){
        getPlayer(ctx).stop();
    }

}
exports.stop = {
    help: "",
    group: "audio",
    execute: async function(ctx){
        getPlayer(ctx).stop();
        destroyPlayer(ctx);
    }

}

const ffmpeg = require('fluent-ffmpeg');
function ytEmbed(ytf){
    let em = new discord.MessageEmbed();

    em.addField("Now playing...", ytf.title);
    em.setThumbnail(ytf.bestThumbnail.url);
    em.setColor("RANDOM");
    return em;
}
exports.yt = {
	help: "",
 	group: "audio",
    aliases: ["play"],
	execute: async function(ctx) {
        if(!ctx.argsRaw.startsWith("http")){
            let fm = await ctx.reply("Please wait while I search for that track...");
            const searchResults = await ytsr(ctx.argsRaw);
            for (let item of searchResults.items){
                if(item.type == "video"){
                    if(fs.existsSync(rootDir+'audio/'+item.id+'.mp3')){
                        const connection = await connectToChannel(ctx);
                        if(connection) {
                            let d = await playSong(ctx, rootDir+'audio/'+item.id+'.mp3');
                            fm.delete();
                            if(d) {
                                
                                await ctx.reply({embeds: [ytEmbed(item)]});
                            } else {
                                ytcache[item.id] = ytEmbed(item);
                            }
                        }  
                    } else {
                        //await ctx.reply("One moment...");
                        const stream = ytdl(item.url, { filter: 'audioonly' });
                        ffmpeg(stream)
                        .audioBitrate(128)
                        .save(rootDir+'audio/'+item.id+'.mp3')
                        .on('end', async () => {
                            const connection = await connectToChannel(ctx);
                            if(connection) {
                                let d = await playSong(ctx, rootDir+'audio/'+item.id+'.mp3');
                                fm.delete();
                                if(d) {
                                    await ctx.reply({embeds: [ytEmbed(item)]});
                                } else {
                                    ytcache[item.id] = ytEmbed(item);
                                }
                            }
                        });
                    }

                    return;
                }
            }
        }else{
            let id = ctx.argsRaw.split("/").pop().split("=")[1].split("&")[0]
            if(fs.existsSync(rootDir+'audio/'+id+'.mp3')){
                console.log("Using local.")
                const connection = await connectToChannel(ctx);
                if(connection) {
                    let info = await ytdl.getBasicInfo(id);
                    let ytm = {
                        title: info.videoDetails.title,
                        bestThumbnail: info.videoDetails.thumbnails[0]
                    }
                    let d = await playSong(ctx, rootDir+'audio/'+id+'.mp3');
                    if(d) {
                        await ctx.reply({embeds: [ytEmbed(ytm)]});
                    } else {
                        ytcache[id] = ytEmbed(ytm);
                    }
                }
            } else {
                await ctx.reply("One moment...");
                let id = ctx.argsRaw.split("/").pop().split("=")[1].split("&")[0]
                const stream = ytdl(ctx.argsRaw, { filter: 'audioonly' });
                ffmpeg(stream)
                .audioBitrate(128)
                .save(rootDir+'audio/'+id+'.mp3')
                .on('end', async () => {
                    const connection = await connectToChannel(ctx);
                    if(connection) {
                        let d = await playSong(ctx, rootDir+'audio/'+id+'.mp3');
                        let info = await ytdl.getInfo(id);
                        let ytm = {
                            title: info.videoDetails.title,
                            bestThumbnail: info.videoDetails.thumbnails[0]
                        }
                        if(d) {
                            await ctx.reply({embeds: [ytEmbed(ytm)]});
                        } else {
                            ytcache[id] = ytEmbed(ytm);
                        }
                    }
                });
            }

        }


	}
};