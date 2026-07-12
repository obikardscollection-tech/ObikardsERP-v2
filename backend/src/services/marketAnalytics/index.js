const { createMarketAnalytics } = require("./createMarketAnalyticsService");
const { getMarketAnalytics } = require("./getMarketAnalyticsService");
const { getMarketAnalyticsById } = require("./getMarketAnalyticsByIdService");
const { updateMarketAnalytics } = require("./updateMarketAnalyticsService");
const { deleteMarketAnalytics } = require("./deleteMarketAnalyticsService");

module.exports = {
  createMarketAnalytics,
  getMarketAnalytics,
  getMarketAnalyticsById,
  updateMarketAnalytics,
  deleteMarketAnalytics,
};
