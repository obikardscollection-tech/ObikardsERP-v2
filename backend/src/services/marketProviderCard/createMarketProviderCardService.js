const prisma = require("../../lib/prisma");

async function createMarketProviderCard(data) {
  const providerCard = await prisma.marketProviderCard.create({
    data: {
      marketCardId: data.marketCardId,
      marketProviderId: data.marketProviderId,

      providerCardId: data.providerCardId,
      providerUrl: data.providerUrl ?? null,

      providerChecksum: data.providerChecksum ?? null,

      firstSeenAt: data.firstSeenAt ?? undefined,
      lastSeenAt: data.lastSeenAt ?? undefined,

      active: data.active ?? true,
    },
  });

  return providerCard;
}

module.exports = {
  createMarketProviderCard,
};