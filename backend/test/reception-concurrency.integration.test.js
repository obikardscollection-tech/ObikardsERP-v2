const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const assert = require("node:assert/strict");
const { test } = require("node:test");
const prisma = require("../src/lib/prisma");
const { createReception } = require("../src/services/receptions/createReceptionService");

const suffix = `${Date.now()}-${process.pid}`;
const note = `SPRINT22_RECEPTION_${suffix}`;
let supplierId;
let purchaseId;
let purchaseItemId;

async function createFixture() {
  const supplier = await prisma.supplier.create({
    data: { supplierNumber: `SUP-S22-${suffix}`, name: `Supplier ${suffix}`, notes: note },
  });
  supplierId = supplier.id;

  const purchase = await prisma.purchase.create({
    data: {
      purchaseNumber: `PUR-S22-${suffix}`,
      supplierId,
      platform: "DIRECT",
      status: "PENDING",
      totalItems: 4,
      totalAmount: 40,
      notes: note,
      purchaseItems: {
        create: { name: `Reception ${suffix}`, quantity: 4, unitPrice: 10, totalPrice: 40, notes: note },
      },
    },
    include: { purchaseItems: true },
  });
  purchaseId = purchase.id;
  purchaseItemId = purchase.purchaseItems[0].id;
}

async function cleanup() {
  if (purchaseId) {
    await prisma.stockMovement.deleteMany({ where: { purchaseId } });
    await prisma.inventory.deleteMany({ where: { purchaseItemId } });
    await prisma.reception.deleteMany({ where: { purchaseId } });
    await prisma.purchase.deleteMany({ where: { id: purchaseId } });
  }
  if (supplierId) await prisma.supplier.deleteMany({ where: { id: supplierId } });
}

function receptionPayload(quantityReceived, idempotencyKey) {
  return {
    purchaseId,
    idempotencyKey,
    notes: note,
    items: [{ purchaseItemId, quantityReceived, notes: note }],
  };
}

test("Reception partial, idempotency, and concurrency regression", async (t) => {
  await createFixture();
  try {
    let firstReception;

    await t.test("partial reception updates status and stock once", async () => {
      firstReception = await createReception(receptionPayload(1, `${note}_PARTIAL`));
      const [purchase, inventoryTotal, movementTotal] = await Promise.all([
        prisma.purchase.findUnique({ where: { id: purchaseId } }),
        prisma.inventory.aggregate({ where: { purchaseItemId }, _sum: { quantity: true } }),
        prisma.stockMovement.aggregate({ where: { purchaseId }, _sum: { quantity: true } }),
      ]);
      assert.equal(purchase.status, "PARTIALLY_RECEIVED");
      assert.equal(inventoryTotal._sum.quantity, 1);
      assert.equal(movementTotal._sum.quantity, 1);
    });

    await t.test("same idempotency key returns the same reception", async () => {
      const repeated = await createReception(receptionPayload(1, `${note}_PARTIAL`));
      assert.equal(repeated.id, firstReception.id);
      assert.equal(await prisma.reception.count({ where: { purchaseId } }), 1);
      assert.equal(await prisma.inventory.count({ where: { purchaseItemId } }), 1);
    });

    await t.test("concurrent requests cannot over-receive remaining stock", async () => {
      const results = await Promise.allSettled([
        createReception(receptionPayload(3, `${note}_CONCURRENT_A`)),
        createReception(receptionPayload(3, `${note}_CONCURRENT_B`)),
      ]);
      assert.equal(results.filter(({ status }) => status === "fulfilled").length, 1);
      assert.equal(results.filter(({ status }) => status === "rejected").length, 1);

      const [purchase, receptions, inventoryTotal, movementTotal] = await Promise.all([
        prisma.purchase.findUnique({ where: { id: purchaseId } }),
        prisma.reception.count({ where: { purchaseId } }),
        prisma.inventory.aggregate({ where: { purchaseItemId }, _sum: { quantity: true } }),
        prisma.stockMovement.aggregate({ where: { purchaseId }, _sum: { quantity: true } }),
      ]);
      assert.equal(purchase.status, "RECEIVED");
      assert.equal(receptions, 2);
      assert.equal(inventoryTotal._sum.quantity, 4);
      assert.equal(movementTotal._sum.quantity, 4);
    });
  } finally {
    await cleanup();
    assert.equal(await prisma.purchase.count({ where: { notes: note } }), 0);
    assert.equal(await prisma.inventory.count({ where: { notes: note } }), 0);
    await prisma.$disconnect();
  }
});