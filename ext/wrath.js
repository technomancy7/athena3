var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')
var axios = require("axios")
dayjs.extend(utc)
dayjs.extend(timezone)

global.wpData = {};
//2 - Elite, 680864292815503557
//3 - Contributor, 897915823409217556
//4 - Champion, 897916314117611571
//5 - Supreme, 897916458946940998
function roles(){
    //if(global.wpData["680864292815503557"] == undefined){;}
}
async function handleVerifyRoles(ctx){
    let guild = ctx.client.guilds.cache.get("680834114605416452");
    let url = "https://devtest.wrathplus.com/api/discord/getDiscordDonators";
    const response = await axios.get(url);
    let elite = guild.roles.cache.find(role => role.name === 'Elite');
    let contributor = guild.roles.cache.find(role => role.name === 'Contributor');
    let champion = guild.roles.cache.find(role => role.name === 'Champion');
    let supreme = guild.roles.cache.find(role => role.name === 'Supreme');
    let resp = response.data;

    for(let user of resp){
        let member = guild.members.cache.get(user.discord_uuid);
        if(member != undefined){
            if(user.discord_uuid == member.user.id){
                if(user.rank_donate == 2){
                    if(member.roles.cache.some(role => role.name === "Contributor")) member.roles.remove(contributor)
                    if(member.roles.cache.some(role => role.name === "Champion")) member.roles.remove(champion)
                    if(member.roles.cache.some(role => role.name === "Supreme")) member.roles.remove(supreme)
                    if(!member.roles.cache.some(role => role.name === "Elite")) member.roles.add(elite)
                } else if(user.rank_donate == 3){
                    if(!member.roles.cache.some(role => role.name === "Contributor")) member.roles.add(contributor)
                    if(member.roles.cache.some(role => role.name === "Champion")) member.roles.remove(champion)
                    if(member.roles.cache.some(role => role.name === "Supreme")) member.roles.remove(supreme)
                    if(member.roles.cache.some(role => role.name === "Elite")) member.roles.remove(elite)
                } else if(user.rank_donate == 4){
                    if(member.roles.cache.some(role => role.name === "Contributor")) member.roles.remove(contributor)
                    if(!member.roles.cache.some(role => role.name === "Champion")) member.roles.add(champion)
                    if(member.roles.cache.some(role => role.name === "Supreme")) member.roles.remove(supreme)
                    if(member.roles.cache.some(role => role.name === "Elite")) member.roles.remove(elite)
                } else if(user.rank_donate == 5){
                    if(member.roles.cache.some(role => role.name === "Contributor")) member.roles.remove(contributor)
                    if(member.roles.cache.some(role => role.name === "Champion")) member.roles.remove(champion)
                    if(!member.roles.cache.some(role => role.name === "Supreme")) member.roles.add(supreme)
                    if(member.roles.cache.some(role => role.name === "Elite")) member.roles.remove(elite)
                } else {
                    member.roles.remove(contributor)
                    member.roles.remove(champion)
                    member.roles.remove(supreme)
                    member.roles.remove(elite)
                }
    
            }
        }
        

    }


}

async function handleVerifyRole(ctx, member){
    let guild = ctx.client.guilds.cache.get("680834114605416452");
    let url = "https://devtest.wrathplus.com/api/discord/getDiscordDonators";
    const response = await axios.get(url);
    let elite = guild.roles.cache.find(role => role.name === 'Elite');
    let contributor = guild.roles.cache.find(role => role.name === 'Contributor');
    let champion = guild.roles.cache.find(role => role.name === 'Champion');
    let supreme = guild.roles.cache.find(role => role.name === 'Supreme');
    let resp = response.data;

    for(let user of resp){
        if(user.discord_uuid == member.user.id){
            if(user.rank_donate == 2){
                if(member.roles.cache.some(role => role.name === "Contributor")) member.roles.remove(contributor)
                if(member.roles.cache.some(role => role.name === "Champion")) member.roles.remove(champion)
                if(member.roles.cache.some(role => role.name === "Supreme")) member.roles.remove(supreme)
                if(!member.roles.cache.some(role => role.name === "Elite")) member.roles.add(elite)
            } else if(user.rank_donate == 3){
                if(!member.roles.cache.some(role => role.name === "Contributor")) member.roles.add(contributor)
                if(member.roles.cache.some(role => role.name === "Champion")) member.roles.remove(champion)
                if(member.roles.cache.some(role => role.name === "Supreme")) member.roles.remove(supreme)
                if(member.roles.cache.some(role => role.name === "Elite")) member.roles.remove(elite)
            } else if(user.rank_donate == 4){
                if(member.roles.cache.some(role => role.name === "Contributor")) member.roles.remove(contributor)
                if(!member.roles.cache.some(role => role.name === "Champion")) member.roles.add(champion)
                if(member.roles.cache.some(role => role.name === "Supreme")) member.roles.remove(supreme)
                if(member.roles.cache.some(role => role.name === "Elite")) member.roles.remove(elite)
            } else if(user.rank_donate == 5){
                if(member.roles.cache.some(role => role.name === "Contributor")) member.roles.remove(contributor)
                if(member.roles.cache.some(role => role.name === "Champion")) member.roles.remove(champion)
                if(!member.roles.cache.some(role => role.name === "Supreme")) member.roles.add(supreme)
                if(member.roles.cache.some(role => role.name === "Elite")) member.roles.remove(elite)
            }
        }
    }
}

function wpServerTime(ctx){
    if(global.wpData.ServerTimeChannel == undefined){
        global.wpData.ServerTimeChannel = ctx.client.channels.cache.get("889875240618963035");
    }
    let n = dayjs.tz().tz("Europe/London").subtract(1, 'hour').format("hh:mm A");
    console.log("Updating ServerTime; "+global.wpData.ServerTimeChannel.name+" -> "+n);
    global.wpData.ServerTimeChannel.edit({ name: `Server Time: ${n}` }).then((edit) => {
        console.log("Done.");
    }).catch(console.error);
}

function wpVerify(ctx){
    let guild = ctx.client.guilds.cache.get("680834114605416452");
    handleVerifyRoles(ctx, guild);
}
exports.onRemove = function(ext){
	clearInterval(global.wpData.ServerTime)
    clearInterval(global.wpData.Verify)
}

exports.onLoad = function(ext) {
    wpServerTime(ext);
    wpVerify(ext);
	global.wpData.ServerTime = setInterval(wpServerTime, 500000, ext);
    global.wpData.Verify = setInterval(wpVerify, 1800000, ext);
}


exports.checkverify = {
	help: "Uses your email to verify.",
	group: "admin",
	flags: ['$hidden'],
	execute: async function(ctx) {
        await ctx.send("Checking all roles.");
        handleVerifyRoles(ctx.guild);
        await ctx.send("Done.");
    }
};
