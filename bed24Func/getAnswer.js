const fs = require("fs");
const axios = require("axios");
const { updateStageFile } = require("./updateStageFile");
const { getDrinkPriceTotal } = require("./getDrinkPriceTotal");
const { getPayLink } = require("./getPayLink");

const getAnswer = async (
  ReciveMsg,
  Phone,
  Stage,
  Price,
  BookingList,
  Place,
  BookId,
  FullName
) => {
  let textMessage1 = "";
  let textMessage2 = "";
  let textMessage3 = "";
  let Answer = [];
  let StageForUpdate = 0;
  let Payment = 0;
  const tel = "0" + Phone.substring(3, 12);
  const pageCode =
    Place === "115824"
      ? process.env.pageCode1
      : Place === "123250"
      ? process.env.pageCode2
      : "";
  const userId =
    Place === "115824"
      ? process.env.userId1
      : Place === "123250"
      ? process.env.userId2
      : "";
  const successUrl = "";
  const cancelUrl = "";
  const PAYBOX_Link =
    Place === "115824"
      ? "https://payboxapp.page.link/L95Gy2Ti7uUsD7uw6"
      : Place === "123250"
      ? "https://payboxapp.page.link/BWy944VEMYgp6LWG9"
      : "";
  // let CreditCardLink = "";
  console.log("Place", Place);
  const BankDetails =
    Place === "115824"
      ? "ג'פסי אירוח בע'מ, בנק איגוד (13), סניף 51, חשבון 56620028"
      : Place === "123250"
      ? "מימזיס בע'מ, בנק איגוד (13), סניף 51, חשבון 57050040"
      : "";
  switch (Stage) {
    case 0:
      if (ReciveMsg == 1) {
        textMessage1 =
          "תודה. נא סמנו את המוצרים בהם השתמשתם:" +
          "\n1️⃣ בקבוק יין \n2️⃣ בירה/בריזר \n3️⃣ שתיה קלה/סודה";
        textMessage2 =
          "*שים לב* במידה והשתמשת ביותר מסוג שתיה אחד אנא השב בפורמט הבא לפי מזהה המשקה, לדוגמא עבור שלושה בקבוקי יין ושני בירה:" +
          "\nמשקה 2 כמות 3,משקה 2 כמות 2";
        textMessage3 =
          "במידה והשתמשת בכמה יחידות מאותו משקה בלבד אנא השב לפי הפורמט הבא לפי מזהה המשקה, לדוגמא עבור שלושה בקבוקי יין" +
          "\nמשקה 1 כמות 3";
        Answer.push(textMessage1, textMessage2, textMessage3);
        StageForUpdate = 2;
        await updateStageFile(BookingList, true, StageForUpdate, Phone);
        break;
      } else if (ReciveMsg == 2) {
        textMessage1 =
          "תודה רבה. הסכום לתשלום כולל מעמ הוא: " +
          "*" +
          Price +
          "*" +
          "\nאנחנו אף פעם לא גובים תשלום מראש. כרטיס האשראי שניתן בעת ביצוע ההזמנה ניתן לביטחון בלבד";
        textMessage2 =
          "כיצד תרצו להסדיר את השתלום:" +
          "\n1️⃣ תשלום במזומן \n2️⃣ תשלום בהעברה בנקאית \n3️⃣ תשלום בכרטיס אשראי \n4️⃣ תשלום באפליקציית PAYBOX";
        Answer.push(textMessage1, textMessage2);
        StageForUpdate = 1;
        await updateStageFile(BookingList, true, StageForUpdate, Phone);
        break;
      } else {
        textMessage1 = "נא בחר באחת מהאפשרויות המוצגות בשאלה.";
        Answer.push(textMessage1);
        break;
      }
    case 1:
      switch (parseInt(ReciveMsg)) {
        case 1:
          textMessage1 =
            "תודה רבה. נא צרו קשר עם הצוות להסדרת התשלום." +
            "\nנשמח לארת אתכם שוב, להתראות בעין כרם.";
          Answer.push(textMessage1);
          break;
        case 2:
          textMessage1 =
            "תודה רבה. פרטי חשבוננו להעברה בנקאית הם:" + "\n" + BankDetails;
          Answer.push(textMessage1);
          break;
        case 3:
          const CreditCardLink1 = await getPayLink(
            pageCode,
            userId,
            Price,
            successUrl,
            cancelUrl,
            "",
            tel,
            BookId,
            Place,
            FullName
          );
          console.log("CreditCardLink1", CreditCardLink1);
          textMessage1 =
            "תודה רבה. להלן לינק לדף תשלום מאובטח לצורך ביצוע התשלום בכרטיס אשראי.";
          textMessage2 = CreditCardLink1;
          Answer.push(textMessage1, textMessage2);
          break;
        case 4:
          textMessage1 =
            "תודה רבה. להלן קישור לביצוע התשלום באמצעות אפליקציית PAYBOX";
          textMessage2 = PAYBOX_Link;
          Answer.push(textMessage1, textMessage2);
          break;
        // case 5:
        //   textMessage1 =
        //     "תודה רבה. להלן קישור לביצוע התשלום באמצעות אפליקציית PAY";
        //   textMessage2 = "LINK";
        //   Answer.push(textMessage1, textMessage2);
        //   break;
        default:
          textMessage1 = "נא בחר באחת מהאפשרויות המוצגות בשאלה.";
          Answer.push(textMessage1);
      }
      if ([1, 2, 3, 4].includes(parseInt(ReciveMsg))) {
        StageForUpdate = 10;
        await updateStageFile(BookingList, true, StageForUpdate, Phone);
      }

      break;
    case 2:
      const DrinkPriceTotal = await getDrinkPriceTotal(ReciveMsg);
      Payment = parseFloat(Price) + parseFloat(DrinkPriceTotal);
      console.log("regex", ReciveMsg);
      const Regex1 = /^משקה [1-3] כמות [0-9]$/;
      const Regex2 = /^משקה [1-3] כמות [0-9],משקה [1-3] כמות [0-9]$/;
      if (
        Regex1.test(ReciveMsg) ||
        Regex2.test(ReciveMsg) ||
        [1, 2, 3].includes(parseInt(ReciveMsg))
      ) {
        textMessage1 =
          "תודה רבה. הסכום לתשלום כולל מעמ הוא: " +
          "*" +
          Payment +
          "ש'ח" +
          "*" +
          "\nאנחנו אף פעם לא גובים תשלום מראש. כרטיס האשראי שניתן בעת ביצוע ההזמנה ניתן לביטחון בלבד.";
        textMessage2 =
          "כיצד תרצו להסדיר את התשלום:" +
          "\n1️⃣ תשלום במזומן \n2️⃣ תשלום בהעברה בנקאית \n3️⃣ תשלום בכרטיס אשראי \n4️⃣ תשלום באפליקציית PAYBOX";
        Answer.push(textMessage1, textMessage2);
        StageForUpdate = 3;
        await updateStageFile(
          BookingList,
          true,
          StageForUpdate,
          Phone,
          Payment
        );

        // Add invoice item
        const apiKey = process.env.apiKey;
        const propKeys = [process.env.propKey1, process.env.propKey2];
        const bookid = BookId;
        console.log("Place", Place);
        console.log("BookId", bookid);
        console.log("DrinkPriceTotal", DrinkPriceTotal.toString());
        console.log("apiKey", apiKey);

        const propkey =
          Place === "123250"
            ? propKeys[1]
            : Place === "115824"
            ? propKeys[0]
            : "";
        console.log(propkey);
        await axios
          .get("https://api.beds24.com/json/setBooking", {
            data: {
              authentication: {
                apiKey: apiKey,
                propKey: propkey,
              },
              bookId: bookid,
              invoice: [
                {
                  description: "פרטי מיני בר",
                  status: "",
                  qty: "1",
                  price: DrinkPriceTotal,
                  vatRate: "17",
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
        break;
      } else {
        textMessage1 = "נא בחר באחת מהאפשרויות המוצגות בשאלה.";
        Answer.push(textMessage1);
        break;
      }

    case 3:
      switch (parseInt(ReciveMsg)) {
        case 1:
          textMessage1 =
            "תודה רבה. נא צרו קשר עם הצוות להסדרת התשלום." +
            "\nנשמח לארח אתכם שוב, להתראות בעין כרם.";
          Answer.push(textMessage1);
          break;
        case 2:
          textMessage1 =
            "תודה רבה. פרטי חשבוננו להעברה בנקאית הם:" + "\n" + BankDetails;
          Answer.push(textMessage1);
          break;
        case 3:
          const CreditCardLink2 = await getPayLink(
            pageCode,
            userId,
            Price,
            successUrl,
            cancelUrl,
            "",
            tel,
            BookId,
            Place,
            FullName
          );
          console.log("CreditCardLink2", CreditCardLink2);
          textMessage1 =
            "תודה רבה. להלן לינק לדף תשלום מאובטח לצורך ביצוע התשלום בכרטיס אשראי.";
          textMessage2 = CreditCardLink2;
          Answer.push(textMessage1, textMessage2);
          break;
        case 4:
          textMessage1 =
            "תודה רבה. להלן קישור לביצוע התשלום באמצעות אפליקציית PAYBOX";
          textMessage2 = PAYBOX_Link;
          Answer.push(textMessage1, textMessage2);
          break;
        // case 5:
        //   textMessage1 =
        //     "תודה רבה. להלן קישור לביצוע התשלום באמצעות אפליקציית PAY";
        //   textMessage2 = "LINK";
        //   Answer.push(textMessage1, textMessage2);
        //   break;
        default:
          textMessage1 = "נא בחר באחת מהאפשרויות המוצגות בשאלה.";
          Answer.push(textMessage1);
      }
      if ([1, 2, 3, 4].includes(parseInt(ReciveMsg))) {
        StageForUpdate = 11;
        await updateStageFile(BookingList, true, StageForUpdate, Phone);
      }

      break;

    default:
      console.log(`Sorry, we are out of range.`);
  }
  return Answer;
};

module.exports = { getAnswer };
