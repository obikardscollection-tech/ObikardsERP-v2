const prisma = require("../../lib/prisma");

async function getReceptions() {
  const receptions = await prisma.reception.findMany({
    include: {
      purchase: {
        include: {
          supplier: true,
        },
      },
      receptionItems: {
        include: {
          purchaseItem: true,
          inventory: true,
        },
      },
    },
    orderBy: {
      receivedAt: "desc",
    },
  });

  return receptions;
}

module.exports = {
  getReceptions,
};
