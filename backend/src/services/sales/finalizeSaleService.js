async function finalizeSale(tx, saleId, items) {
  const sale = await tx.sale.findUnique({
    where: {
      id: saleId,
    },
    select: {
      id: true,
      status: true,
      isCancelled: true,
      orderNumber: true,
    },
  });

  if (!sale) {
    throw new Error("Vente introuvable.");
  }

  if (sale.isCancelled || sale.status === "CANCELLED") {
    throw new Error("Impossible de finaliser une vente annulée.");
  }

  for (const item of items) {
    const inventory = await tx.inventory.findUnique({
      where: {
        id: item.inventoryId,
      },
    });

    if (!inventory) {
      throw new Error(`Article introuvable : ${item.inventoryId}`);
    }

    const soldQuantity = Number(item.quantity || 0);

    if (soldQuantity <= 0) {
      throw new Error(`La quantité vendue doit être supérieure à 0 pour ${item.inventoryId}.`);
    }

    if (inventory.quantity < soldQuantity) {
      throw new Error(`Stock insuffisant pour "${inventory.title}".`);
    }

    const previousQuantity = inventory.quantity;
    const newQuantity = previousQuantity - soldQuantity;

    await tx.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        quantity: newQuantity,
        status: newQuantity > 0 ? "IN_STOCK" : "SOLD",
      },
    });

    await tx.stockMovement.create({
      data: {
        inventoryId: inventory.id,
        saleId,
        type: "SALE",
        source: "SALE",
        quantity: -soldQuantity,
        previousQuantity,
        newQuantity,
        reason: "SALE",
        notes: `Vente ${sale.orderNumber}`,
      },
    });
  }
}

module.exports = {
  finalizeSale,
};