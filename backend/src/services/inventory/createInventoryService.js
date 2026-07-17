const prisma = require("../../lib/prisma");

const inventoryMapper = require("./mappers/inventoryMapper");
const { generateSku } = require("./skuService");
const { resolveInventoryMarketIntegration } = require("./marketAutoLinkService");
const { createMarketSnapshot } = require("../../modules/market/snapshots");

async function createInventory(data) {
  const marketIntegration = await resolveInventoryMarketIntegration(data);

  return prisma.$transaction(async (tx) => {
    const sku = await generateSku(data.sport, tx);

    const item = await tx.inventory.create({
      data: {
        sku,
        ...inventoryMapper(data),
        ...marketIntegration.patch,

        // Photos (Sprint 5)
        frontPhoto: null,
        backPhoto: null,
        extraPhotos: null,
      },
    });

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