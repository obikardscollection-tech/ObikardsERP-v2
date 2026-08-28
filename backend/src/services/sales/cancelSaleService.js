const prisma = require("../../lib/prisma");

async function cancelSale(id) {
  return prisma.$transaction(async (tx) => {
    const existingSale = await tx.sale.findUnique({
      where: {
        id,
      },
      include: {
        saleItems: true,
      },
    });

    if (!existingSale) {
      throw new Error("Vente introuvable.");
    }

    if (existingSale.isCancelled || existingSale.status === "CANCELLED") {
      throw new Error("Cette vente est déjà annulée.");
    }

    for (const item of existingSale.saleItems || []) {
      const inventory = await tx.inventory.findUnique({
        where: {
          id: item.inventoryId,
        },
      });

      if (!inventory) {
        throw new Error(`Article introuvable : ${item.inventoryId}`);
      }

      const restoredQuantity = Number(item.quantity || 0);
      if (restoredQuantity <= 0) {
        continue;
      }

      const previousQuantity = Number(inventory.quantity || 0);
      const newQuantity = previousQuantity + restoredQuantity;

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
          saleId: existingSale.id,
          type: "SALE",
          source: "SALE",
          quantity: restoredQuantity,
          previousQuantity,
          newQuantity,
          reason: "SALE_CANCELLATION",
          notes: `Annulation vente ${existingSale.orderNumber}`,
        },
      });
    }

    const sale = await tx.sale.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
        isCancelled: true,
      },
    });

    return sale;
  });
}

module.exports = {
  cancelSale,
};
