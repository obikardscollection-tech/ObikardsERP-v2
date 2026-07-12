const prisma = require("../../lib/prisma");

async function updateMarketProviderCard(id, data) {
  const providerCard = await prisma.marketProviderCard.findUnique({
    where: {
      id,
    },
  });

  if (!providerCard) {
    throw new Error("MarketProviderCard introuvable.");
  }

  const updatedProviderCard = await prisma.marketProviderCard.update({
    where: {
      id,
    },
    data: {
      marketCardId: data.marketCardId,
      marketProviderId: data.marketProviderId,

      providerCardId: data.providerCardId,
      providerUrl: data.providerUrl,

      providerChecksum: data.providerChecksum,

      firstSeenAt: data.firstSeenAt,
      lastSeenAt: data.lastSeenAt,

      active: data.active,
    },
  });

  return updatedProviderCard;
}

module.exports = {
  updateMarketProviderCard,
};