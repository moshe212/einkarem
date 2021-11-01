const getDrinkPriceTotal = async (ReciveMsg) => {
  let drinkPriceTotal = 0;
  if (parseInt(ReciveMsg) == 1) {
    drinkPriceTotal = 100;
  } else if (parseInt(ReciveMsg) == 2) {
    drinkPriceTotal = 25;
  } else if (parseInt(ReciveMsg) == 3) {
    drinkPriceTotal = 12;
  } else {
    const arrRec = ReciveMsg.split(",");
    console.log("arrRec", arrRec);

    let drinkPrice = 0;
    for (let i = 0; i < arrRec.length; i++) {
      const drinkNum = arrRec[i].split(" ")[1];
      const drinkCount = arrRec[i].split(" ")[3];
      console.log("drinkNum", drinkNum, drinkCount);
      let pricePerOne = 0;
      switch (parseInt(drinkNum)) {
        case 1:
          pricePerOne = 100;
          break;
        case 2:
          pricePerOne = 25;
          break;
        case 3:
          pricePerOne = 12;
          break;
      }
      drinkPrice = pricePerOne * drinkCount;
      drinkPriceTotal = parseInt(drinkPriceTotal + drinkPrice);
    }
  }

  return drinkPriceTotal;
};

module.exports = { getDrinkPriceTotal };
