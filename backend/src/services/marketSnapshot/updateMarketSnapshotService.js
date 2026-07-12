const prisma = require("../../lib/prisma");

async function updateMarketSnapshot(id, data) {
  const snapshot = await prisma.marketSnapshot.findUnique({
    where: {
      id,
    },
  });

  if (!snapshot) {
    throw new Error("MarketSnapshot introuvable.");
  }

  const updatedSnapshot = await prisma.marketSnapshot.update({
    where: {
      id,
    },
    data: {
      marketProviderCardId: data.marketProviderCardId,

      currency: data.currency,

      rawPrice: data.rawPrice,

      psa8Price: data.psa8Price,
      psa9Price: data.psa9Price,
      psa10Price: data.psa10Price,

      bgs10Price: data.bgs10Price,
      cgc10Price: data.cgc10Price,
      sgc10Price: data.sgc10Price,

      retailBuy: data.retailBuy,
      retailSell: data.retailSell,

      salesVolume: data.salesVolume,

      lastSalePrice: data.lastSalePrice,
      lastSaleDate: data.lastSaleDate,

      population: data.population,

      providerUpdatedAt: data.providerUpdatedAt,

      synchronizedAt: data.synchronizedAt,
    },
  });

  return updatedSnapshot;
}

module.exports = {
  updateMarketSnapshot,
};
