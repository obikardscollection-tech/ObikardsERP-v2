/**
 * Service pour créer automatiquement une réception quand un achat RECEIVED est créé
 * Pour les achats PENDING, la réception sera créée quand l'utilisateur la crée
 */

const { generateReference } = require("../common/referenceGeneratorService");
const {
  createInventoryFromReceptionItem,
} = require("./receptionInventoryService");

async function autoCreateReception(tx, purchase) {
  if (purchase.status !== "RECEIVED") {
    return null;
  }

  if (!purchase || !purchase.purchaseItems) {
    return null;
  }

  const totalQuantity = purchase.purchaseItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const receptionNumber = await generateReference("REC", tx);

  const reception = await tx.reception.create({
    data: {
      receptionNumber,
      purchaseId: purchase.id,
      totalQuantity,
      remainingQuantity: 0,
      notes: `Réception complète pour achat reçu ${purchase.purchaseNumber}`,
      receivedAt: purchase.purchasedAt,
    },
  });

  for (const purchaseItem of purchase.purchaseItems) {
    const quantity = Number(purchaseItem.quantity || 0);

    const receptionItem = await tx.receptionItem.create({
      data: {
        receptionId: reception.id,
        purchaseItemId: purchaseItem.id,
        quantityReceived: quantity,
        quantityRemaining: 0,
        notes: null,
        inventoryCreated: false,
      },
    });

    await createInventoryFromReceptionItem(
      tx,
      purchase,
      purchaseItem,
      receptionItem
    );

    await tx.receptionItem.update({
      where: {
        id: receptionItem.id,
      },
      data: {
        inventoryCreated: true,
      },
    });

    await tx.purchaseItem.update({
      where: {
        id: purchaseItem.id,
      },
      data: {
        inventoryCreated: true,
      },
    });
  }

  return tx.reception.findUnique({
    where: {
      id: reception.id,
    },
    include: {
      receptionItems: {
        include: {
          purchaseItem: true,
        },
      },
    },
  });
}

module.exports = {
  autoCreateReception,
};
