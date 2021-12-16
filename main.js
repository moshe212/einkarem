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

const moment = require("moment");
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

const job1 = schedule.scheduleJob("20 * * * 0-5", bed24Func.getDeparture);

const job2 = schedule.scheduleJob("0 21 * * 6", bed24Func.getDeparture);

// const job2 = schedule.scheduleJob("59 * * * *", bed24Func.getArrival);

app.post("/api/CreateInvoice", async (req, res) => {
  console.log("data", req.body);
  const place = req.body.data.customFields.cField2;
  console.log("place", place);
  const pageCode =
    place === "115824"
      ? process.env.pageCode1
      : place === "123250"
      ? process.env.pageCode2
      : "";
  const transactionId = req.body.data.transactionId;
  const transactionToken = req.body.data.transactionToken;
  const paymentSum = req.body.data.sum;
  let approveStatus = "";
  const url = `https://secure.meshulam.co.il/api/light/server/1.0/approveTransaction/?pageCode=${pageCode}&transactionId=${transactionId}&transactionToken=${transactionToken}&paymentSum=${paymentSum}`;
  console.log("urlApprove", url);
  await axios({
    method: "post",
    url: url,
    headers: {
      "Content-Type": "application/json",
    },
  }).then(function (response) {
    console.log("ResponseApprove:", response.data.status);
    approveStatus = response.data.status;
  });

  if (parseInt(approveStatus) === 1) {
    const apiKey = process.env.apiKey;
    const propKeys = [process.env.propKey1, process.env.propKey2];
    const bookid = req.body.data.customFields.cField1;
    const propid = req.body.data.customFields.cField2;
    const propkey =
      propid === "123250"
        ? propKeys[0]
        : propid === "115824"
        ? propKeys[1]
        : "";

    // // Add invoice item
    // await axios
    //   .post("https://api.beds24.com/json/setBooking", {
    //     data: {
    //       authentication: {
    //         apiKey: apiKey,
    //         propKey: propkey,
    //       },
    //       bookId: bookid,
    //       invoice: [
    //         {
    //           description: "פרטי מיני בר",
    //           qty: "1",
    //           price: req.body.data.sum,
    //           vatRate: "17",
    //         },
    //       ],
    //     },
    //   })
    //   .then(function (res) {
    //     console.log("resCreateInvoice", res.data);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });

    // Add payment and close invoice
    console.log("propid", propid, bookid);
    await axios
      .get("https://api.beds24.com/json/setBooking", {
        data: {
          authentication: {
            apiKey: apiKey,
            propKey: propkey,
          },
          bookId: bookid,
          assignInvoiceNumber: true,
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
  } else {
    // Load the session data if it has been previously saved
    let sessionData;
    if (fs.existsSync("session.json")) {
      console.log("exist");
      sessionData = await require(SESSION_FILE_PATH);
    } else {
      console.log("not");
    }

    const client = new Client({
      session: sessionData,
      puppeteer: {
        args: ["--no-sandbox"],
      },
    });
    client.on("ready", () => {
      console.log("Client is ready3!");
    });
    await client.initialize();
    const bookid = req.body.data.customFields.cField1;
    const textMessagePayError =
      "גביית התשלום באשראי עבור הזמנה מספר " + bookid + " לא עברה בהצלחה.";
    await client.sendMessage("972523587990@c.us", textMessagePayError);
  }

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
