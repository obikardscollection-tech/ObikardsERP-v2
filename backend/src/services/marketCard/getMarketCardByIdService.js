const prisma = require("../../lib/prisma");

async function getMarketCardById(id) {
  const card = await prisma.marketCard.findUnique({
    where: {
      id,
    },
  });

  if (!card) {
    throw new Error("MarketCard introuvable.");
  }

  return card;
}

module.exports = {
  getMarketCardById,
};