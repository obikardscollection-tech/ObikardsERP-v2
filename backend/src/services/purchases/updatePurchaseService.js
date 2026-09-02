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

  const purchaseItems = await prisma.purchaseItem.findMany({
    where: {
      purchaseId: id,
    },
  });

  const { calculatePurchase } = require("./calculatePurchaseService");

  const calculation = calculatePurchase(
    purchaseItems,
    data.shippingCost,
    data.taxes,
    data.discount
  );

  const purchase = await prisma.purchase.update({
    where: {
      id,
    },
    data: {
      supplierId: data.supplierId,
      platform: data.platform,
      status: existingPurchase.status,

      shippingCost: data.shippingCost || 0,
      taxes: data.taxes || 0,
      discount: data.discount || 0,

      totalItems: calculation.totalItems,
      totalAmount: calculation.totalAmount,

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
