async function calculateSale(tx, items) {
  let totalAmount = 0;
  let profit = 0;

  for (const item of items) {
    const inventory = await tx.inventory.findUnique({
      where: {
        id: item.inventoryId,
      },
    });

    if (!inventory) {
      throw new Error(`Article introuvable : ${item.inventoryId}`);
    }

    if (inventory.quantity < item.quantity) {
      throw new Error(
        `Stock insuffisant pour "${inventory.title}".`
      );
    }

    const unitPrice = Number(item.unitPrice);
    const purchasePrice = Number(inventory.purchasePrice || 0);

    totalAmount += unitPrice * item.quantity;

    profit +=
      (unitPrice - purchasePrice) *
      item.quantity;
  }

  return {
    totalAmount,
    profit,
  };
}

module.exports = {
  calculateSale,
};