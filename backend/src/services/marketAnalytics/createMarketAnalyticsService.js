const prisma = require("../../lib/prisma");

async function createMarketAnalytics(data) {
  const analytics = await prisma.marketAnalytics.create({
    data: {
      marketCardId: data.marketCardId,

      averagePrice: data.averagePrice ?? null,
      medianPrice: data.medianPrice ?? null,

      minPrice: data.minPrice ?? null,
      maxPrice: data.maxPrice ?? null,

      volatility: data.volatility ?? null,

      liquidity: data.liquidity ?? null,

      confidenceScore: data.confidenceScore ?? null,
      trendScore: data.trendScore ?? null,
      marketScore: data.marketScore ?? null,

      growth7d: data.growth7d ?? null,
      growth30d: data.growth30d ?? null,
      growth90d: data.growth90d ?? null,
      growth1y: data.growth1y ?? null,

      recommendedBuyPrice: data.recommendedBuyPrice ?? null,
      recommendedSellPrice: data.recommendedSellPrice ?? null,
    },
  });

  return analytics;
}

module.exports = {
  createMarketAnalytics,
};
