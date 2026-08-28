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

    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const purchasePrice = Number(inventory.purchasePrice || 0);

    if (!item.inventoryId) {
      throw new Error("L'identifiant de l'article est obligatoire.");
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`La quantité doit être valide pour "${inventory.title}".`);
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error(`Le prix de vente est obligatoire et doit être valide pour "${inventory.title}".`);
    }

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