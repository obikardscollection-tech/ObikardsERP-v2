const prisma = require("../../lib/prisma");

async function updateMarketAnalytics(id, data) {
  const analytics = await prisma.marketAnalytics.findUnique({
    where: {
      id,
    },
  });

  if (!analytics) {
    throw new Error("MarketAnalytics introuvable.");
  }

  const updatedAnalytics = await prisma.marketAnalytics.update({
    where: {
      id,
    },
    data: {
      marketCardId: data.marketCardId,

      averagePrice: data.averagePrice,
      medianPrice: data.medianPrice,

      minPrice: data.minPrice,
      maxPrice: data.maxPrice,

      volatility: data.volatility,

      liquidity: data.liquidity,

      confidenceScore: data.confidenceScore,
      trendScore: data.trendScore,
      marketScore: data.marketScore,

      growth7d: data.growth7d,
      growth30d: data.growth30d,
      growth90d: data.growth90d,
      growth1y: data.growth1y,

      recommendedBuyPrice: data.recommendedBuyPrice,
      recommendedSellPrice: data.recommendedSellPrice,
    },
  });

  return updatedAnalytics;
}

module.exports = {
  updateMarketAnalytics,
};
