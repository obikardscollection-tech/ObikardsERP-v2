const assert = require("node:assert/strict");
const { test } = require("node:test");
const { cancelSale } = require("../src/services/sales/cancelSaleService");
const {
  cleanupRegistry, createTrackedInventory, createTrackedSale, item, prisma, saleSnapshot,
} = require("./salesTestHelpers");

test("Sales creation and cancellation regression", async (t) => {
  const registry = { inventoryIds: [], saleIds: [] };

  try {
    await t.test("single sale uses server calculations and decreases stock", async () => {
      const inventory = await createTrackedInventory(registry, { quantity: 3, purchasePrice: 10 });
      const sale = await createTrackedSale(registry, [item(inventory, 1, 30)]);
      const state = await saleSnapshot(sale.id, [inventory.id]);
      assert.equal(state.sale.totalItems, 1);
      assert.equal(state.sale.totalAmount, 30);
      assert.equal(state.sale.profit, 20);
      assert.equal(state.sale.saleItems[0].purchasePriceSnapshot, 10);
      assert.equal(state.inventories[0].quantity, 2);
      assert.deepEqual(
        state.movements.map(({ type, source, quantity, previousQuantity, newQuantity }) => (
          { type, source, quantity, previousQuantity, newQuantity }
        )),
        [{ type: "SALE", source: "SALE", quantity: -1, previousQuantity: 3, newQuantity: 2 }]
      );
    });

    await t.test("multi-line sale calculates every line on the server", async () => {
      const first = await createTrackedInventory(registry, { quantity: 3, purchasePrice: 10 });
      const second = await createTrackedInventory(registry, { quantity: 4, purchasePrice: 10 });
      const sale = await createTrackedSale(registry, [item(first, 1, 30), item(second, 2, 40)]);
      const state = await saleSnapshot(sale.id, [first.id, second.id]);
      assert.equal(state.sale.totalItems, 3);
      assert.equal(state.sale.totalAmount, 110);
      assert.equal(state.sale.profit, 80);
      assert.deepEqual(state.sale.saleItems.map(({ quantity, totalPrice, profitSnapshot }) => (
        { quantity, totalPrice, profitSnapshot }
      )), [
        { quantity: 1, totalPrice: 30, profitSnapshot: 20 },
        { quantity: 2, totalPrice: 80, profitSnapshot: 60 },
      ].sort((left, right) => left.quantity - right.quantity));
      assert.equal(state.movements.length, 2);
    });

    await t.test("cancellation restores stock and cannot run twice", async () => {
      const first = await createTrackedInventory(registry, { quantity: 2 });
      const second = await createTrackedInventory(registry, { quantity: 3 });
      const sale = await createTrackedSale(registry, [item(first, 1, 30), item(second, 2, 30)]);
      await cancelSale(sale.id);
      const state = await saleSnapshot(sale.id, [first.id, second.id]);
      assert.equal(state.sale.status, "CANCELLED");
      assert.equal(state.sale.isCancelled, true);
      assert.deepEqual(state.inventories.map(({ quantity }) => quantity).sort(), [2, 3]);
      assert.equal(state.movements.filter(({ reason }) => reason === "SALE_CANCELLATION").length, 2);
      for (const inventory of state.inventories) {
        const net = state.movements
          .filter(({ inventoryId }) => inventoryId === inventory.id)
          .reduce((sum, movement) => sum + movement.quantity, 0);
        assert.equal(net, 0);
      }
      const beforeSecondCancel = await saleSnapshot(sale.id, [first.id, second.id]);
      await assert.rejects(() => cancelSale(sale.id), /déjà annulée|deja annulee/i);
      assert.deepEqual(await saleSnapshot(sale.id, [first.id, second.id]), beforeSecondCancel);
    });
  } finally {
    await cleanupRegistry(registry);
    await prisma.$disconnect();
  }
});