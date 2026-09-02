const prisma = require("../src/lib/prisma");
const { createInventory } = require("../src/services/inventory/createInventoryService");

let sequence = 0;

function uniqueLabel(label) {
  sequence += 1;
  return `S24_${process.pid}_${Date.now()}_${sequence}_${label}`;
}

async function createTestInventory(overrides = {}) {
  const label = uniqueLabel("INV");
  return createInventory({
    sport: "Basketball",
    brand: label,
    purchasePrice: 10,
    askingPrice: 25,
    quantity: 3,
    status: "IN_STOCK",
    location: "TEST_BIN",
    notes: label,
    ...overrides,
  });
}

async function cleanupInventorySales({ inventoryIds = [], saleIds = [] }) {
  if (saleIds.length) {
    await prisma.stockMovement.deleteMany({ where: { saleId: { in: saleIds } } });
    await prisma.saleItem.deleteMany({ where: { saleId: { in: saleIds } } });
    await prisma.sale.deleteMany({ where: { id: { in: saleIds } } });
  }

  if (inventoryIds.length) {
    await prisma.stockMovement.deleteMany({ where: { inventoryId: { in: inventoryIds } } });
    await prisma.inventoryMarketSnapshot.deleteMany({ where: { inventoryId: { in: inventoryIds } } });
    await prisma.inventory.deleteMany({ where: { id: { in: inventoryIds } } });
  }
}

module.exports = {
  cleanupInventorySales,
  createTestInventory,
  prisma,
  uniqueLabel,
};