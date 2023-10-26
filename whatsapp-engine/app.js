require('dotenv').config();

//Constanta
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");
const config = require("./config.json");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require('qrcode-terminal');
const GlobalFunction = require("./global/store");


//Axios Setting
axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.ENGINE_TOKEN
axios.defaults.baseURL = process.env.API_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

//Identity
process.title = "whatsapp-node-api";

//Express JS to running Server API
const app = express();
const port = process.env.PORT || config.port;

//Express JS config
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Whatsap API Client
global.client = new Client({
    restartOnAuthFail: true,
    authStrategy: new LocalAuth(),
    puppeteer: {headless: true, args: [ '--no-sandbox' ], }
});

//Authenticate
global.authed = false;

//Listener
client.on("qr", (qr) => {
    console.log("QR Client");
    fs.writeFileSync("./components/last.qr", qr);
    qrcode.generate(qr, {small: true});
    GlobalFunction.SendQr(qr);
});

client.on("auth_failure", () => {
    console.log("AUTH Failed !");
});

client.on("ready", () => {
    console.log("Client is ready!");
});

client.on("message", async (msg) => {
    // GlobalFunction.StoreMessage(msg);
    if (config.webhook.enabled) {
        
        if (msg.hasMedia) {  
            const attachmentData = await msg.downloadMedia();
            msg.attachmentData = attachmentData;
        }
        axios.post(config.webhook.path, { msg });
    }
});

client.on("disconnected", () => {
    console.log("disconnected");
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.initialize();


const chatRoute = require("./components/chatting");
const groupRoute = require("./components/group");
const authRoute = require("./components/auth");
// const messageRoute = require("./components/message");
const contactRoute = require("./components/contact");

app.use(function (req, res, next) {
    console.log(req.method + " : " + req.path);
    next();
});

app.use("/chat", chatRoute);
app.use("/group", groupRoute);
app.use("/auth", authRoute);
app.use("/contact", contactRoute);
// app.use("/message", messageRoute);

app.listen(port, () => {
   
    console.log("Server Running Live on Port : " + port);
});
