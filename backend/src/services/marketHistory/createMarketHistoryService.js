const prisma = require("../../lib/prisma");

async function createMarketHistory(data) {
  const history = await prisma.marketHistory.create({
    data: {
      marketProviderCardId: data.marketProviderCardId,

      currency: data.currency ?? "USD",

      rawPrice: data.rawPrice ?? null,

      psa8Price: data.psa8Price ?? null,
      psa9Price: data.psa9Price ?? null,
      psa10Price: data.psa10Price ?? null,

      bgs10Price: data.bgs10Price ?? null,
      cgc10Price: data.cgc10Price ?? null,
      sgc10Price: data.sgc10Price ?? null,

      retailBuy: data.retailBuy ?? null,
      retailSell: data.retailSell ?? null,

      salesVolume: data.salesVolume ?? null,

      lastSalePrice: data.lastSalePrice ?? null,
      lastSaleDate: data.lastSaleDate ?? null,

      population: data.population ?? null,

      providerUpdatedAt: data.providerUpdatedAt ?? null,

      synchronizedAt: data.synchronizedAt,
    },
  });

  return history;
}

module.exports = {
  createMarketHistory,
};
