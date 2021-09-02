var convert = require('xml-js');

class Reddit {
    constructor(){
        this.cache = {}
    }

    get(subreddit, type){
        if(type == undefined) type = "new";
        let url = `https://www.reddit.com/r/${subreddit}/${type}/.rss`
        xml = ""; //GET FROM URL DATA
        var result1 = convert.xml2json(xml, {compact: true, spaces: 4});
    }
}