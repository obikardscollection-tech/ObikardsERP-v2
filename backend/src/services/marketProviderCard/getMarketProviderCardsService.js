const prisma = require("../../lib/prisma");

async function getMarketProviderCards() {
  const providerCards = await prisma.marketProviderCard.findMany({
    orderBy: [
      {
        marketProviderId: "asc",
      },
      {
        providerCardId: "asc",
      },
    ],
  });

  return providerCards;
}

module.exports = {
  getMarketProviderCards,
};