const router = require("express").Router();
const fs = require("fs");

router.get("/check", async (req, res) => {
    client
        .getState()
        .then((data) => {
            console.log(data);
            if(data){
                res.json(data);
            }else{
                res.json(null);
            }
        })
        .catch((err) => {
            console.log(err);
            // if (err) {
            //     res.json(err);
            // }
        });
        
});

router.get("/qr", async (req, res) => {
    client
        .getState()
        .then((data) => {
            if (data) {
                res.json(null);
            } else sendQr(res);
        })
        .catch((err) => {
            console.log(err);
        });
});

router.get("/qrHtml", async (req, res) => {
    client
        .getState()
        .then((data) => {
            if (data) {
                res.json(null);
            } else sendQrHtml(res);
        })
        .catch(() => sendQrHtml(res));
});

function sendQr(res) {
    fs.readFile("components/last.qr", 'utf8',(err, last_qr) => {
        if (!err && last_qr) {
            res.json(last_qr);
        }
    });
}

function sendQrHtml(res) {
    fs.readFile("components/last.qr", (err, last_qr) => {
        if (!err && last_qr) {
            var page = `
                    <html>
                        <body>
                            <script type="module">
                            </script>
                            <div id="qrcode"></div>
                            <script type="module">
                                import QrCreator from "https://cdn.jsdelivr.net/npm/qr-creator/dist/qr-creator.es6.min.js";
                                let container = document.getElementById("qrcode");
                                QrCreator.render({
                                    text: "${last_qr}",
                                    radius: 0.5, // 0.0 to 0.5
                                    ecLevel: "H", // L, M, Q, H
                                    fill: "#536DFE", // foreground color
                                    background: null, // color or null for transparent
                                    size: 256, // in pixels
                                }, container);
                            </script>
                        </body>
                    </html>
                `;
            res.write(page);
            res.end();
        }
    });
}

module.exports = router;
