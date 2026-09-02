const prisma = require("../../lib/prisma");
const { calculateSale } = require("./calculateSaleService");
const { createSaleItems } = require("./createSaleItemsService");
const { finalizeSale } = require("./finalizeSaleService");

function numericValue(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Les montants de la vente doivent être numériques.");
  }

  return parsed;
}

async function updateSale(id, data) {
  return prisma.$transaction(async (tx) => {
    const existingSale = await tx.sale.findUnique({
      where: { id },
      include: { saleItems: true },
    });

    if (!existingSale) {
      throw new Error("Vente introuvable.");
    }

    if (existingSale.isCancelled || existingSale.status === "CANCELLED") {
      throw new Error("Impossible de modifier une vente annulée.");
    }

    if (data.status === "CANCELLED") {
      throw new Error("Utilisez l'action d'annulation pour annuler une vente.");
    }

    let calculation = {
      totalItems: existingSale.totalItems,
      totalAmount: existingSale.totalAmount,
      profit: existingSale.profit,
    };

    if (Array.isArray(data.items)) {
      if (data.items.length === 0) {
        throw new Error("Au moins un article est obligatoire pour modifier une vente.");
      }

      for (const item of existingSale.saleItems) {
        const inventory = await tx.inventory.findUnique({
          where: { id: item.inventoryId },
        });

        if (!inventory) {
          throw new Error(`Article introuvable : ${item.inventoryId}`);
        }

        const previousQuantity = Number(inventory.quantity || 0);
        const restoredQuantity = Number(item.quantity || 0);
        const newQuantity = previousQuantity + restoredQuantity;

        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: newQuantity,
            status: newQuantity > 0 ? "IN_STOCK" : inventory.status,
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
            reason: "SALE_UPDATE_REVERSAL",
            notes: `Modification vente ${existingSale.orderNumber}`,
          },
        });
      }

      calculation = await calculateSale(tx, data.items);

      await tx.saleItem.deleteMany({ where: { saleId: id } });
      await createSaleItems(tx, id, data.items);
      await finalizeSale(tx, id, data.items);
    }

    return tx.sale.update({
      where: { id },
      data: {
        platform: data.platform || existingSale.platform,
        status: data.status || existingSale.status,
        customerId: data.customerId ?? existingSale.customerId,
        customerName: data.customerName ?? existingSale.customerName,
        customerEmail: data.customerEmail ?? existingSale.customerEmail,
        shippingCost: numericValue(data.shippingCost, existingSale.shippingCost),
        platformFees: numericValue(data.platformFees, existingSale.platformFees),
        taxes: numericValue(data.taxes, existingSale.taxes),
        discount: numericValue(data.discount, existingSale.discount),
        totalItems: Number(calculation.totalItems),
        totalAmount: Number(calculation.totalAmount),
        profit: Number(calculation.profit),
        notes: data.notes ?? existingSale.notes,
        soldAt: data.soldAt ? new Date(data.soldAt) : existingSale.soldAt,
      },
    });
  });
}

module.exports = {
  updateSale,
};
