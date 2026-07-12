const prisma = require("../../lib/prisma");

async function updateMarketReference(id, data) {
  const reference = await prisma.marketReference.findUnique({
    where: {
      id,
    },
  });

  if (!reference) {
    throw new Error("MarketReference introuvable.");
  }

  const updatedReference = await prisma.marketReference.update({
    where: {
      id,
    },
    data: {
      type: data.type,

      value: data.value,

      count: data.count,

      firstSeen: data.firstSeen,
      lastSeen: data.lastSeen,

      active: data.active,
    },
  });

  return updatedReference;
}

module.exports = {
  updateMarketReference,
};
