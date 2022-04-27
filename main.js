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

// let sessionData;

// const client = new Client({
//   qrTimeoutMs: 0,
//   puppeteer: {
//     args: ["--no-sandbox"],
//   },
// });

// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });

// client.on("ready", () => {
//   console.log("Client is ready!");
// });

// // Path where the session data will be stored
// const SESSION_FILE_PATH = "./session.json";

// // Save session values to the file upon successful auth
// client.on("authenticated", (session) => {
//   sessionData = session;
//   fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
//     if (err) {
//       console.error(err);
//     }
//   });
// });

// client.initialize();

const STAGES_FILE_PATH = "stages.json";
const craeteStageFile = async () => {
  const BookingList = await bed24Func.getBooking(false);

  try {
    fs.unlinkSync(STAGES_FILE_PATH);
    //file removed
    console.log("File deleted!");
  } catch (err) {
    console.error(err);
  }
  await bed24Func.createStageFile(BookingList);
  let stagesData;
  const data = fs.readFileSync(STAGES_FILE_PATH, {
    encoding: "utf8",
    flag: "r",
  });
  stagesData = await JSON.parse(data);
  console.log("stagesData", stagesData);
};
const job1 = schedule.scheduleJob("30 07 * * 0-6", craeteStageFile);
craeteStageFile();
// const sendCheckInOut = async () => {
//   await bed24Func.getArrival();
//   await bed24Func.getDeparture();
// };

// const job2 = schedule.scheduleJob("40 13 * * 0-5", sendCheckInOut);

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
  const url =
    "https://secure.meshulam.co.il/api/light/server/1.0/approveTransaction";
  console.log("urlApprove", url);
  await axios({
    method: "post",
    url: url,
    data: `pageCode=${pageCode}&transactionId=${transactionId}&transactionToken=${transactionToken}&paymentSum=${paymentSum}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
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
        console.log("resCreateInvoice_main", res.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  } else {
    // Load the session data if it has been previously saved
    //   let sessionData;
    //   if (fs.existsSync("session.json")) {
    //     console.log("exist");
    //     sessionData = await require(SESSION_FILE_PATH);
    //   } else {
    //     console.log("not");
    //   }

    //   const client = new Client({
    //     session: sessionData,
    //     puppeteer: {
    //       args: ["--no-sandbox"],
    //     },
    //   });
    //   client.on("ready", () => {
    //     console.log("Client is ready3!");
    //   });
    //   await client.initialize();
    //   const bookid = req.body.data.customFields.cField1;
    //   const textMessagePayError =
    //     "גביית התשלום באשראי עבור הזמנה מספר " + bookid + " לא עברה בהצלחה.";
    //   await client.sendMessage("972523587990@c.us", textMessagePayError);
    // }
    console.log("non rout");
    res.send("non rout");
    //   res.sendFile(path.join(__dirname + "/Client/build/index.html"));
  }
});

app.post("/api/GetMessage", async (req, res) => {
  console.log("GetMessage", req.body);
  const BookingList = await bed24Func.getBooking(false);
  const sender =
    req.body.query.sender
      .replace(" ", "")
      .replace("+", "")
      .replace("-", "")
      .replace("-", "") + "@c.us";
  const message = req.body.query.message;

  let stagesData;
  const data = fs.readFileSync(STAGES_FILE_PATH, {
    encoding: "utf8",
    flag: "r",
  });
  stagesData = await JSON.parse(data);

  console.log("sender", sender);
  console.log("stagesData", stagesData.bookinglist);
  const index = await stagesData.bookinglist.findIndex(
    (x) => x.phone === sender
  );
  console.log("idx", index);
  if (index >= 0) {
    const BookId = stagesData.bookinglist[index].bookId;
    const isBookingSite =
      stagesData.bookinglist[index].referer === "Booking.com" ? true : false;
    const Stage = stagesData.bookinglist[index].stage;
    const Price = parseFloat(stagesData.bookinglist[index].price);
    const PriceMAAM = isBookingSite ? Price * 1.17 : Price;
    const Place = stagesData.bookinglist[index].propId;
    const FirstName = stagesData.bookinglist[index].guestFirstName;
    const LastName = stagesData.bookinglist[index].guestLastName;
    // console.log("Place1", Place);
    isIsraeli =
      stagesData.bookinglist[index].lang === "HE" ||
      stagesData.bookinglist[index].lang === "he" ||
      stagesData.bookinglist[index].guestCountry === "il" ||
      stagesData.bookinglist[index].guestCountry === "IL" ||
      stagesData.bookinglist[index].guestCountry2 === "IL" ||
      stagesData.bookinglist[index].guestCountry2 === "il"
        ? true
        : false;
    isGroup =
      stagesData.bookinglist[index].group !== undefined ||
      stagesData.bookinglist[index].masterId !== ""
        ? true
        : false;
    console.log("isIsraeli", isIsraeli, isGroup);
    if (isIsraeli && !isGroup) {
      const Answer = await bed24Func.getAnswer(
        message,
        sender,
        Stage,
        PriceMAAM,
        BookingList,
        Place,
        BookId,
        FirstName + " " + LastName,
        isBookingSite
      );
      res.send(Answer);
    }
  } else {
    console.log("msg from not in stages file");
    // const Ans = {
    //   replies: [
    //     {
    //       message: "שלום, אנו שמחים שפניתם אלינו, נתפנה לתת שירות בהקדם",
    //     },
    //   ],
    // };
    // res.send(Ans);
  }
});

app.get("*", (req, res) => {
  console.log(req.body);
  res.send("non rout");
  //   res.sendFile(path.join(__dirname + "/Client/build/index.html"));
});

server.listen(port, () => {
  console.log("Example app listening on port " + port);
});
