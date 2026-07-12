const prisma = require("../../lib/prisma");

async function getMarketReferenceById(id) {
  const reference = await prisma.marketReference.findUnique({
    where: {
      id,
    },
  });

  if (!reference) {
    throw new Error("MarketReference introuvable.");
  }

  return reference;
}

module.exports = {
  getMarketReferenceById,
};
