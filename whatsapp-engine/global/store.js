const axios = require("axios");

async function StoreMessage(msg) {
  const dataInputan = [];
  switch (msg.type) {
    case "document":
      const document = await msg.downloadMedia();
      const typeFromFileName = document.filename.split(".");
      dataInputan["type"] = typeFromFileName[1];
      dataInputan["content"] = document.data;
      break;
    case "image":
      const image = await msg.downloadMedia();
      dataInputan["type"] = image.mimetype;
      dataInputan["content"] = image.data;
      break;
    case "video":
      console.log("masuk video");
      break;

    case "chat":
      dataInputan["type"] = msg.type;
      dataInputan["content"] = msg._data.body;
      break;
    default:
      return "whatsapp bot belum bisa menerima inputan ini";
  }
  const data = {
    fromMe: msg.fromMe,
    from: msg._data.from,
    to: msg._data.to,
    type: dataInputan["type"],
    content: dataInputan["content"],
    whatsapp_chat_id: msg._data.id.id,
    whatsapp_chat_id_serialized: msg._data.id._serialized,
    notifyName: msg._data.notifyName,
    time: msg.timestamp,
    body: msg.body,
    size: msg._data.size,
    isNewMsg: msg._data.isNewMsg,
    quotedStanzaID: msg._data.quotedStanzaID,
    author : msg.author
  };

  axios
      .post(process.env.API_URL + "/whatsapp-engine/store/message", data)
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
}

async function SendQr(qr) {
  axios
    .post("http://127.0.0.1/whatsapp-engine/qr", {
      qr: qr,
    })
    .then((res) => {
      console.log(res.data);
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = { StoreMessage, SendQr };
