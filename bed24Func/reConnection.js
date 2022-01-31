const { Client } = require("whatsapp-web.js");
const fs = require("fs");
const moment = require("moment");

const reConnection = async () => {
  // Path where the session data will be stored
  const SESSION_FILE_PATH = "../session.json";
  const LogFilePath = "./logs.txt";
  console.log(SESSION_FILE_PATH);
  // Load the session data if it has been previously saved
  let sessionData;
  if (fs.existsSync("session.json")) {
    console.log("exist");
    const now = moment().format("MMMM Do YYYY, h:mm:ss a");
    const data = `\n ${now} Session file is exist getArrival`;
    fs.appendFile(LogFilePath, data, (err) => {
      if (err) {
        console.error(err);
      }
    });
    sessionData = await require(SESSION_FILE_PATH);
  } else {
    console.log("not");
    const now = moment().format("MMMM Do YYYY, h:mm:ss a");
    const data = `\n ${now} Session file is not exist getArrival`;
    fs.appendFile(LogFilePath, data, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
  const client = new Client({
    session: sessionData,
    puppeteer: {
      args: ["--no-sandbox"],
    },
  });
  client.on("ready", () => {
    console.log("Client is ready2!");
    const now = moment().format("MMMM Do YYYY, h:mm:ss a");
    const data = `\n ${now} Client is ready getArrival`;
    fs.appendFile(LogFilePath, data, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });

  // Save session values to the file upon successful auth
  client.on("authenticated", (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
      if (err) {
        console.error(err);
      }
    });
    const now = moment().format("MMMM Do YYYY, h:mm:ss a");
    const data = `\n ${now} Session file is update getArrival`;
    fs.appendFile(LogFilePath, data, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });

  await client.initialize();
  await client.sendMessage("972523587990@c.us", "Test from bot");
};

module.exports = { reConnection };
