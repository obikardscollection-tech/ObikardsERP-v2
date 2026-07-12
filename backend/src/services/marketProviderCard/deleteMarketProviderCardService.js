const prisma = require("../../lib/prisma");

async function deleteMarketProviderCard(id) {
  const providerCard = await prisma.marketProviderCard.findUnique({
    where: {
      id,
    },
  });

  if (!providerCard) {
    throw new Error("MarketProviderCard introuvable.");
  }

  await prisma.marketProviderCard.delete({
    where: {
      id,
    },
  });

  return {
    message: "MarketProviderCard supprimé avec succès.",
  };
}

module.exports = {
  deleteMarketProviderCard,
};