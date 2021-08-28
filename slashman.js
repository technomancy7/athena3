const fs = require('fs');
var common = require('./common.js');

function nocache(module) {
	require("fs").watchFile(require("path").resolve(module), () => {delete require.cache[require.resolve(module)];});
}

class SlashManager {
    constructor(client){
        this.client = client;
        this.commands = {};
        this.aliasMap = {};
    
        this.threads = {};
    };

    process_commands(client, cfg, msg){
        var cmd = msg.content.replace(this.prefix, "");
        var args = cmd.split(" ");
        var command = args.shift();
        var ctx = new Ctx(this, client, cfg, msg);
        try {
            this.run(command, ctx);
        }catch(err){
            msg.channel.send(common.wrap(err));
        }
    };
    
    reload_ext(target){
        if (target != undefined){
            nocache(`./ext/${target}`);
            var count = 0;
            const command = require(`./ext/${target}`);
            for (const c of Object.keys(command)){
                this.addCommand(c, command[c]);
                count += 1;
            }
            return count;
            
        }else{
            this.commands = {};
            this.aliasMap = {};
    
            const commandFiles = fs.readdirSync('./ext').filter(file => file.endsWith('.js'));
    
            for (const file of commandFiles) {
                nocache(`./ext/${file}`);
                const command = require(`./ext/${file}`);
                for (const c of Object.keys(command)){
                    this.addCommand(c, command[c]);
                }
            }
            return commandFiles;
        }
    };
    
    reload_threads(target){
        if (target != undefined){
            nocache(`./threads/${target}`);
            var count = 0;
            const command = require(`./threads/${target}`);
            for (const c of Object.keys(command)){
                this.addThread(c, command[c]);
                count += 1;
            }
            return count;
            
        }else{
            const commandFiles = fs.readdirSync('./threads').filter(file => file.endsWith('.js'));
            this.threads = {};
            for (const file of commandFiles) {
                nocache(`./threads/${file}`);
                const command = require(`./threads/${file}`);
                for (const c of Object.keys(command)){
                    this.addThread(c, command[c]);
                }
            }
            return commandFiles;
        }
    };
    
    asList(){
        return Object.keys(this.commands);
    };
    
    addCommand(name, data){
        if(data.auto != undefined) data.auto(this.client);
        
        if(data.execute == undefined)return;
        data.name = name;
        this.commands[name] = new Command(data);
        const aliases = this.commands[name].aliases;
        for (let i=0;i<aliases.length;i++){
            this.aliasMap[aliases[i]] = name;
        }
    };
    
    addThread(name, data){
        if(this.client._config.get('halted_threads') == undefined) this.client._config.set("halted_threads", []);
        if(this.client._config.get('halted_threads').includes(name)) return;
        
        let interval = 1000;
        if (data.interval != undefined){interval = data.interval;}
        let thr = this.client.setInterval(data.loop, interval, {client: this.client});
        this.threads[name] = thr;
        
    };
    
    stopThread(name){
        this.client.clearInterval(this.threads[name]);
    };
    
    set(name, key, val){
        this.commands[name][key] = val;
    };
    
    setHelp(name, help){
        this.commands[name].help = help;
    };
    
    setGroup(name, group){
        this.commands[name].group = group;
    };
    
    setAliases(name, aliases){
        for (i=0;i<aliases.length;i++){
            this.commands[name].aliases.push(aliases[i]);
            this.aliasMap[aliases[i]] = name;
        }
    };
    
    getCommand(name){
        return this.commands[name];
    };
    
    async run(name, ctx, args){
        if (this.commands[name] != undefined){
            try {
                let l = await this.commands[name].execute(ctx);
                if(l != undefined) {await ctx.reply(l);}
            }catch(err) {ctx.channel.send(common.wrap(err));}
        }else if (this.aliasMap[name] != undefined){
            this.run(this.aliasMap[name], ctx);
        }
    };
}


class Ctx {
    constructor(cman,client,cfg,message) {
        this.message=message;
        this.client=client;
        this.channel=message.channel;
        this.guild=message.guild;
        this.member=message.member;
        this.author=message.author;
        this.cfg=cfg;
        this.commands=cman;
        this.ext=cman;

        this.args=this.message.content.split(" ");
        this.args.shift();
        this.argsRaw=this.args.join(" ");
    }
    async invoke(command) {
        await this.commands.run(command,this);
    }
    async clone() {
        var ctx=new Ctx(this.commands,this.client,this.msg,this.cfg);
        return ctx;
    }
    async newCtx(msg) {
        var ctx=new Ctx(this.commands,this.client,msg,this.cfg);
        return ctx;
    }

    say(msg) {
        return this.channel.send(msg);
    }
    send(msg) {
        return this.channel.send(msg);
    }
    reply(msg) {
        return this.message.reply(msg);
    }
    code(msg,code) {
        this.channel.send(`\`\`\`${code}\n${msg}\n\`\`\``);
    }
    getGuildChannel(name) {
        for(const chan of this.guild.channels.cache) {
            const u=chan[1];
            if(u.name==name||u.id==name) {
            return u;
            }
        }
        return undefined;
    }
    findGuildChannel(name) {
        for(const chan of this.guild.channels.cache) {
            const u=chan[1];
            if(u.name.lower().includes(name.lower())||u.name.lower()==name.lower()||u.id==name) {
                return u;
            }
        }
        return undefined;
    }
    getChannel(name) {
        for(const chan of this.client.channels.cache) {
            const u=chan[1];
            if(u.name==name||u.id==name) {
                return u;
            }
        }
        return undefined;
    }
    findChannel(name) {
    for(const chan of this.client.channels.cache) {
    const u=chan[1];
    if(u.name.lower().includes(name.lower())||u.name.lower()==name.lower()||u.id==name) {
    return u;
    }
    }
    return undefined;
    }
    getGuild(name) {
    for(const guild of this.client.guilds.cache) {
    const u=guild[1];
    if(u.name==name||u.id==name) {
    return u;
    }
    }
    return undefined;
    }
    findGuild(name) {
    for(const guild of this.client.guilds.cache) {
    const u=guild[1];
    if(u.name.lower().includes(name.lower())||u.name.lower()==name.lower()||u.id==name) {
    return u;
    }
    }
    return undefined;
    }
    getRole(name) {
    for(const role of this.guild.roles.cache) {
    const u=role[1];
    if(u.name==name||u.id==name) {
    return u;
    }
    }
    return undefined;
    }
    findRole(name) {
    for(const role of this.guild.roles.cache) {
    const u=role[1];
    if(u.name.lower().includes(name.lower())||u.name.lower()==name.lower()||u.id==name) {
    return u;
    }
    }
    return undefined;
    }
    getMember(name) {
    for(const user of this.guild.members.cache) {
    const u=user[1];
    if(u.nickname==name||u.id==name||u.user.username==name) {
    return u;
    }
    }
    return undefined;
    }
    findMember(name) {
    for(const user of this.guild.members.cache) {
    const u=user[1];
    if((u.nickname&&u.nickname.toLowerCase().includes(name.toLowerCase()))||u.nickname==name||u.user.username.toLowerCase().includes(name.toLowerCase())||u.user.username==name||u.id==name) {
    return u;
    }
    }
    return undefined;
    }
    getUser(name) {
    for(const user of this.client.users.cache) {
    const u=user[1];
    if(u.username==name||u.id==name) {
    return u;
    }
    }
    return undefined;
    }   
}



exports.Ctx = Ctx;
exports.ExtManager = ExtManager;
exports.Command = Command;
exports.rand = function(intn) { return Math.floor((Math.random() * intn) + 1); };




