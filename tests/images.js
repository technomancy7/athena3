const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
function convertImage(path, toType = "jpeg"){
    loadImage(path).then((img) => {
        const canvas = createCanvas(img.height, img.width)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0);
        let paths = path.split("/")
        let outf = paths[paths.length-1].split(".")[0]
        let out;
        let stream;
        if(toType == "jpeg" || toType == "jpg") {
            out = fs.createWriteStream(__dirname + '/'+outf+'.jpeg')
            stream = canvas.createJPEGStream()
        } else {
            out = fs.createWriteStream(__dirname + '/'+outf+'.png')
            stream = canvas.createPNGStream()
        }
        //const stream = canvas.createPNGStream()
        
        stream.pipe(out)
        out.on('finish', () =>  console.log(`The ${toType} file was created.`))
        
      }).catch(err => {
        console.log('oh no!', err)
    })
}

convertImage("tests/Shot0000.bmp", "jpg");