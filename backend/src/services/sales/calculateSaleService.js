async function calculateSale(tx, items) {
  let totalAmount = 0;
  let profit = 0;
  let totalItems = 0;

  for (const item of items) {
    const inventory = await tx.inventory.findUnique({
      where: {
        id: item.inventoryId,
      },
    });

    if (!inventory) {
      throw new Error(`Article introuvable : ${item.inventoryId}`);
    }

    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice);

    if (!item.inventoryId) {
      throw new Error("L'identifiant de l'article est obligatoire.");
    }

    if (quantity <= 0) {
      throw new Error(
        `La quantité doit être supérieure à 0 pour "${inventory.title}".`
      );
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error(
        `Le prix de vente est obligatoire et doit être valide pour "${inventory.title}".`
      );
    }

    if (inventory.quantity < quantity) {
      throw new Error(
        `Stock insuffisant pour "${inventory.title}".`
      );
    }

    const purchasePrice = Number(inventory.purchasePrice || 0);

    totalAmount += unitPrice * quantity;
    totalItems += quantity;

    profit +=
      (unitPrice - purchasePrice) *
      quantity;
  }

  return {
    totalAmount,
    profit,
    totalItems,
  };
}

module.exports = {
  calculateSale,
};