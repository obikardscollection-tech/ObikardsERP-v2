const prisma = require("../../lib/prisma");

const inventoryMapper = require("./mappers/inventoryMapper");

async function updateInventory(id, data) {
  const item = await prisma.inventory.update({
    where: {
      id,
    },

    data: inventoryMapper(data),
  });

  return item;
}

module.exports = {
  updateInventory,
};