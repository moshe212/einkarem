const axios = require("axios");
const moment = require("moment");

const getBooking = async (Arrival) => {
  const apiKey = process.env.apiKey;
  const propKeys = [process.env.propKey1, process.env.propKey2];
  const Before4Day = moment()
    .add(-4, "days")
    .format("YYYY-MM-DD")
    .replace("-", "")
    .replace("-", "");
  const Today = moment()
    // .add(1, "days")
    .format("YYYY-MM-DD")
    .replace("-", "")
    .replace("-", "");
  console.log("Today", Today);
  let Bookings = [];
  for (let i = 0; i < propKeys.length; i++) {
    await axios
      .get("https://api.beds24.com/json/getBookings", {
        data: {
          authentication: {
            apiKey: apiKey,
            propKey: propKeys[i],
          },
          ...(Arrival ? { arrivalFrom: Today } : { departureFrom: Today }),
          ...(Arrival ? { arrivalTo: Today } : { departureTo: Today }),
          ...(!Arrival ? { arrivalFrom: Before4Day } : ""),
          includeInvoice: true,
          // status: [1, 2],
        },
      })
      .then(function (res) {
        // console.log("res", res.data);
        const filterdData = res.data.filter(
          (book) =>
            (book.guestMobile.length > 0 || book.guestPhone.length > 0) &&
            (book.status === "1" || book.status === "2")
        );
        // console.log("filterdData", filterdData);
        for (let b = 0; b < filterdData.length; b++) {
          // console.log('inv', res.data[r].invoice)
          let totalPrice = 0;
          for (let r = 0; r < filterdData[b].invoice.length; r++) {
            const itemPrice =
              parseInt(filterdData[b].invoice[r].price) *
              parseInt(filterdData[b].invoice[r].qty);
            totalPrice = parseInt(totalPrice) + itemPrice;
          }
          // console.log("totalPrice1", totalPrice);
          Bookings.push({
            firstNight: filterdData[b].firstNight,
            lastNight: filterdData[b].lastNight,
            numAdult: filterdData[b].numAdult,
            numChild: filterdData[b].numChild,
            guestFirstName: filterdData[b].guestFirstName,
            guestName: filterdData[b].guestName,
            guestEmail: filterdData[b].guestEmail,
            guestMobile: filterdData[b].guestMobile,
            guestPhone: filterdData[b].guestPhone,
            bookId: filterdData[b].bookId,
            roomId: filterdData[b].roomId,
            price: totalPrice,
            propId: filterdData[b].propId,
            referer: filterdData[b].referer,
            lang: filterdData[b].lang,
            guestCountry: filterdData[b].guestCountry,
            guestCountry2: filterdData[b].guestCountry2,
            group: filterdData[b].group,
            masterId: filterdData[b].masterId,
          });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  return Bookings;
};

module.exports = { getBooking };
