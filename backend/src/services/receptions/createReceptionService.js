const prisma = require("../../lib/prisma");

const {
  getReceivedQuantities,
  normalizeReceptionItems,
  validateReceptionPlan,
} = require("./receptionCalculationsService");
const {
  createInventoryFromReceptionItem,
} = require("./receptionInventoryService");
const {
  updatePurchaseReceptionState,
} = require("./updatePurchaseReceptionStateService");
const { generateReference } = require("../common/referenceGeneratorService");

async function createReception(data) {
  return prisma.$transaction(async (tx) => {
    const purchaseId = data.purchaseId;

    if (!purchaseId) {
      throw new Error("purchaseId est obligatoire.");
    }

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
      await getReceivedQuantities(tx, purchaseId);

    const plan = validateReceptionPlan(
      purchase,
      items,
      receivedQuantities
    );

    const receptionNumber = await generateReference("REC", tx);

    const reception = await tx.reception.create({
      data: {
        receptionNumber,
        purchaseId,
        totalQuantity: plan.totalQuantity,
        remainingQuantity: plan.remainingQuantity,
        notes: data.notes || null,
        receivedAt: data.receivedAt
          ? new Date(data.receivedAt)
          : new Date(),
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

    await updatePurchaseReceptionState(tx, purchaseId);

    return tx.reception.findUnique({
      where: {
        id: reception.id,
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
  createReception,
};
