const prisma = require("../../lib/prisma");

const inventoryMapper = require("./mappers/inventoryMapper");
const { generateSku } = require("./skuService");

async function createInventory(data) {
  const sku = await generateSku(data.sport);

  const item = await prisma.inventory.create({
    data: {
      sku,
      ...inventoryMapper(data),

      // Photos (Sprint 5)
      frontPhoto: null,
      backPhoto: null,
      extraPhotos: null,
    },
  });

  return item;
}

module.exports = {
  createInventory,
};