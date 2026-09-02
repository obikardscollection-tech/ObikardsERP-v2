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
const { generateReference } = require("../common/referenceGeneratorService");
const { createReception } = require("./createReceptionService");

async function updateReception(id, data) {
  if (id.startsWith("virtual-")) {
    const purchaseId = id.replace("virtual-", "");

    return createReception({
      ...data,
      purchaseId,
    });
  }

  // Handle real reception updates
  return prisma.$transaction(async (tx) => {
    const existingReception =
      await tx.reception.findUnique({
        where: {
          id,
        },
        include: {
          purchase: true,
        },
      });

    if (!existingReception) {
      throw new Error("Reception introuvable.");
    }

    // Check if reception is complete (remaining quantity = 0)
    // Cannot modify complete receptions
    if (existingReception.remainingQuantity === 0) {
      throw new Error(
        "Impossible de modifier une reception completement reçue."
      );
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

      const inventory = await createInventoryFromReceptionItem(
        tx,
        purchase,
        item.purchaseItem,
        {
          ...item,
          id: receptionItem.id,
          receptionId: receptionItem.receptionId,
        }
      );

      const linkedInventoryCount =
        await tx.inventory.count({
          where: {
            id: inventory.id,
            receptionItemId: receptionItem.id,
          },
        });

      if (linkedInventoryCount === 0) {
        throw new Error(
          "Création inventaire non exécutée pour la réception complète."
        );
      }

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
