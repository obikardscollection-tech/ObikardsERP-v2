const prisma = require("../../lib/prisma");

async function deleteMarketReference(id) {
  const reference = await prisma.marketReference.findUnique({
    where: {
      id,
    },
  });

  if (!reference) {
    throw new Error("MarketReference introuvable.");
  }

  await prisma.marketReference.delete({
    where: {
      id,
    },
  });

  return {
    message: "MarketReference supprimé avec succès.",
  };
}

module.exports = {
  deleteMarketReference,
};
