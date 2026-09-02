const { applyInventoryQuantityDelta } = require("../stock/createMovementService");
const {
  buildInventoryData,
  buildReceptionSku,
} = require("./receptionInventoryDataService");

async function createInventoryFromReceptionItem(
  tx,
  purchase,
  purchaseItem,
  receptionItem
) {
  if (!receptionItem || !receptionItem.id) {
    throw new Error(
      "Impossible de créer l'inventaire: receptionItem.id manquant."
    );
  }

  const inventoryData = await buildInventoryData(
    tx,
    purchase,
    purchaseItem,
    receptionItem
  );
  const sku = buildReceptionSku(purchaseItem, receptionItem);

  const inventory = await tx.inventory.create({
    data: {
      sku,
      cardReferenceId: inventoryData.cardReferenceId,
      category: inventoryData.category,
      title: inventoryData.title,
      purchaseItemId: inventoryData.purchaseItemId,
      receptionItemId: inventoryData.receptionItemId,
      purchasePrice: inventoryData.purchasePrice,
      quantity: 0,
      status: inventoryData.status,
      purchaseDate: inventoryData.purchaseDate,
      purchaseSource: inventoryData.purchaseSource,
      supplier: inventoryData.supplier,
      notes: inventoryData.notes,
      sport: inventoryData.sport,
      year: inventoryData.year,
      brand: inventoryData.brand,
      series: inventoryData.series,
      subset: inventoryData.subset,
      product: inventoryData.product,
      player: inventoryData.player,
      team: inventoryData.team,
      cardNumber: inventoryData.cardNumber,
      parallel: inventoryData.parallel,
      variant: inventoryData.variant,
      rookie: inventoryData.rookie,
      autograph: inventoryData.autograph,
      memorabilia: inventoryData.memorabilia,
      frontPhoto: null,
      backPhoto: null,
      extraPhotos: null,
    },
  });

  if (!inventory || !inventory.id) {
    throw new Error(
      "Impossible de créer l'inventaire: création non confirmée."
    );
  }

  const receivedQuantity = Number(inventoryData.quantity || 0);

  if (receivedQuantity > 0) {
    const result = await applyInventoryQuantityDelta({
      tx,
      inventoryId: inventory.id,
      delta: receivedQuantity,
      type: "RECEIPT",
      source: "PURCHASE",
      reason: "RECEPTION",
      notes: `Réception ${purchase?.purchaseNumber || "achat"}`,
      purchaseId: purchase?.id || null,
      receptionId: receptionItem?.receptionId || null,
    });

    inventory.quantity = result.newQuantity;
    inventory.status = result.status;
  }

  return inventory;
}

module.exports = {
  createInventoryFromReceptionItem,
};
