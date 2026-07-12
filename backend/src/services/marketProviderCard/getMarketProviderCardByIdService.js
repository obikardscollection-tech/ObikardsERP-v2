const prisma = require("../../lib/prisma");

async function getMarketProviderCardById(id) {
  const providerCard = await prisma.marketProviderCard.findUnique({
    where: {
      id,
    },
  });

  if (!providerCard) {
    throw new Error("MarketProviderCard introuvable.");
  }

  return providerCard;
}

module.exports = {
  getMarketProviderCardById,
};