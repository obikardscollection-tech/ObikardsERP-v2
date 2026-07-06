const prisma = require("../../lib/prisma");

async function updatePurchase(id, data) {
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      id,
    },
  });

  if (!existingPurchase) {
    throw new Error("Achat introuvable.");
  }

  const purchase = await prisma.purchase.update({
    where: {
      id,
    },
    data: {
      supplierId: data.supplierId,
      platform: data.platform,
      status: data.status,

      shippingCost: data.shippingCost || 0,
      taxes: data.taxes || 0,
      discount: data.discount || 0,

      totalAmount: data.totalAmount || 0,

      notes: data.notes || null,

      purchasedAt: data.purchasedAt
        ? new Date(data.purchasedAt)
        : existingPurchase.purchasedAt,
    },
  });

  return purchase;
}

module.exports = {
  updatePurchase,
};