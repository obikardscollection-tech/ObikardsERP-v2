const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createInventory } = require("../src/services/inventory/createInventoryService");
const { updateInventory } = require("../src/services/inventory/updateInventoryService");
const { deleteInventory } = require("../src/services/inventory/deleteInventoryService");
const { adjustStock } = require("../src/services/stock/adjustStockService");
const { applyInventoryQuantityDelta } = require("../src/services/stock/createMovementService");
const {
  cleanupInventorySales, createTestInventory, prisma, uniqueLabel,
} = require("./erpTestFixtures");

test("Inventory and Stock critical regression", async (t) => {
  const inventoryIds = [];
  const track = (inventory) => (inventoryIds.push(inventory.id), inventory);

  try {
    await t.test("zero and positive creation produce exact initial stock", async () => {
      const zero = track(await createTestInventory({ quantity: 0 }));
      const positive = track(await createTestInventory({ quantity: 2 }));
      assert.equal(zero.quantity, 0);
      assert.equal(await prisma.stockMovement.count({ where: { inventoryId: zero.id } }), 0);
      const movements = await prisma.stockMovement.findMany({ where: { inventoryId: positive.id } });
      assert.equal(positive.quantity, 2);
      assert.equal(positive.status, "IN_STOCK");
      assert.deepEqual(
        movements.map(({ quantity, previousQuantity, newQuantity, type, source, reason }) => (
          { quantity, previousQuantity, newQuantity, type, source, reason }
        )),
        [{ quantity: 2, previousQuantity: 0, newQuantity: 2, type: "INVENTORY", source: "INVENTORY", reason: "INITIAL_INVENTORY_STOCK" }]
      );
    });

    await t.test("partial metadata update preserves omitted fields and stock", async () => {
      const inventory = track(await createTestInventory({ quantity: 2, team: "Original Team" }));
      const beforeMovements = await prisma.stockMovement.findMany({ where: { inventoryId: inventory.id } });
      const updated = await updateInventory(inventory.id, { notes: uniqueLabel("UPDATED") });
      const afterMovements = await prisma.stockMovement.findMany({ where: { inventoryId: inventory.id } });
      assert.equal(updated.team, "Original Team");
      assert.equal(updated.quantity, 2);
      assert.equal(updated.status, "IN_STOCK");
      assert.equal(updated.sku, inventory.sku);
      assert.deepEqual(afterMovements.map(({ id }) => id), beforeMovements.map(({ id }) => id));
    });

    await t.test("positive, negative, and zero deltas remain coherent", async () => {
      const inventory = track(await createTestInventory({ quantity: 2 }));
      await adjustStock({ inventoryId: inventory.id, quantity: 3, type: "ADJUSTMENT", reason: "S24_INCREASE" });
      await adjustStock({ inventoryId: inventory.id, quantity: -2, type: "ADJUSTMENT", reason: "S24_DECREASE" });
      const beforeZero = await prisma.stockMovement.count({ where: { inventoryId: inventory.id } });
      const zero = await applyInventoryQuantityDelta({ inventoryId: inventory.id, delta: 0 });
      const current = await prisma.inventory.findUnique({ where: { id: inventory.id } });
      const movements = await prisma.stockMovement.findMany({ where: { inventoryId: inventory.id }, orderBy: { createdAt: "asc" } });
      assert.equal(current.quantity, 3);
      assert.equal(zero.movement, null);
      assert.equal(movements.length, beforeZero);
      assert.deepEqual(movements.slice(-2).map(({ quantity, previousQuantity, newQuantity, source }) => (
        { quantity, previousQuantity, newQuantity, source }
      )), [
        { quantity: 3, previousQuantity: 2, newQuantity: 5, source: "MANUAL" },
        { quantity: -2, previousQuantity: 5, newQuantity: 3, source: "MANUAL" },
      ]);
      await assert.rejects(
        () => adjustStock({ inventoryId: inventory.id, quantity: 0, type: "ADJUSTMENT" }),
        /différent de 0|different de 0/i
      );
    });

    await t.test("negative stock is rejected atomically", async () => {
      const inventory = track(await createTestInventory({ quantity: 1 }));
      const before = await snapshot(inventory.id);
      await assert.rejects(
        () => adjustStock({ inventoryId: inventory.id, quantity: -2, type: "ADJUSTMENT" }),
        /négatif|negatif/i
      );
      assert.deepEqual(await snapshot(inventory.id), before);
    });

    await t.test("deletion protects movement history and permits pristine rows", async () => {
      const protectedInventory = track(await createTestInventory({ quantity: 1 }));
      await assert.rejects(() => deleteInventory(protectedInventory.id), /historique de mouvement/i);
      const pristine = track(await createInventory({
        sport: "Basketball", brand: uniqueLabel("PRISTINE"), quantity: 0,
      }));
      assert.deepEqual(await deleteInventory(pristine.id), { success: true });
      inventoryIds.splice(inventoryIds.indexOf(pristine.id), 1);
    });
  } finally {
    await cleanupInventorySales({ inventoryIds });
    await prisma.$disconnect();
  }
});

async function snapshot(inventoryId) {
  const [inventory, movements] = await Promise.all([
    prisma.inventory.findUnique({ where: { id: inventoryId } }),
    prisma.stockMovement.findMany({ where: { inventoryId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
  ]);
  return { inventory, movements };
}