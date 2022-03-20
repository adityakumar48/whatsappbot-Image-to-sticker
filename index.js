const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, MessageMedia } = require('whatsapp-web.js');
const SESSION_FILE_PATH = './session.json';
const mime = require('mime-types');
const rmeme = require('rmeme');
const express = require('express');
const app = express();
var http=require("http"); 
const PORT = process.env.PORT || 8000
const path = require('path');
var ffmpegs = require('ffmpeg');

app.get('/',function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));

    let sessionData;
    if (fs.existsSync(SESSION_FILE_PATH)) {
        sessionData = require(SESSION_FILE_PATH);
    }
    
    const client = new Client({
        puppeteer: { args: ["--no-sandbox"] },
        ffmpeg:'./ffmpeg',
        session: sessionData
    });
    client.on('authenticated', (session) => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });
    client.on('message', message => {
        console.log(message.body);
    });
    
    
    client.on('message', async message => {
        if (message.body === '-ping') {
            message.reply('pong');
        }
        //
        // else if (message.body === '-moon') {
        //     console.log('moon');
        //     const moon = MessageMedia.fromFilePath(filePath = "./moon.jpg")
        //     client.sendMessage(message.from, message.reply(moon))
        // }
     
        //
        else if (message.body === '-meme') {
            const ImageUrl = await rmeme.meme()
            console.log(ImageUrl);
            const memeImg = await MessageMedia.fromUrl(ImageUrl);
            client.sendMessage(message.from, message.reply(await memeImg))
        }
        
        //
        else if (message.hasMedia) {
            message.downloadMedia().then(media => {

                if (media) {
    
                    const mediaPath = './downloaded-media/';
    
                    if (!fs.existsSync(mediaPath)) {
                        fs.mkdirSync(mediaPath);
                    }
    
    
                    const extension = mime.extension(media.mimetype);
    
                    const filename = new Date().getTime();
    
                    const fullFilename = mediaPath + filename + '.' + extension;
    
                    // Save to file
                    try {
                        fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                        console.log('File downloaded successfully!', fullFilename);
                        console.log(fullFilename);
                        MessageMedia.fromFilePath(filePath = fullFilename)
                        client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true,stickerAuthor:"Created By Bot",stickerName:"Stickers"} )
                        fs.unlinkSync(fullFilename)
                        console.log(`File Deleted successfully!`,);
                    } catch (err) {
                        console.log('Failed to save the file:', err);
                        console.log(`File Deleted successfully!`,);
                    }

                   

                }
            });
        }
    
        
        //
        else if (message.body === '-help') {
            message.reply(
                `*Commands*
1. -meme  
                `
            )
        }
        // else{
        // message.reply(
        //     `*You Can Select This Commands Only*
        //     1. -meme
        //         2. -rmeme
        //         3. -moon
        //         `
        //     )
        // }
      
    })
    
    
    
    
    client.on('ready', () => {
        console.log('Client is ready!');
    });
    
    client.initialize();
    
    
    res.send()

});


app.listen(PORT,()=>{
    console.log(`PORT LISTENING ON ${PORT}`);
})
