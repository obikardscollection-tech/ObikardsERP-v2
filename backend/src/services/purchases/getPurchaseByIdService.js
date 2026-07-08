const prisma = require("../../lib/prisma");

async function getPurchaseById(id) {
  const purchase = await prisma.purchase.findUnique({
    where: {
      id,
    },
    include: {
      supplier: true,
      purchaseItems: {
        include: {
          inventory: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new Error("Achat introuvable.");
  }

  return purchase;
}

module.exports = {
  getPurchaseById,
};