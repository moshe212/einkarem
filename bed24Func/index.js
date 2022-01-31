const { getBooking } = require("./getBooking");
const { getDeparture } = require("./getDeparture");
const { getArrival } = require("./getArrival");
const { createStageFile } = require("./createStageFile");
const { updateStageFile } = require("./updateStageFile");
const { getAnswer } = require("./getAnswer");
const { getDrinkPriceTotal } = require("./getDrinkPriceTotal");
const { getPayLink } = require("./getPayLink");
const { reConnection } = require("./reConnection");

const bed24Func = {
  getBooking,
  getDeparture,
  getArrival,
  createStageFile,
  updateStageFile,
  getAnswer,
  getDrinkPriceTotal,
  getPayLink,
  reConnection,
};

module.exports = { bed24Func };
