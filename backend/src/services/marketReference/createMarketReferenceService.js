const prisma = require("../../lib/prisma");

async function createMarketReference(data) {
  const reference = await prisma.marketReference.create({
    data: {
      type: data.type,

      value: data.value,

      count: data.count ?? 0,

      firstSeen: data.firstSeen ?? undefined,
      lastSeen: data.lastSeen ?? undefined,

      active: data.active ?? true,
    },
  });

  return reference;
}

module.exports = {
  createMarketReference,
};
