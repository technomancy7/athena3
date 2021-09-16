
const fs = require("fs")
var needle = require('needle');
const discord = require('discord.js');
exports.executeDatacube = function(path, cb){
    if(path.startsWith("http")){
        needle('get', path).then(function(response) {
            body = response.body;
            let dc = new Datacube(body);
            cb(dc);
        });
    }else{

    }
    
}

class Datacube {
    constructor(body){
        this.body = body;
        this.current_message = "";
        this.in_message = false;
        this.compiling = false;

        this.values = {};
        this.objects = {};
        this.commands = {
            "DATA": async function(client, ln){
                console.log("SET "+ln);
                client.values[ln.split("=")[0].trim()] = ln.split("=")[1].trim();
            },
            "UPLOAD": async function(client, ln){
                var readStream = fs.createReadStream(rootDir+ln);
                const attachment = new discord.MessageAttachment(readStream, ln);
                let chan = client.channel()
                await chan.send({ files: [attachment] });

            },
            "BEGIN": async function(client, ln){
                console.log("BEGIN MESSAGE")
                if(client.current_message == ""){
                    console.log("ALLOWED")
                    client.in_message = true;
                    client.tunnel = async function(client, ln){
                        if(ln == "SEND"){
                            console.log("SENDING");
                            let chan = client.channel()
                            await chan.send(client.current_message);
                            client.current_message = "";
                            client.in_message = false;
                            delete client.tunnel;
                        } else {
                            client.current_message = client.current_message+"\n"+ln
                        }
                    }
                }
            }
        }
    }

    channel(){
        if(this.objects["channel"] == undefined){
            this.objects["channel"] = this.objects["discord"].channels.cache.get(this.values["channel"])
        }
        return this.objects["channel"]
    }

    async exec(ln){
        console.log("EXEC "+ln);
        if(this.in_message == true){ await this.tunnel(this, ln); }
        let params = ln.split(" ");
        let cmd = params.shift();

        if(this.compiling == true && !["DATA"].includes(cmd)) return;
        if(this.commands[cmd] != undefined) await this.commands[cmd](this,params.join(" "));
    }

    set(key, val){ this.objects[key] = val; }

    async compile(){
        this.compiling = true;
        await this.parse();
        this.compiling = false;
    }
    async parse(){
        for(let ln of this.body.split("\n")){
            if(!ln.startsWith("COMMENT") && ln != "") await this.exec(ln);
        }
    }
}

exports.Datacube = Datacube;