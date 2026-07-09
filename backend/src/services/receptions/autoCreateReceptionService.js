/**
 * Service pour créer automatiquement une réception quand un achat RECEIVED est créé
 * Pour les achats PENDING, la réception sera créée quand l'utilisateur la crée
 */

const { generateReference } = require("../common/referenceGeneratorService");

async function autoCreateReception(tx, purchase) {
  // Ne créer une réception automatique que si le statut est RECEIVED
  if (purchase.status !== "RECEIVED") {
    return null;
  }

  if (!purchase || !purchase.purchaseItems) {
    return null;
  }

  // Calculer les quantités totales
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
      remainingQuantity: 0, // RECEIVED = all received
      notes: `Réception complète pour achat reçu ${purchase.purchaseNumber}`,
      receivedAt: purchase.purchasedAt,
    },
  });

  // Créer les items de réception avec les quantités reçues
  for (const purchaseItem of purchase.purchaseItems) {
    const quantity = Number(purchaseItem.quantity || 0);

    await tx.receptionItem.create({
      data: {
        receptionId: reception.id,
        purchaseItemId: purchaseItem.id,
        quantityReceived: quantity,
        quantityRemaining: 0,
        notes: null,
        inventoryCreated: false, // Sera marqué comme true après création d'inventaire
      },
    });

    // Créer les items d'inventaire
    const sku = purchaseItem.skuCode || `SKU-${purchase.id}-${purchaseItem.id}`;
    await tx.inventory.create({
      data: {
        sku: sku,
        category: "PURCHASED",
        title: purchaseItem.name || "Article",
        quantity: quantity,
        purchasePrice: Number(purchaseItem.unitPrice || 0),
        salePrice: Number(purchaseItem.unitPrice || 0) * 1.3,
        status: "IN_STOCK",
      },
    });
  }

  // Marquer tous les items comme créés
  await tx.receptionItem.updateMany({
    where: {
      receptionId: reception.id,
    },
    data: {
      inventoryCreated: true,
    },
  });

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
