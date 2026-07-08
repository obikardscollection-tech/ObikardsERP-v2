async function createPurchaseItems(tx, purchaseId, items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const purchaseItems = [];

  for (const item of items) {
    const purchaseItem = await tx.purchaseItem.create({
      data: {
        purchaseId,

        name: item.name,

        cardReference:
          item.cardReference ?? null,

        quantity:
          Number(item.quantity) || 1,

        unitPrice:
          Number(item.unitPrice) || 0,

        totalPrice:
          Number(item.totalPrice) || 0,

        condition:
          item.condition ?? null,

        sku: item.sku ?? null,

        notes: item.notes ?? null,

        inventoryCreated: false,
      },
    });

    purchaseItems.push(purchaseItem);
  }

  return purchaseItems;
}

module.exports = {
  createPurchaseItems,
};
