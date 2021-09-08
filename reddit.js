var convert = require('xml-js');
var needle = require('needle');

class Reddit {
    constructor(){
        this.cache = {}
    }

    get(subreddit, type, cb){
        if(type == undefined) type = "new";
        let url = `https://www.reddit.com/r/${subreddit}/${type}/.rss`
        //xml = ""; //GET FROM URL DATA
        
        needle.get(url,function(error, data){
            let outf = [];
            for(let post of data.body.children){
                if(post.name == 'entry'){
                    let n = {author: "", category: "", id: "", thumbnail: "", link: "", updated: "", published: "", title: ""};
                    //console.log(post)
                    for(let entry of post.children) {
                        
                        if(entry.name == "author") n.author = {name: entry.children[0].value, uri: entry.children[1].value};
                        if(entry.name == "category") n.category = entry.attributes;
                        if(entry.name == "id") n.id = entry.value;
                        if(entry.name == "media:thumbnail") n.thumbnail = entry.attributes.url;
                        if(entry.name == "link") n.link = entry.attributes.href;
                        if(entry.name == "updated") n.updated = entry.value;
                        if(entry.name == "published") n.published = entry.value;
                        if(entry.name == "title") n.title = entry.value;
                    }
                    outf.push(n);
                }
            }
            //var result1 = convert.xml2json(data.body, {compact: true, spaces: 4});
			cb(outf);

		});
    }
}

exports.Reddit = Reddit;