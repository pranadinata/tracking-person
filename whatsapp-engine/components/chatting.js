const router = require('express').Router();
const { MessageMedia, Location } = require("whatsapp-web.js");
const request = require('request')
const vuri = require('valid-url');
const fs = require('fs');
const GlobalFunction = require("../global/store");

const mediadownloader = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url)
            .pipe(fs.createWriteStream(path))
            .on('close', callback)
    })
}

router.post('/sendmessage/:phone', async (req,res) => {
    let phone = req.params.phone;
    let message = req.body.message;
    let reply = req.body.reply;

    let options = {}
    if(reply){
        options = {
            isViewOnce : true,
            quotedMessageId : reply
        }
    }
    
    if (phone == undefined || message == undefined) {
        res.send({ status:"error", message:"please enter valid phone and message" })
    } else {
        client.sendMessage(phone, message,options).then((response) => {
            GlobalFunction.StoreMessage(response)
            if (response.id.fromMe) {
                res.json({ status:'success', data : response })
            }
        });
    }
});

router.post('/sendimage/:phone', async (req,res) => {
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    let phone = req.params.phone;
    let image = req.body.image;
    let caption = req.body.caption;

    if (phone == undefined || image == undefined) {
        res.send({ status: "error", message: "please enter valid phone and base64/url of image" })
    } else {
        if (base64regex.test(image)) {
            let media = new MessageMedia('image/png',image);
            client.sendMessage(`${phone}@c.us`, media, { caption: caption || '' }).then((response) => {
                if (response.id.fromMe) {
                    res.send({ status: 'success', message: `MediaMessage successfully sent to ${phone}` })
                }
            });
        } else if (vuri.isWebUri(image)) {
            if (!fs.existsSync('./temp')) {
                await fs.mkdirSync('./temp');
            }

            var path = './temp/' + image.split("/").slice(-1)[0]
            mediadownloader(image, path, () => {
                let media = MessageMedia.fromFilePath(path);

                client.sendMessage(`${phone}@c.us`, media, { caption: caption || '' }).then((response) => {
                    if (response.id.fromMe) {
                        res.send({ status: 'success', message: `MediaMessage successfully sent to ${phone}` })
                        fs.unlinkSync(path)
                    }
                });
            })
        } else {
            res.send({ status:'error', message: 'Invalid URL/Base64 Encoded Media' })
        }
    }
});

router.post('/sendpdf/:phone', async (req,res) => {
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    let phone = req.params.phone;
    let pdf = req.body.pdf;

    if (phone == undefined || pdf == undefined) {
        res.send({ status: "error", message: "please enter valid phone and base64/url of pdf" })
    } else {
        if (base64regex.test(pdf)) {
            let media = new MessageMedia('application/pdf', pdf);
            client.sendMessage(`${phone}@c.us`, media).then((response) => {
                if (response.id.fromMe) {
                    res.send({ status: 'success', message: `MediaMessage successfully sent to ${phone}` })
                }
            });
        } else if (vuri.isWebUri(pdf)) {
            if (!fs.existsSync('./temp')) {
                await fs.mkdirSync('./temp');
            }

            var path = './temp/' + pdf.split("/").slice(-1)[0]
            mediadownloader(pdf, path, () => {
                let media = MessageMedia.fromFilePath(path);
                client.sendMessage(`${phone}@c.us`, media).then((response) => {
                    if (response.id.fromMe) {
                        res.send({ status: 'success', message: `MediaMessage successfully sent to ${phone}` })
                        fs.unlinkSync(path)
                    }
                });
            })
        } else {
            res.send({ status: 'error', message: 'Invalid URL/Base64 Encoded Media' })
        }
    }
});

router.post('/sendlocation/:phone', async (req, res) => {
    let phone = req.params.phone;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let desc = req.body.description;

    if (phone == undefined || latitude == undefined || longitude == undefined) {
        res.send({ status: "error", message: "please enter valid phone, latitude and longitude" })
    } else {
        let loc = new Location(latitude, longitude, desc || "");
        client.sendMessage(`${phone}@c.us`, loc).then((response)=>{
            if (response.id.fromMe) {
                res.send({ status: 'success', message: `MediaMessage successfully sent to ${phone}` })
            }
        });
    }
});

router.get('/getchatbyid/:phone/:count', async (req, res) => {
    let phone = req.params.phone;
    let count = req.params.count;
    if (phone == undefined) {
        res.send({status:"error",message:"please enter valid phone number"});
    } else {
        client.getChatById(`${phone}`).then((chat) => {
            // res.send(chat)
            chat.fetchMessages({limit: count}).then(messages => {
                res.send({ status:"success", message: messages });
            });
        }).catch(() => {
            console.error("getchaterror")
            res.send({ status: "error", message: "getchaterror" })
        })
    }
});

router.get('/getchats', async (req, res) => { 
    client.getChats().then((chats) => {
        res.send({ status: "success", message: chats});
    }).catch(() => {
        res.send({ status: "error",message: "getchatserror" })
    })
});

router.get('/showLastChats', async (req, res) => {
    const getLastChats = client.getChats().then((chats) => {
        if(chats){           
            // res.send({ message: chats[0] });
            return chats[0];
        }
    })
    .catch(() => {
        res.send({ status: "error",message: "getchatserror" })
    })
    getLastChats.then((value)=>{
        res.send(value)
        // res.send(value.isGroup)
        

        // console.log(value)
        // console.log(value.lastMessage._data.from.user)   
        // Chat.create({
        //     from : value.lastMessage._data.from.user,
        //     to : value.lastMessage._data.to.user,
        //     type : value.lastMessage._data.mimetype,
        //     content: value.lastMessage._data.body,
        //     whatsapp_chat_id : value.lastMessage._data.id.id, 
        //     whatsapp_from_name : value.lastMessage._data.notifyName,
        //     whatsapp_send_timestamp : value.timestamp,
        //     openai_embedding_id: 1,
        //     has_answer: false,
        // });
    });
});
module.exports = router;
