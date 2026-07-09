const prisma = require("../../lib/prisma");

const {
  getReceivedQuantities,
  normalizeReceptionItems,
  validateReceptionPlan,
} = require("./receptionCalculationsService");
const {
  deleteReceptionInventories,
} = require("./receptionInventoryCleanupService");
const {
  createInventoryFromReceptionItem,
} = require("./receptionInventoryService");
const {
  updatePurchaseReceptionState,
} = require("./updatePurchaseReceptionStateService");

async function updateReception(id, data) {
  return prisma.$transaction(async (tx) => {
    const existingReception =
      await tx.reception.findUnique({
        where: {
          id,
        },
      });

    if (!existingReception) {
      throw new Error("Reception introuvable.");
    }

    const purchaseId =
      data.purchaseId || existingReception.purchaseId;

    const purchase = await tx.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      include: {
        supplier: true,
        purchaseItems: true,
      },
    });

    if (!purchase) {
      throw new Error("Achat introuvable.");
    }

    const items = normalizeReceptionItems(
      data.items || data.receptionItems
    );

    const receivedQuantities =
      await getReceivedQuantities(tx, purchaseId, id);

    const plan = validateReceptionPlan(
      purchase,
      items,
      receivedQuantities
    );

    await deleteReceptionInventories(tx, id);

    await tx.receptionItem.deleteMany({
      where: {
        receptionId: id,
      },
    });

    const reception = await tx.reception.update({
      where: {
        id,
      },
      data: {
        receptionNumber:
          data.receptionNumber ||
          existingReception.receptionNumber,
        purchaseId,
        totalQuantity: plan.totalQuantity,
        remainingQuantity: plan.remainingQuantity,
        notes: data.notes || null,
        receivedAt: data.receivedAt
          ? new Date(data.receivedAt)
          : existingReception.receivedAt,
      },
    });

    for (const item of plan.items) {
      const receptionItem =
        await tx.receptionItem.create({
          data: {
            receptionId: reception.id,
            purchaseItemId: item.purchaseItemId,
            quantityReceived: item.quantityReceived,
            quantityRemaining: item.quantityRemaining,
            notes: item.notes || null,
          },
        });

      await createInventoryFromReceptionItem(
        tx,
        purchase,
        item.purchaseItem,
        {
          ...item,
          id: receptionItem.id,
        }
      );

      await tx.receptionItem.update({
        where: {
          id: receptionItem.id,
        },
        data: {
          inventoryCreated: true,
        },
      });
    }

    await updatePurchaseReceptionState(
      tx,
      existingReception.purchaseId
    );

    if (purchaseId !== existingReception.purchaseId) {
      await updatePurchaseReceptionState(tx, purchaseId);
    }

    return tx.reception.findUnique({
      where: {
        id,
      },
      include: {
        purchase: true,
        receptionItems: {
          include: {
            purchaseItem: true,
            inventory: true,
          },
        },
      },
    });
  });
}

module.exports = {
  updateReception,
};
