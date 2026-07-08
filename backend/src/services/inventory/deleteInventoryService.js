const prisma = require("../../lib/prisma");

async function deleteInventory(id) {
  await prisma.inventory.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
  };
}

module.exports = {
  deleteInventory,
};