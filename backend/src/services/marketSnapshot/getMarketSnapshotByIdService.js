const prisma = require("../../lib/prisma");

async function getMarketSnapshotById(id) {
  const snapshot = await prisma.marketSnapshot.findUnique({
    where: {
      id,
    },
  });

  if (!snapshot) {
    throw new Error("MarketSnapshot introuvable.");
  }

  return snapshot;
}

module.exports = {
  getMarketSnapshotById,
};
