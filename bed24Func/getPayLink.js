const axios = require("axios");
const moment = require("moment");

const getPayLink = async (
  pageCode,
  userId,
  sum,
  successUrl,
  cancelUrl,
  description,
  phone,
  bookId,
  place,
  fullName
) => {
  const propKey =
    place === "115824"
      ? process.env.propKey2
      : place === "123250"
      ? process.env.propKey1
      : "";
  const apiKey = process.env.apiKey;
  const Today = moment()
    // .add(1, "days")
    .format("YYYY-MM-DD")
    .replace("-", "")
    .replace("-", "");
  console.log("Today", Today);
  let Items = [];
  await axios
    .get("https://api.beds24.com/json/getBookings", {
      data: {
        authentication: {
          apiKey: apiKey,
          propKey: propKey,
        },
        departureFrom: Today,
        departureTo: Today,
        bookId: bookId,
        includeInvoice: true,
        status: 1,
      },
    })
    .then(function (res) {
      for (let r = 0; r < res.data[0].invoice.length; r++) {
        const itemPrice = parseInt(res.data[0].invoice[r].price);
        const itemQty = parseInt(res.data[0].invoice[r].qty);
        const itemDesc = res.data[0].invoice[r].description;
        const item = {
          itemPrice: itemPrice,
          itemQty: itemQty,
          itemDesc: itemDesc,
        };
        Items.push(item);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  let itemsStr = "";
  for (let t = 0; Items.length > t; t++) {
    itemsStr =
      itemsStr +
      `&productData[${t}][price]=${
        Items.length > 0 ? Items[t].itemPrice : ""
      }&productData[${t}][quantity]=${
        Items.length > 0 ? Items[t].itemQty : ""
      }&productData[${t}][itemDescription]=${
        Items.length > 0 ? Items[t].itemDesc : ""
      }`;
  }
  let PayUrl = "";
  console.log("items", Items);
  const data =
    `pageCode=${pageCode}&userId=${userId}&apiKey=&sum=${sum}&successUrl=${successUrl}&cancelUrl=${cancelUrl}&description=${description}&paymentNum=&maxPaymentNum=1&pageField[fullName]=${encodeURIComponent(
      fullName
    )}&pageField[phone]=${phone}` +
    itemsStr +
    `&cField1=${bookId}&cField2=${place}`;
  console.log("data", data);
  const paymentUrl =
    "https://secure.meshulam.co.il/api/light/server/1.0/createPaymentProcess";

  await axios({
    method: "post",
    url: paymentUrl,
    data: data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then(function (response) {
    console.log("Status:", response.statusCode);
    console.log("Headers:", JSON.stringify(response.headers));
    console.log("Response:", response.data);
    PayUrl = response.statusCode === 1 ? response.data.data.url : "0";

    return [PayUrl, response.data.err.message];
  });
};

module.exports = { getPayLink };
