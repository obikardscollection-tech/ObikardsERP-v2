const { createSale } = require("../src/services/sales/createSaleService");
const {
  cleanupInventorySales, createTestInventory, prisma, uniqueLabel,
} = require("./erpTestFixtures");

function item(inventory, quantity, unitPrice) {
  return { inventoryId: inventory.id, quantity, unitPrice };
}

async function createTrackedInventory(registry, overrides = {}) {
  const inventory = await createTestInventory(overrides);
  registry.inventoryIds.push(inventory.id);
  return inventory;
}

async function createTrackedSale(registry, items, overrides = {}) {
  const sale = await createSale({
    platform: "DIRECT",
    status: "PENDING",
    shippingCost: 99,
    platformFees: 88,
    taxes: 77,
    discount: 66,
    notes: uniqueLabel("SALE"),
    totalItems: 999,
    totalAmount: 999,
    profit: 999,
    items,
    ...overrides,
  });
  registry.saleIds.push(sale.id);
  return sale;
}

async function saleSnapshot(saleId, inventoryIds) {
  const [sale, inventories, movements] = await Promise.all([
    prisma.sale.findUnique({ where: { id: saleId }, include: { saleItems: { orderBy: { inventoryId: "asc" } } } }),
    prisma.inventory.findMany({ where: { id: { in: inventoryIds } }, orderBy: { id: "asc" } }),
    prisma.stockMovement.findMany({ where: { saleId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  ]);
  return { sale, inventories, movements };
}

async function cleanupRegistry(registry) {
  await cleanupInventorySales(registry);
}

module.exports = {
  cleanupRegistry,
  createTrackedInventory,
  createTrackedSale,
  item,
  prisma,
  saleSnapshot,
};