const axios = require("axios");
var request = require("request");

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
  let PayUrl = "";
  const url = `https://sandbox.meshulam.co.il/api/light/server/1.0/createPaymentProcess/?pageCode=${pageCode}&userId=${userId}&apiKey=&sum=${sum}&successUrl=${successUrl}&cancelUrl=${cancelUrl}&description=${description}&paymentNum=&maxPaymentNum=1&pageField[fullName]=${fullName}&pageField[phone]=${phone}&cField1=${bookId}&cField2=${place}`;
  console.log("url", url);
  request(
    {
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "application/json",
      },
    },
    function (error, response, body) {
      if (error) {
        return console.error(error);
      }
      console.log("Status:", response.statusCode);
      //   console.log("Headers:", JSON.stringify(response.headers));
      console.log("Response:", body);
      console.log("Response:", body.data.data.url);
      PayUrl = body.data.data.url;
      return PayUrl;
    }
  );
  //   await axios({
  //     method: "post",
  //     url: url,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   }).then(function (response) {
  //     console.log("Status:", response.statusCode);
  //     console.log("Headers:", JSON.stringify(response.headers));
  //     console.log("Response:", response.data.data.url);
  //     PayUrl = response.data.data.url;
  //   });
  //   return PayUrl;
};

module.exports = { getPayLink };
