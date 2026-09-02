const prisma = require("../../lib/prisma");

const inventoryMapper = require("./mappers/inventoryMapper");
const { generateSku } = require("./skuService");
const { resolveInventoryMarketIntegration } = require("./marketAutoLinkService");
const { createMarketSnapshot } = require("../../modules/market/snapshots");
const { applyInventoryQuantityDelta } = require("../stock/createMovementService");

async function createInventory(data) {
  const marketIntegration = await resolveInventoryMarketIntegration(data);

  return prisma.$transaction(async (tx) => {
    const mappedData = inventoryMapper(data);
    const sku = await generateSku(data.sport, tx);

    const initialQuantity = Number(mappedData.quantity ?? 0);
    const item = await tx.inventory.create({
      data: {
        sku,
        ...mappedData,
        quantity: 0,
        ...marketIntegration.patch,

        frontPhoto: null,
        backPhoto: null,
        extraPhotos: null,
      },
    });

    if (initialQuantity > 0) {
      const result = await applyInventoryQuantityDelta({
        tx,
        inventoryId: item.id,
        delta: initialQuantity,
        type: "INVENTORY",
        source: "INVENTORY",
        reason: "INITIAL_INVENTORY_STOCK",
        notes: "Création initiale d'inventaire",
      });

      item.quantity = result.newQuantity;
      item.status = result.status;
    }

    if (marketIntegration.refreshResult) {
      await createMarketSnapshot({
        inventoryId: item.id,
        refreshResult: marketIntegration.refreshResult,
        db: tx,
      });
    }

    return item;
  });
}

module.exports = {
  createInventory,
};