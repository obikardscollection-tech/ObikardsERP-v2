const { createMarketProviderCard } = require("./createMarketProviderCardService");
const { getMarketProviderCards } = require("./getMarketProviderCardsService");
const { getMarketProviderCardById } = require("./getMarketProviderCardByIdService");
const { updateMarketProviderCard } = require("./updateMarketProviderCardService");
const { deleteMarketProviderCard } = require("./deleteMarketProviderCardService");

module.exports = {
  createMarketProviderCard,
  getMarketProviderCards,
  getMarketProviderCardById,
  updateMarketProviderCard,
  deleteMarketProviderCard,
};