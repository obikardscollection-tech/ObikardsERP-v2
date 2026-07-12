const { createMarketHistory } = require("./createMarketHistoryService");
const { getMarketHistory } = require("./getMarketHistoryService");
const { getMarketHistoryById } = require("./getMarketHistoryByIdService");
const { updateMarketHistory } = require("./updateMarketHistoryService");
const { deleteMarketHistory } = require("./deleteMarketHistoryService");

module.exports = {
  createMarketHistory,
  getMarketHistory,
  getMarketHistoryById,
  updateMarketHistory,
  deleteMarketHistory,
};
