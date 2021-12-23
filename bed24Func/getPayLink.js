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
  const url = `https://secure.meshulam.co.il/api/light/server/1.0/createPaymentProcess/?pageCode=${pageCode}&userId=${userId}
  &apiKey=&sum=${sum}&successUrl=${successUrl}&cancelUrl=${cancelUrl}&description=${description}&paymentNum=&maxPaymentNum=1
  &pageField[fullName]=${encodeURIComponent(
    fullName
  )}&pageField[phone]=${phone}&cField1=${bookId}&cField2=${place}`;
  console.log("url", url);

  const paymentUrl =
    "https://secure.meshulam.co.il/api/light/server/1.0/createPaymentProcess";
  const formData = {
    pageCode: pageCode,
    userId: userId,
    sum: sum,
    successUrl: successUrl,
    cancelUrl: cancelUrl,
    description: "Description",
    phone: phone,
    cField1: bookId,
    cField2: place,
    fullName: encodeURIComponent(fullName),
  };

  await axios({
    method: "post",
    url: paymentUrl,
    data: `pageCode=${pageCode}&userId=${userId}&apiKey=&sum=${sum}&successUrl=${successUrl}&cancelUrl=${cancelUrl}&description=${description}&paymentNum=&maxPaymentNum=1&pageField[fullName]=${encodeURIComponent(
      fullName
    )}&pageField[phone]=${phone}&cField1=${bookId}&cField2=${place}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then(function (response) {
    console.log("Status:", response.statusCode);
    console.log("Headers:", JSON.stringify(response.headers));
    console.log("Response:", response.data);
    PayUrl = response.data.data.url;
  });
  return PayUrl;
};

module.exports = { getPayLink };
