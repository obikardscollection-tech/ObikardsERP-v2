const assert = require("node:assert/strict");
const { test } = require("node:test");
const { updateSale } = require("../src/services/sales/updateSaleService");
const {
  cleanupRegistry, createTrackedInventory, createTrackedSale, item, prisma, saleSnapshot,
} = require("./salesTestHelpers");

test("Sales update and rollback regression", async (t) => {
  const registry = { inventoryIds: [], saleIds: [] };

  try {
    await t.test("header update preserves lines, totals, stock, and movements", async () => {
      const inventory = await createTrackedInventory(registry, { quantity: 4 });
      const sale = await createTrackedSale(registry, [item(inventory, 1, 30)]);
      const before = await saleSnapshot(sale.id, [inventory.id]);
      await updateSale(sale.id, { customerName: "Updated Customer" });
      const after = await saleSnapshot(sale.id, [inventory.id]);
      assert.equal(after.sale.customerName, "Updated Customer");
      assert.equal(after.sale.totalItems, before.sale.totalItems);
      assert.deepEqual(after.sale.saleItems, before.sale.saleItems);
      assert.deepEqual(after.inventories, before.inventories);
      assert.deepEqual(after.movements, before.movements);
    });

    await t.test("quantity and product changes reconcile stock", async () => {
      const first = await createTrackedInventory(registry, { quantity: 4 });
      const second = await createTrackedInventory(registry, { quantity: 5 });
      const sale = await createTrackedSale(registry, [item(first, 1, 30)]);
      await updateSale(sale.id, { items: [item(first, 2, 35)] });
      let state = await saleSnapshot(sale.id, [first.id, second.id]);
      assert.equal(state.sale.totalItems, 2);
      assert.equal(state.sale.totalAmount, 70);
      assert.equal(state.inventories.find(({ id }) => id === first.id).quantity, 2);
      await updateSale(sale.id, { items: [item(second, 1, 40)] });
      state = await saleSnapshot(sale.id, [first.id, second.id]);
      assert.equal(state.sale.saleItems.length, 1);
      assert.equal(state.sale.saleItems[0].inventoryId, second.id);
      assert.equal(state.inventories.find(({ id }) => id === first.id).quantity, 4);
      assert.equal(state.inventories.find(({ id }) => id === second.id).quantity, 4);
    });

    await t.test("insufficient replacement rolls back and status cannot cancel", async () => {
      const inventory = await createTrackedInventory(registry, { quantity: 2 });
      const sale = await createTrackedSale(registry, [item(inventory, 1, 30)]);
      const before = await saleSnapshot(sale.id, [inventory.id]);
      await assert.rejects(
        () => updateSale(sale.id, { items: [item(inventory, 4, 30)] }),
        /stock insuffisant/i
      );
      assert.deepEqual(await saleSnapshot(sale.id, [inventory.id]), before);
      await assert.rejects(() => updateSale(sale.id, { status: "CANCELLED" }), /action d'annulation/i);
      assert.deepEqual(await saleSnapshot(sale.id, [inventory.id]), before);
    });
  } finally {
    await cleanupRegistry(registry);
    await prisma.$disconnect();
  }
});