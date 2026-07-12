const prisma = require("../../lib/prisma");

async function deleteMarketHistory(id) {
  const history = await prisma.marketHistory.findUnique({
    where: {
      id,
    },
  });

  if (!history) {
    throw new Error("MarketHistory introuvable.");
  }

  await prisma.marketHistory.delete({
    where: {
      id,
    },
  });

  return {
    message: "MarketHistory supprimé avec succès.",
  };
}

module.exports = {
  deleteMarketHistory,
};
