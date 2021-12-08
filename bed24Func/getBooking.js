const axios = require("axios");
const moment = require("moment");

const getBooking = async (Arrival) => {
  const apiKey = process.env.apiKey;
  const propKeys = [process.env.propKey1, process.env.propKey2];
  const Today = moment()
    .add(2, "days")
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
        },
      })
      .then(function (res) {
        // console.log("res", res.data);
        for (let b = 0; b < res.data.length; b++) {
          let totalPrice = 0;
          axios
            .get("https://api.beds24.com/json/getInvoices", {
              data: {
                authentication: {
                  apiKey: apiKey,
                  propKey: propKeys[i],
                },
                bookId: res.data[b].bookId,
              },
            })
            .then(function (Invoice_res) {
              console.log("Invoice_res", Invoice_res.data);
              console.log("totalPrice", totalPrice);
              for (let v = 0; v < Invoice_res.data[0].length; v++) {
                const itemPrice =
                  parseInt(Invoice_res.data[0][v].price) *
                  parseInt(Invoice_res.data[0][v].qty);
                totalPrice = parseInt(totalPrice) + itemPrice;
              }
              console.log("totalPrice1", totalPrice);
              Bookings.push({
                price: totalPrice,
                firstNight: res.data[b].firstNight,
                lastNight: res.data[b].lastNight,
                numAdult: res.data[b].numAdult,
                numChild: res.data[b].numChild,
                guestFirstName: res.data[b].guestFirstName,
                guestName: res.data[b].guestName,
                guestEmail: res.data[b].guestEmail,
                guestMobile: res.data[b].guestMobile,
                guestPhone: res.data[b].guestPhone,
                bookId: res.data[b].bookId,
                roomId: res.data[b].roomId,

                propId: res.data[b].propId,
                referer: res.data[b].referer,
                lang: res.data[b].lang,
                guestCountry: res.data[b].guestCountry,
                guestCountry2: res.data[b].guestCountry2,
                group: res.data[b].group,
                masterId: res.data[b].masterId,
              });
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
