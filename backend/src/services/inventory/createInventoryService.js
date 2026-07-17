const prisma = require("../../lib/prisma");

const inventoryMapper = require("./mappers/inventoryMapper");
const { generateSku } = require("./skuService");
const { resolveInventoryMarketPatch } = require("./marketAutoLinkService");

async function createInventory(data) {
  const marketPatch = await resolveInventoryMarketPatch(data);

  return prisma.$transaction(async (tx) => {
    const sku = await generateSku(data.sport, tx);

    const item = await tx.inventory.create({
      data: {
        sku,
        ...inventoryMapper(data),
        ...marketPatch,

        // Photos (Sprint 5)
        frontPhoto: null,
        backPhoto: null,
        extraPhotos: null,
      },
    });

    return item;
  });
}

module.exports = {
  createInventory,
};