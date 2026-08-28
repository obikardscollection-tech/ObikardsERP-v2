const prisma = require('./src/lib/prisma');
const { createSale } = require('./src/services/sales/createSaleService');
const { cancelSale } = require('./src/services/sales/cancelSaleService');

(async () => {
  const inventory = await prisma.inventory.findFirst({
    where: { status: 'IN_STOCK', quantity: { gt: 0 } },
    select: {
      id: true,
      sku: true,
      title: true,
      quantity: true,
      status: true,
      purchasePrice: true,
    },
  });

  if (!inventory) {
    throw new Error('Aucun Inventory disponible pour validation réelle.');
  }

  const before = { sku: inventory.sku, quantity: inventory.quantity, status: inventory.status };

  const created = await createSale({
    platform: 'DIRECT',
    status: 'PENDING',
    customerId: null,
    customerName: null,
    customerEmail: null,
    shippingCost: 0,
    platformFees: 0,
    taxes: 0,
    discount: 0,
    notes: 'tmp-sale-flow-check',
    items: [{ inventoryId: inventory.id, quantity: 1, unitPrice: 50, notes: 'tmp-sale-flow-check' }],
  });

  const saleAfterCreate = await prisma.sale.findUnique({
    where: { id: created.id },
    include: { saleItems: true },
  });

  const inventoryAfterCreate = await prisma.inventory.findUnique({
    where: { id: inventory.id },
    select: { sku: true, quantity: true, status: true },
  });

  const movementAfterCreate = await prisma.stockMovement.findFirst({
    where: { saleId: created.id, inventoryId: inventory.id },
    orderBy: { createdAt: 'desc' },
  });

  const cancelled = await cancelSale(created.id);

  const inventoryAfterCancel = await prisma.inventory.findUnique({
    where: { id: inventory.id },
    select: { sku: true, quantity: true, status: true },
  });

  const saleAfterCancel = await prisma.sale.findUnique({
    where: { id: created.id },
    select: { status: true, isCancelled: true },
  });

  const movementAfterCancel = await prisma.stockMovement.findFirst({
    where: { saleId: created.id, inventoryId: inventory.id, reason: 'SALE_CANCELLATION' },
    orderBy: { createdAt: 'desc' },
  });

  console.log(JSON.stringify({
    before,
    created: {
      saleId: created.id,
      totalItems: created.totalItems,
      totalAmount: created.totalAmount,
      profit: created.profit,
    },
    saleAfterCreate: {
      id: saleAfterCreate.id,
      totalItems: saleAfterCreate.totalItems,
      status: saleAfterCreate.status,
      saleItem: saleAfterCreate.saleItems[0],
    },
    inventoryAfterCreate,
    movementAfterCreate,
    cancelled: {
      id: cancelled.id,
      status: cancelled.status,
      isCancelled: cancelled.isCancelled,
    },
    inventoryAfterCancel,
    saleAfterCancel,
    movementAfterCancel,
  }, null, 2));

  await prisma.sale.deleteMany({ where: { notes: 'tmp-sale-flow-check' } });
  await prisma.saleItem.deleteMany({ where: { notes: 'tmp-sale-flow-check' } });

  process.exit(0);
})().catch((error) => {
  console.error('ERROR:', error);
  process.exit(1);
});
