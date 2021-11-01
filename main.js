const qrcode = require("qrcode-terminal");
const dotenv = require("dotenv");
const { Client } = require("whatsapp-web.js");
const schedule = require("node-schedule");
const fs = require("fs");

dotenv.config();

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

const job1 = schedule.scheduleJob("22 * * * *", bed24Func.getDeparture);
// const job2 = schedule.scheduleJob("59 * * * *", bed24Func.getArrival);
