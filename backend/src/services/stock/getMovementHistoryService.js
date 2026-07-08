const prisma = require("../../lib/prisma");

async function getMovementHistory(inventoryId) {
  const movements = await prisma.stockMovement.findMany({
    where: {
      inventoryId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return movements;
}

module.exports = {
  getMovementHistory,
};