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

async function generateReceptionNumber(tx) {
  const lastReception = await tx.reception.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  let next = 1;

  if (lastReception?.receptionNumber) {
    const parts =
      lastReception.receptionNumber.split("-");

    if (parts.length === 2) {
      next = Number(parts[1]) + 1;
    }
  }

  return `REC-${String(next).padStart(6, "0")}`;
}

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

    const receptionNumber =
      data.receptionNumber ||
      (await generateReceptionNumber(tx));

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
