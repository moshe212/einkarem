const fs = require("fs");
// Require `PhoneNumberFormat`.
const PNF = require("google-libphonenumber").PhoneNumberFormat;

// Get an instance of `PhoneNumberUtil`.
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

const updateStageFile = async (
  BookingList,
  isAnswer,
  Stage,
  PhoneSend,
  Payment
) => {
  let stagesData = { bookinglist: [] };
  const STAGES_FILE_PATH = "../stages.json";

  console.log("BookingListParam", BookingList, BookingList.length);

  const data = fs.readFileSync("stages.json", {
    encoding: "utf8",
    flag: "r",
  });
  stagesData = await JSON.parse(data);
  for (let b = 0; b < BookingList.length; b++) {
    let Phone = "";
    let Mobile = "";
    const number =
      BookingList[b].guestMobile.length > 0
        ? phoneUtil.parseAndKeepRawInput(BookingList[b].guestMobile, "IL")
        : BookingList[b].guestPhone.length > 0
        ? phoneUtil.parseAndKeepRawInput(BookingList[b].guestPhone, "IL")
        : 0;
    if (number != 0) {
      console.log(b, phoneUtil.format(number, PNF.E164));
      Phone = phoneUtil.format(number, PNF.E164).replace("+", "") + "@c.us";
      Mobile = phoneUtil.format(number, PNF.E164).replace("+", "") + "@c.us";
    } else {
      console.log("number is not define");
    }

    const Number = Mobile.length > 5 ? Mobile : Phone.length > 0 ? Phone : "";
    const found = stagesData.bookinglist.some((el) => el.phone === Number);
    if (!found) {
      stagesData.bookinglist.push({
        phone: Number,
        stage: 0,
        price: BookingList[b].price,
        propId: BookingList[b].propId,
        referer: BookingList[b].referer,
        lang: BookingList[b].lang,
        guestCountry: BookingList[b].guestCountry,
        guestCountry2: BookingList[b].guestCountry2,
        group: BookingList[b].group,
        masterId: BookingList[b].masterId,
        bookId: BookingList[b].bookId,
        guestFirstName: BookingList[b].guestFirstName,
        guestLastName: BookingList[b].guestName,
      }); //add some data
    } else if (isAnswer) {
      const index = stagesData.bookinglist.findIndex(
        (x) => x.phone === PhoneSend
      );
      stagesData.bookinglist[index].stage = parseInt(Stage);
      console.log("Payment", Payment);
      if (Payment) {
        stagesData.bookinglist[index].price = parseInt(Payment);
      }
    }
  }
  fs.writeFile("stages.json", JSON.stringify(stagesData), "utf8", (err) => {
    console.log("stagesData", stagesData);
    if (err) {
      console.error(err);
    }
  }); // write it back
};

module.exports = { updateStageFile };
