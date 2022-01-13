const { Client } = require("whatsapp-web.js");
const fs = require("fs");
const { getBooking } = require("./getBooking");
const { createStageFile } = require("./createStageFile");
const { updateStageFile } = require("./updateStageFile");
const { getAnswer } = require("./getAnswer");
const moment = require("moment");
// Require `PhoneNumberFormat`.
const PNF = require("google-libphonenumber").PhoneNumberFormat;

// Get an instance of `PhoneNumberUtil`.
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

const getDeparture = async () => {
  // Path where the session data will be stored
  const SESSION_FILE_PATH = "../session.json";
  console.log(SESSION_FILE_PATH);
  const BookingList = await getBooking(false);
  const day = moment().day();
  console.log("day", day);
  console.log(BookingList);
  let isIsraeli;
  let isGroup;
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

  client.on("message", async (msg) => {
    let stagesData;
    const data = fs.readFileSync("stages.json", {
      encoding: "utf8",
      flag: "r",
    });
    stagesData = await JSON.parse(data);

    console.log("msgFrom", msg.from);
    console.log("stagesData", stagesData.bookinglist);
    const index = await stagesData.bookinglist.findIndex(
      (x) => x.phone === msg.from
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
        const Answer = await getAnswer(
          msg.body,
          msg.from,
          Stage,
          PriceMAAM,
          BookingList,
          Place,
          BookId,
          FirstName + " " + LastName
        );
        for (let i = 0; i < Answer.length; i++) {
          await client.sendMessage(msg.from, Answer[i]);
        }
      }
    } else {
      console.log("msg from not in stages file");
    }

    // await updateStageFile(BookingList, true, Stage, msg.from);
  });

  client.on("ready", () => {
    console.log("Client is ready2!");
  });
  await client.initialize();

  // if (fs.existsSync("stages.json")) {
  //   console.log("stages exist");
  //   fs.unlinkSync("../stages.json"),
  //     async function (err) {
  //       if (err) throw err;
  //       console.log("File deleted!");
  //       await createStageFile(BookingList);
  //     };
  //   // await updateStageFile(BookingList, false);
  // } else {
  //   console.log("stages not exist");
  //   await createStageFile(BookingList);
  // }

  try {
    fs.unlinkSync("stages.json");
    //file removed
    console.log("File deleted!");
  } catch (err) {
    console.error(err);
  }
  await createStageFile(BookingList);

  for (let i = 0; i < BookingList.length; i++) {
    isIsraeli =
      BookingList[i].lang === "HE" ||
      BookingList[i].lang === "he" ||
      BookingList[i].guestCountry === "il" ||
      BookingList[i].guestCountry === "IL" ||
      BookingList[i].guestCountry2 === "IL" ||
      BookingList[i].guestCountry2 === "il"
        ? true
        : false;
    isGroup =
      BookingList[i].group !== undefined || BookingList[i].masterId !== ""
        ? true
        : false;

    const number =
      BookingList[i].guestMobile.length > 0
        ? phoneUtil.parseAndKeepRawInput(BookingList[i].guestMobile, "IL")
        : phoneUtil.parseAndKeepRawInput(BookingList[i].guestPhone, "IL");
    console.log(i, phoneUtil.format(number, PNF.E164));
    const Phone = phoneUtil.format(number, PNF.E164).replace("+", "") + "@c.us";
    const Mobile =
      phoneUtil.format(number, PNF.E164).replace("+", "") + "@c.us";

    const Number = Mobile.length > 5 ? Mobile : Phone;
    const textMessage1 =
      "שלום " +
      BookingList[i].guestFirstName +
      ", שמחנו לארח אתכם. אנחנו מקווים שנהניתם ורוצים להזכיר ששעת היציאה מהחדרים היא *12:00* (אלא אם כן צוין אחרת בהזמנה)." +
      "\nעל מנת להקל עליכם את תהליך היציאה מהחדרים, אתם מוזמנים לבצע אותו בקלות כעת באמצעות הוואטסאפ.";
    const textMessage2 = "האם השתמשת במיני בר שבחדר?" + "\n1️⃣ כן \n2️⃣ לא";
    console.log("Number", Number, isIsraeli, isGroup);
    if (
      isIsraeli &&
      !isGroup &&
      ((parseInt(day) == 6 && Place == "115824") || parseInt(day) != 6)
    ) {
      // && Number == "972523587990@c.us"
      console.log("Send");
      await client.sendMessage(Number, textMessage1);
      await client.sendMessage(Number, textMessage2);
    }
  }
};

module.exports = { getDeparture };
