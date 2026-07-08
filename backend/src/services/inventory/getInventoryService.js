const prisma = require("../../lib/prisma");

async function getInventory() {
  return prisma.inventory.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

module.exports = {
  getInventory,
};