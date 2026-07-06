const prisma = require("../../lib/prisma");

async function createPurchase(data) {
  const purchase = await prisma.purchase.create({
    data: {
      purchaseNumber: data.purchaseNumber,

      supplierId: data.supplierId,

      platform: data.platform,
      status: data.status || "PENDING",

      shippingCost: data.shippingCost || 0,
      taxes: data.taxes || 0,
      discount: data.discount || 0,

      totalAmount: data.totalAmount || 0,

      notes: data.notes || null,

      purchasedAt: data.purchasedAt
        ? new Date(data.purchasedAt)
        : new Date(),
    },
  });

  return purchase;
}

module.exports = {
  createPurchase,
};