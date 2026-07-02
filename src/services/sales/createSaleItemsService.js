async function createSaleItems(tx, saleId, items) {
  for (const item of items) {
    const inventory = await tx.inventory.findUnique({
      where: {
        id: item.inventoryId,
      },
    });

    if (!inventory) {
      throw new Error(`Article introuvable : ${item.inventoryId}`);
    }

    const unitPrice = Number(item.unitPrice);
    const quantity = Number(item.quantity);
    const purchasePrice = Number(inventory.purchasePrice || 0);

    await tx.saleItem.create({
      data: {
        saleId,
        inventoryId: inventory.id,

        quantity,

        unitPrice,
        totalPrice: unitPrice * quantity,

        purchasePriceSnapshot: purchasePrice,
        profitSnapshot:
          (unitPrice - purchasePrice) * quantity,
      },
    });
  }
}

module.exports = {
  createSaleItems,
};