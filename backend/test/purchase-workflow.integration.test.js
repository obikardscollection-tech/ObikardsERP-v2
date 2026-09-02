const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { updatePurchase } = require("../src/services/purchases/updatePurchaseService");
const { createReception } = require("../src/services/receptions/createReceptionService");
const {
  cleanup, createPendingPurchase, getState, payload, prefix, prisma, setupSupplier,
} = require("./purchaseWorkflowTestHelpers");

function quantityTotal(items) {
  return items.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

test("Sprint 23 Purchase to Reception workflow", async (t) => {
  await setupSupplier();
  try {
    await t.test("creation stays PENDING without Reception, Inventory, or movement", async () => {
      const purchase = await createPendingPurchase();
      const state = await getState(purchase);
      assert.equal(state.purchase.status, "PENDING");
      assert.equal(state.purchase.purchaseItems[0].quantity, 5);
      assert.equal(state.purchase.purchaseItems[0].inventoryCreated, false);
      assert.equal(state.receptions.length, 0);
      assert.equal(state.inventory.length, 0);
      assert.equal(state.movements.length, 0);
    });

    await t.test("generic update cannot override the derived status", async () => {
      const purchase = await createPendingPurchase();
      await updatePurchase(purchase.id, {
        supplierId: purchase.supplierId,
        platform: purchase.platform,
        status: "RECEIVED",
        shippingCost: purchase.shippingCost,
        taxes: purchase.taxes,
        discount: purchase.discount,
        notes: purchase.notes,
      });
      const state = await getState(purchase);
      assert.equal(state.purchase.status, "PENDING");
      assert.equal(state.receptions.length, 0);
      assert.equal(state.inventory.length, 0);
      assert.equal(state.movements.length, 0);
    });

    await t.test("complete reception creates quantity 5 and final status", async () => {
      const purchase = await createPendingPurchase();
      await createReception(payload(purchase, 5, "COMPLETE"));
      const state = await getState(purchase);
      assert.equal(state.purchase.status, "RECEIVED");
      assert.equal(state.purchase.purchaseItems[0].inventoryCreated, true);
      assert.equal(quantityTotal(state.inventory), 5);
      assert.equal(quantityTotal(state.movements), 5);
      assert.ok(state.inventory.every((item) => item.purchaseItemId && item.receptionItemId));
    });

    await t.test("partial reception 2 then 3 transitions to RECEIVED", async () => {
      const purchase = await createPendingPurchase();
      await createReception(payload(purchase, 2, "PARTIAL_A"));
      let state = await getState(purchase);
      assert.equal(state.purchase.status, "PARTIALLY_RECEIVED");
      assert.equal(state.purchase.purchaseItems[0].inventoryCreated, false);
      assert.equal(quantityTotal(state.inventory), 2);
      assert.equal(state.receptions[0].remainingQuantity, 3);
      await createReception(payload(purchase, 3, "PARTIAL_B"));
      state = await getState(purchase);
      assert.equal(state.purchase.status, "RECEIVED");
      assert.equal(state.purchase.purchaseItems[0].inventoryCreated, true);
      assert.equal(quantityTotal(state.inventory), 5);
      assert.equal(quantityTotal(state.movements), 5);
    });

    await t.test("over-reception is rejected without partial writes", async () => {
      const purchase = await createPendingPurchase();
      await createReception(payload(purchase, 3, "OVER_A"));
      const before = JSON.stringify(await getState(purchase));
      await assert.rejects(
        () => createReception(payload(purchase, 3, "OVER_B")),
        /dépasse|depasse|restante|superieure/i
      );
      assert.equal(JSON.stringify(await getState(purchase)), before);
    });

    await t.test("idempotency prevents duplicate stock and payload mismatch", async () => {
      const purchase = await createPendingPurchase();
      const first = await createReception(payload(purchase, 2, "IDEMPOTENT"));
      const repeated = await createReception(payload(purchase, 2, "IDEMPOTENT"));
      assert.equal(repeated.id, first.id);
      await assert.rejects(
        () => createReception(payload(purchase, 1, "IDEMPOTENT")),
        (error) => error.code === "RECEPTION_IDEMPOTENCY_PAYLOAD_MISMATCH"
      );
      const state = await getState(purchase);
      assert.equal(state.receptions.length, 1);
      assert.equal(quantityTotal(state.inventory), 2);
    });

    await t.test("concurrent receptions never exceed ordered quantity", async () => {
      const purchase = await createPendingPurchase();
      const results = await Promise.allSettled([
        createReception(payload(purchase, 4, "CONCURRENT_A")),
        createReception(payload(purchase, 4, "CONCURRENT_B")),
      ]);
      assert.equal(results.filter(({ status }) => status === "fulfilled").length, 1);
      const state = await getState(purchase);
      assert.equal(quantityTotal(state.inventory), 4);
      assert.ok(quantityTotal(state.inventory) <= 5);
    });

    await t.test("reception failure rolls back every projection", async () => {
      const purchase = await createPendingPurchase();
      await assert.rejects(() => createReception(payload(purchase, 0.5, "ROLLBACK")));
      const state = await getState(purchase);
      assert.equal(state.purchase.status, "PENDING");
      assert.equal(state.receptions.length, 0);
      assert.equal(state.inventory.length, 0);
      assert.equal(state.movements.length, 0);
    });
  } finally {
    await cleanup();
    assert.equal(await prisma.purchase.count({ where: { notes: { startsWith: prefix } } }), 0);
    await prisma.$disconnect();
  }
});