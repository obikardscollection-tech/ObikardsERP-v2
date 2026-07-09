async function generateReceptionSku(tx, receptionItemId) {
  // Use receptionItemId in SKU to ensure uniqueness per reception item
  const timestamp = Date.now();
  return `REC-${timestamp}-${receptionItemId.substring(0, 8)}`;
}

function buildInventoryData({
  purchase,
  purchaseItem,
  receptionItem,
}) {
  const inventoryData =
    receptionItem.inventoryData ||
    receptionItem.inventory ||
    {};

  const category =
    inventoryData.category ||
    inventoryData.sport ||
    "RECEPTION";

  return {
    category,
    title: inventoryData.title || purchaseItem.name,

    purchaseItemId: purchaseItem.id,
    receptionItemId: receptionItem.id,

    purchasePrice: Number(purchaseItem.unitPrice || 0),
    quantity: Number(receptionItem.quantityReceived),
    status: "IN_STOCK",

    purchaseDate: purchase.purchasedAt,
    purchaseSource: purchase.platform,
    supplier:
      purchase.supplier?.name ||
      purchase.supplier?.company ||
      null,

    notes: receptionItem.notes || purchaseItem.notes || null,

    sport: inventoryData.sport || null,
    year: inventoryData.year
      ? Number(inventoryData.year)
      : null,
    brand: inventoryData.brand || null,
    series: inventoryData.series || null,
    product: inventoryData.product || null,
    player: inventoryData.player || null,
    team: inventoryData.team || null,
    cardNumber: inventoryData.cardNumber || null,
    condition: undefined,
  };
}

async function createInventoryFromReceptionItem(
  tx,
  purchase,
  purchaseItem,
  receptionItem
) {
  const inventoryData = buildInventoryData({
    purchase,
    purchaseItem,
    receptionItem,
  });

  const sku = await generateReceptionSku(tx, receptionItem.id);

  return tx.inventory.create({
    data: {
      sku,
      category: inventoryData.category,
      title: inventoryData.title,
      purchaseItemId: inventoryData.purchaseItemId,
      receptionItemId: inventoryData.receptionItemId,
      purchasePrice: inventoryData.purchasePrice,
      quantity: inventoryData.quantity,
      status: inventoryData.status,
      purchaseDate: inventoryData.purchaseDate,
      purchaseSource: inventoryData.purchaseSource,
      supplier: inventoryData.supplier,
      notes: inventoryData.notes,
      sport: inventoryData.sport,
      year: inventoryData.year,
      brand: inventoryData.brand,
      series: inventoryData.series,
      product: inventoryData.product,
      player: inventoryData.player,
      team: inventoryData.team,
      cardNumber: inventoryData.cardNumber,
      frontPhoto: null,
      backPhoto: null,
      extraPhotos: null,
    },
  });
}

module.exports = {
  createInventoryFromReceptionItem,
};
