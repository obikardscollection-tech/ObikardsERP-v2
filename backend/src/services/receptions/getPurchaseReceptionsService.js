const prisma = require("../../lib/prisma");

async function getPurchaseReceptions(purchaseId) {
  const receptions = await prisma.reception.findMany({
    where: {
      purchaseId,
    },
    include: {
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
  getPurchaseReceptions,
};
