const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const server = http.createServer(app);
const multer = require("multer");
const upload = multer();
const axios = require("axios");

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}

const qrcode = require("qrcode-terminal");
// const dotenv = require("dotenv");
const { Client } = require("whatsapp-web.js");
const schedule = require("node-schedule");
const fs = require("fs");

dotenv.config();
// app.use(bodyParser.json());
app.use(express.json({ limit: "1mb" }));
app.use(upload.array());
app.use(express.static("public"));
app.use(express.urlencoded());

const { bed24Func } = require("./bed24Func");
let sessionData;

const client = new Client({
  qrTimeoutMs: 0,
  puppeteer: {
    args: ["--no-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

// Path where the session data will be stored
const SESSION_FILE_PATH = "./session.json";

// Save session values to the file upon successful auth
client.on("authenticated", (session) => {
  sessionData = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
    if (err) {
      console.error(err);
    }
  });
});

// client.on("message", (message) => {
//   if (message.body === "ping") {
//     console.log(message.from);

//     client.sendMessage(message.from, "pong");
//   }
// });
client.initialize();

const job1 = schedule.scheduleJob("40 * * * *", bed24Func.getDeparture);
// const job2 = schedule.scheduleJob("59 * * * *", bed24Func.getArrival);

app.post("/api/CreateInvoice", async (req, res) => {
  console.log("data", req.body);

  const apiKey = process.env.apiKey;
  const propKeys = [process.env.propKey1, process.env.propKey2];
  const bookid = req.body.data.customFields.cField1;
  const propid = req.body.data.customFields.cField2;
  const propkey =
    propid === "123250" ? propKeys[0] : propid === "115824" ? propKeys[1] : "";

  console.log("propid", propid, bookid);
  await axios
    .get("https://api.beds24.com/json/setBooking", {
      data: {
        authentication: {
          apiKey: apiKey,
          propKey: propkey,
        },
        bookId: bookid,
        invoice: [
          {
            description: "שולם בכרטיס אשראי באמצעות הבוט",
            qty: "-1",
            price: req.body.data.sum,
            vatRate: "17",
            type: "200",
          },
        ],
      },
    })
    .then(function (res) {
      console.log("resCreateInvoice", res.data);
    })
    .catch(function (error) {
      console.log(error);
    });

  res.send("non rout");
  //   res.sendFile(path.join(__dirname + "/Client/build/index.html"));
});

app.get("*", (req, res) => {
  console.log(req.body);
  res.send("non rout");
  //   res.sendFile(path.join(__dirname + "/Client/build/index.html"));
});

server.listen(port, () => {
  console.log("Example app listening on port " + port);
});
