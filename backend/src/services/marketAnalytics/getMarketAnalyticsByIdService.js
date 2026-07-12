const prisma = require("../../lib/prisma");

async function getMarketAnalyticsById(id) {
  const analytics = await prisma.marketAnalytics.findUnique({
    where: {
      id,
    },
  });

  if (!analytics) {
    throw new Error("MarketAnalytics introuvable.");
  }

  return analytics;
}

module.exports = {
  getMarketAnalyticsById,
};
