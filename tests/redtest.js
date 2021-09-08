let { Reddit } = require("../reddit.js")
let client = new Reddit();
console.log(client)
client.get("funny", "new", function(data){
    for(let post of data){
        console.log(post);
        console.log(post.author)
        console.log(" ");
    }
})