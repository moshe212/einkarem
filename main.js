const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const server = http.createServer(app);
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
app.use(bodyParser.json());

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

const job1 = schedule.scheduleJob("45 * * * *", bed24Func.getDeparture);
// const job2 = schedule.scheduleJob("59 * * * *", bed24Func.getArrival);

app.get("*", (req, res) => {
  console.log(req.body);
  res.send("non rout");
  //   res.sendFile(path.join(__dirname + "/Client/build/index.html"));
});

server.listen(port, () => {
  console.log("Example app listening on port " + port);
});
