const { Client } = require("whatsapp-web.js");
const fs = require("fs");
const { getBooking } = require("./getBooking");
// Require `PhoneNumberFormat`.
const PNF = require("google-libphonenumber").PhoneNumberFormat;

// Get an instance of `PhoneNumberUtil`.
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();

const getArrival = async () => {
  // Path where the session data will be stored
  const SESSION_FILE_PATH = "../session.json";
  console.log(SESSION_FILE_PATH);
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
  });
  client.on("ready", () => {
    console.log("Client is ready2!");
  });
  await client.initialize();
  const BookingList = await getBooking(true);
  console.log(BookingList);
  for (let i = 0; i < BookingList.length; i++) {
    const number =
      BookingList[i].guestMobile.length > 0
        ? phoneUtil.parseAndKeepRawInput(BookingList[i].guestMobile, "IL")
        : phoneUtil.parseAndKeepRawInput(BookingList[i].guestPhone, "IL");
    console.log(i, phoneUtil.format(number, PNF.E164));
    const Phone = phoneUtil.format(number, PNF.E164).replace("+", "") + "@c.us";
    const Mobile =
      phoneUtil.format(number, PNF.E164).replace("+", "") + "@c.us";

    const Number = Mobile.length > 5 ? Mobile : Phone;

    const isIsraeli =
      BookingList[i].lang === "HE" ||
      BookingList[i].lang === "he" ||
      BookingList[i].guestCountry === "il" ||
      BookingList[i].guestCountry === "IL" ||
      BookingList[i].guestCountry2 === "IL" ||
      BookingList[i].guestCountry2 === "il"
        ? true
        : false;
    const isMaster =
      BookingList[i].masterId === BookingList[i].bookId ||
      (BookingList[i].group === undefined && BookingList[i].masterId === "")
        ? true
        : false;
    let Text1 = "";
    let Text2 = "";

    if (isIsraeli && isMaster) {
      Text1 =
        BookingList[i].propId === "123250"
          ? "שלום " +
            "*" +
            BookingList[i].guestFirstName +
            "*" +
            "\n" +
            "\nאנחנו מצפים לקבל את פניכם בעין כרם היום." +
            "\nרצינו להזכיר כי הבית יהיה מוכן עבורכם החל מהשעה 15:00" +
            "\nסימטאות עין כרם הן מקום קשה לניווט ולכן אנו מבקשים מכם לקרוא בקפידה את הוראות ההגעה ולהיות סבלניים עם הגיעכם." +
            "\nאנו מבטיחים כי לאחר שתגיעו לבית בפעם הראשונה, תמצאו אותו בקלות בהמשך." +
            "\nלהגעה אלינו הזינו בוויז: *מדרגות הכפר 16, י-ם.*" +
            "\nם הגיעכם לנקודה, תראו מימין לשער החניה הלבן את סמטת מדרגות הכפר בה נמצא הבית." +
            "\nבשל מצוקת חניה והתחשבות בתושבי המקום, החנו בבקשה את רכבכם כ-30 מטר לאחור ברחוב שאול ברקלי ליד בית מס' 3." +
            "\n" +
            "\nלהגעה אל הבית רדו בסמטת מדרגות הכפר כ-70 מטרים עד לדלת עץ אלון גדולה שתהיה משמאלכם. מוזמנים לצלצל בפעמון שבקודן. (מימינכם תראו ויטרינת זכוכית ירוקה- אל תעברו אותה)." +
            "\nלרווחת שכנינו ולשמירה על השקט בסמטה, נודה לכם, במידת האפשר, על הרמת מזוודות ביד בגרם המדרגות שלפני הבית. תודה!" +
            "\nבמידה ולא מצאתם אותנו, אנא התקשרו אלינו  על מנת שנוכל להכווין אתכם בקלות לבית." +
            "\n" +
            "\nניתן להגיע עם הרכב לשביל הגישה לבית על מנת לפרוק את המטען ולאפשר גישה לאורחים המתקשים בהליכה." +
            "\nאנו מבקשים להקפיד על הכללים הללו, בכל שעות היום, לרווחת תושבי המקום ועל מנת למנוע מכם קנסות חניה מיותרים." +
            "\nלשימושכם רשת האינטרנט בבית נקראת *KHAN WIFI* . הסיסמה להתחברות היא: *kek12345*."
          : BookingList[i].propId === "115824"
          ? "שלום " +
            "*" +
            BookingList[i].guestFirstName +
            "*" +
            "\n" +
            "\nאנחנו מצפים לקבל את פניכם בעין כרם היום." +
            "\nרצינו להזכיר כי הבית יהיה מוכן עבורכם החל מהשעה 15:00" +
            "\nלהגעה אלינו הזינו בוויז: עין כרם 4, י-ם." +
            "\nעם הגיעכם לעין כרם, צרו איתנו קשר על מנת להכווין אתכם בקלות לבית (לא קל למצוא אותנו בסמטאות עין כרם..)" +
            "\nאנו זמינים ב-0526817788 או ב-0504593125 (גם וואטסאפ)" +
            "\nניתן להתכתב איתנו בוואטסאפ בלבד גם במספר 0555647508"
          : "";

      Text2 =
        BookingList[i].propId === "123250"
          ? "אנו זמינים ב-0526817788 או ב-0504593125 (גם וואטסאפ)" +
            "\nניתן להתכתב איתנו בוואטסאפ בלבד גם במספר 0555647508" +
            "\nנודה לכם באם תוכלו לעדכן אותנו בשעת הגעתכם המשוערת על מנת שנוכל להכין את החדר ולקבל את פניכם עם הגיעכם. להתראות בקרוב." +
            "\n" +
            "\nצוות ח'אן עין כרם"
          : BookingList[i].propId === "115824"
          ? "*לתשומת ליבכם* הססמה לרשת ה-WIFI בבית (Haken Wireless) היא: *0526817788*" +
            "\nנודה לכם באם תוכלו לעדכן אותנו בשעת הגעתכם המשוערת על מנת שנוכל להכין את החדר ולקבל את פניכם עם הגיעכם. להתראות בקרוב." +
            "\n" +
            "\nתומר & רועי"
          : "";

      console.log(Number);
      await client.sendMessage("972523587990@c.us", Text1);
      await client.sendMessage("972523587990@c.us", Text2);
    } else if (isMaster) {
      Text1 =
        BookingList[i].propId === "123250"
          ? "Good morning " +
            BookingList[i].guestFirstName +
            "\nWe are looking forward to welcoming you to Jerusalem today." +
            "\nCheck-in time is 15:00" +
            "\nPlease note that the alleys of Ein Karem are not an easy place to navigate, so please be patient, and read the directions carefully:" +
            "\nIn case you are using a navigation app. on your way to us, please write:16 Madregot Hakfar st., Jerusalem." +
            "\nWhen there, you will see a small alley on your right hand side- Madregot Hakfar st. The Hotel is down that alley." +
            "\nIt is not possible to park your car in the parking bay used by the villagers." +
            "\nDue to the parking shortage around the house, we ask our guests to park their car, 30 meters backwords, on Shaul Berkeley St., next to house No. 3." +
            "\nYou can come with your vehicle to the access path of the house in order to unload the luggage and allow access for guests who have difficulty walking." +
            "\n" +
            "\nWhen parked, walk down the alley, about 70 meters, until you reach an Oak tree door on your left hand side. (On your right hand side you will se a green glass construction- don't pass it)." +
            "\nPlease ring the coder and we will open the door for you." +
            "\nWe want to adhere to these rules for the well-being of the locals." +
            "\nThe WIFI network in the house is called KHAN WIFI. The password is *kek12345*."
          : BookingList[i].propId === "115824"
          ? "Good morning " +
            BookingList[i].guestFirstName +
            "\nCheck-in time is 15:00" +
            "\nIn case you are using a navigation app. on your way to us, please write: 4 Ein Karem Rd., Jerusalem." +
            "\nPlease contact us upon your arrival to Ein Karem so that we can easily direct you to the house. (It is not easy to navigate here...)."
          : "";

      Text2 =
        BookingList[i].propId === "123250"
          ? "We are available for assistance at +972-52-681-7788 or +972-50-459-3125 (also whats app)." +
            "\nWe are available to chat only at +972-55-564-7508." +
            "\n" +
            "\nPlease inform us about your estimated time of arrival so that we can be here to welcome you when you arrive." +
            "\n" +
            "\nThanks!" +
            "\nSee you soon," +
            "\nKhan Ein Karem team"
          : BookingList[i].propId === "115824"
          ? "\nWe are on *+972-52-681-7788* or *+972-50-459-3125* (also whats app)" +
            "\nWe are available for chat only at +972-55-564-7508." +
            "\nFyi, the password for the WIFI network in the house (Haken wireless) is: *0526817788*." +
            "\n" +
            "\nPlease inform us about your estimated time of arrival so that we can be here to welcome you when you arrive." +
            "\n" +
            "\nThanks!" +
            "\n" +
            "\nSee you soon," +
            "\n" +
            "\nRoy & Tomer"
          : "";

      console.log(Number);
      await client.sendMessage("972523587990@c.us", Text1);
      await client.sendMessage("972523587990@c.us", Text2);
    }
  }
};

module.exports = { getArrival };
