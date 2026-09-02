const prisma = require("../src/lib/prisma");
const { createPurchase } = require("../src/services/purchases/createPurchaseService");

const suffix = `${Date.now()}-${process.pid}`;
const prefix = `SPRINT23_${suffix}`;
let sequence = 0;
const purchaseIds = [];
let supplierId;

async function setupSupplier() {
  const supplier = await prisma.supplier.create({
    data: { supplierNumber: `SUP-${prefix}`, name: `Supplier ${prefix}`, notes: prefix },
  });
  supplierId = supplier.id;
}

async function createPendingPurchase(quantity = 5) {
  sequence += 1;
  const purchase = await createPurchase({
    supplierId,
    platform: "DIRECT",
    status: "RECEIVED",
    shippingCost: 0,
    taxes: 0,
    discount: 0,
    notes: `${prefix}_${sequence}`,
    items: [{ name: `Purchase ${sequence}`, quantity, unitPrice: 10, notes: prefix }],
  });
  purchaseIds.push(purchase.id);
  return purchase;
}

async function getState(purchase) {
  const purchaseItemId = purchase.purchaseItems[0].id;
  const [currentPurchase, receptions, inventory, movements] = await Promise.all([
    prisma.purchase.findUnique({ where: { id: purchase.id }, include: { purchaseItems: true } }),
    prisma.reception.findMany({ where: { purchaseId: purchase.id }, include: { receptionItems: true } }),
    prisma.inventory.findMany({ where: { purchaseItemId } }),
    prisma.stockMovement.findMany({ where: { purchaseId: purchase.id } }),
  ]);
  return { purchase: currentPurchase, receptions, inventory, movements };
}

function payload(purchase, quantityReceived, key) {
  return {
    purchaseId: purchase.id,
    idempotencyKey: `${prefix}_${key}`,
    notes: prefix,
    items: [{ purchaseItemId: purchase.purchaseItems[0].id, quantityReceived, notes: prefix }],
  };
}

async function cleanup() {
  await prisma.stockMovement.deleteMany({ where: { purchaseId: { in: purchaseIds } } });
  await prisma.inventory.deleteMany({ where: { purchaseItem: { purchaseId: { in: purchaseIds } } } });
  await prisma.reception.deleteMany({ where: { purchaseId: { in: purchaseIds } } });
  await prisma.purchase.deleteMany({ where: { id: { in: purchaseIds } } });
  if (supplierId) await prisma.supplier.deleteMany({ where: { id: supplierId } });
}

module.exports = {
  cleanup,
  createPendingPurchase,
  getState,
  payload,
  prefix,
  prisma,
  setupSupplier,
};