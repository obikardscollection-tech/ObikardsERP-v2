const prisma = require("../../lib/prisma");

async function getMarketHistoryById(id) {
  const history = await prisma.marketHistory.findUnique({
    where: {
      id,
    },
  });

  if (!history) {
    throw new Error("MarketHistory introuvable.");
  }

  return history;
}

module.exports = {
  getMarketHistoryById,
};
