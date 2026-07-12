const prisma = require("../../lib/prisma");

async function deleteMarketSnapshot(id) {
  const snapshot = await prisma.marketSnapshot.findUnique({
    where: {
      id,
    },
  });

  if (!snapshot) {
    throw new Error("MarketSnapshot introuvable.");
  }

  await prisma.marketSnapshot.delete({
    where: {
      id,
    },
  });

  return {
    message: "MarketSnapshot supprimé avec succès.",
  };
}

module.exports = {
  deleteMarketSnapshot,
};
