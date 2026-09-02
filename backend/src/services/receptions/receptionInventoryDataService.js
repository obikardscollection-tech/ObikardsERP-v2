function optionalText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

async function findCardReference(tx, purchaseItem) {
  const cardReferenceId = optionalText(purchaseItem.cardReference);

  if (!cardReferenceId) {
    return null;
  }

  return tx.cardReference.findUnique({
    where: { id: cardReferenceId },
  });
}

async function buildInventoryData(tx, purchase, purchaseItem, receptionItem) {
  const suppliedData = receptionItem.inventoryData || receptionItem.inventory || {};
  const cardReference = await findCardReference(tx, purchaseItem);

  return {
    cardReferenceId: cardReference?.id || null,
    category: suppliedData.category || suppliedData.sport || cardReference?.sport || "RECEPTION",
    title: suppliedData.title || purchaseItem.name,
    purchaseItemId: purchaseItem.id,
    receptionItemId: receptionItem.id,
    purchasePrice: Number(purchaseItem.unitPrice || 0),
    quantity: Number(receptionItem.quantityReceived),
    status: "IN_STOCK",
    purchaseDate: purchase.purchasedAt,
    purchaseSource: purchase.platform,
    supplier: purchase.supplier?.name || purchase.supplier?.company || null,
    notes: receptionItem.notes || purchaseItem.notes || null,
    sport: suppliedData.sport || cardReference?.sport || null,
    year: suppliedData.year ? Number(suppliedData.year) : cardReference?.year || null,
    brand: suppliedData.brand || cardReference?.brand || cardReference?.manufacturer || null,
    series: suppliedData.series || cardReference?.set || null,
    subset: suppliedData.subset || cardReference?.subset || null,
    product: suppliedData.product || null,
    player: suppliedData.player || cardReference?.player || null,
    team: suppliedData.team || cardReference?.team || null,
    cardNumber: suppliedData.cardNumber || cardReference?.cardNumber || null,
    parallel: suppliedData.parallel || cardReference?.parallel || null,
    variant: suppliedData.variant || cardReference?.variation || null,
    rookie: suppliedData.rookie ?? cardReference?.rookie ?? false,
    autograph: suppliedData.autograph ?? cardReference?.autograph ?? false,
    memorabilia: suppliedData.memorabilia ?? cardReference?.memorabilia ?? false,
  };
}

function buildReceptionSku(purchaseItem, receptionItem) {
  const purchaseSku = optionalText(purchaseItem.sku);
  const suffix = receptionItem.id.substring(0, 8);

  return purchaseSku ? `${purchaseSku}-${suffix}` : `REC-${receptionItem.id}`;
}

module.exports = {
  buildInventoryData,
  buildReceptionSku,
};