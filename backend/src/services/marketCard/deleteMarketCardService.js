const prisma = require("../../lib/prisma");

async function deleteMarketCard(id) {
  const card = await prisma.marketCard.findUnique({
    where: {
      id,
    },
  });

  if (!card) {
    throw new Error("MarketCard introuvable.");
  }

  await prisma.marketCard.delete({
    where: {
      id,
    },
  });

  return {
    message: "MarketCard supprime avec succes.",
  };
}

module.exports = {
  deleteMarketCard,
};
