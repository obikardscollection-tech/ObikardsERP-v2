const prisma = require("../../lib/prisma");

const { calculatePurchase } = require("./calculatePurchaseService");
const { createPurchaseItems } = require("./createPurchaseItemsService");

async function createPurchase(data) {
  return prisma.$transaction(async (tx) => {
    const items = data.items || data.purchaseItems;

    const calculation = calculatePurchase(
      items,
      data.shippingCost,
      data.taxes,
      data.discount
    );

    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber: data.purchaseNumber,

        supplierId: data.supplierId,

        platform: data.platform,
        status: data.status || "PENDING",

        shippingCost: Number(data.shippingCost || 0),
        taxes: Number(data.taxes || 0),
        discount: Number(data.discount || 0),

        totalItems: calculation.totalItems,
        totalAmount: calculation.totalAmount,

        currency: data.currency || "EUR",

        notes: data.notes || null,

        purchasedAt: data.purchasedAt
          ? new Date(data.purchasedAt)
          : new Date(),
      },
    });

    await createPurchaseItems(
      tx,
      purchase.id,
      calculation.purchaseItems
    );

    return tx.purchase.findUnique({
      where: {
        id: purchase.id,
      },
      include: {
        supplier: true,
        purchaseItems: true,
      },
    });
  });
}

module.exports = {
  createPurchase,
};
