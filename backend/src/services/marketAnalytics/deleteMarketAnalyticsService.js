const prisma = require("../../lib/prisma");

async function deleteMarketAnalytics(id) {
  const analytics = await prisma.marketAnalytics.findUnique({
    where: {
      id,
    },
  });

  if (!analytics) {
    throw new Error("MarketAnalytics introuvable.");
  }

  await prisma.marketAnalytics.delete({
    where: {
      id,
    },
  });

  return {
    message: "MarketAnalytics supprimé avec succès.",
  };
}

module.exports = {
  deleteMarketAnalytics,
};
