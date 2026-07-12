const { createMarketCard } = require("./createMarketCardService");
const { getMarketCards } = require("./getMarketCardsService");
const { getMarketCardById } = require("./getMarketCardByIdService");
const { updateMarketCard } = require("./updateMarketCardService");
const { deleteMarketCard } = require("./deleteMarketCardService");

module.exports = {
  createMarketCard,
  getMarketCards,
  getMarketCardById,
  updateMarketCard,
  deleteMarketCard,
};