const axios = require("axios");
const moment = require("moment");

const getBooking = async (Arrival) => {
  const apiKey = process.env.apiKey;
  const propKeys = [process.env.propKey1, process.env.propKey2];
  const Today = moment()
    // .add(1, "days")
    .format("YYYY-MM-DD")
    .replace("-", "")
    .replace("-", "");

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
          Bookings.push({
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
            price: res.data[b].price,
            propId: res.data[b].propId,
            referer: res.data[b].referer,
            lang: res.data[b].lang,
            guestCountry: res.data[b].guestCountry,
            guestCountry2: res.data[b].guestCountry2,
            group: res.data[b].group,
            masterId: res.data[b].masterId,
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
