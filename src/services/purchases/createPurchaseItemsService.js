const prisma = require("../../lib/prisma");

async function createPurchaseItems(purchaseId, items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const purchaseItems = await Promise.all(
    items.map((item) =>
      prisma.purchaseItem.create({
        data: {
          purchaseId,
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        },
      })
    )
  );

  return purchaseItems;
}

module.exports = {
  createPurchaseItems,
};