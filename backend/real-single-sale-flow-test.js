const prisma = require('./src/lib/prisma');
const { createSale } = require('./src/services/sales/createSaleService');
const { cancelSale } = require('./src/services/sales/cancelSaleService');

(async () => {
  const inventoryBefore = await prisma.inventory.findFirst({
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

  if (!inventoryBefore) {
    throw new Error('Aucun Inventory disponible pour le test réel : quantity > 0 et status = IN_STOCK est requis.');
  }

  console.log('STEP_BEFORE');
  console.log(JSON.stringify({
    inventory: {
      id: inventoryBefore.id,
      sku: inventoryBefore.sku,
      quantity: inventoryBefore.quantity,
      status: inventoryBefore.status,
    },
  }, null, 2));

  const salePayload = {
    platform: 'DIRECT',
    status: 'PENDING',
    customerId: null,
    customerName: null,
    customerEmail: null,
    shippingCost: 0,
    platformFees: 0,
    taxes: 0,
    discount: 0,
    notes: 'REAL_SINGLE_SALE_FLOW_TEST',
    items: [
      {
        inventoryId: inventoryBefore.id,
        quantity: 1,
        unitPrice: 50,
        notes: 'REAL_SINGLE_SALE_FLOW_TEST',
      },
    ],
  };

  const createdSale = await createSale(salePayload);

  const saleAfterCreate = await prisma.sale.findUnique({
    where: { id: createdSale.id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalItems: true,
      totalAmount: true,
      profit: true,
    },
  });

  const createdSaleItems = await prisma.saleItem.findMany({
    where: { saleId: createdSale.id },
    select: {
      inventoryId: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
    },
  });

  const inventoryAfterCreate = await prisma.inventory.findUnique({
    where: { id: inventoryBefore.id },
    select: {
      id: true,
      sku: true,
      quantity: true,
      status: true,
    },
  });

  const saleMovementsAfterCreate = await prisma.stockMovement.findMany({
    where: { saleId: createdSale.id, inventoryId: inventoryBefore.id },
    orderBy: { createdAt: 'asc' },
    select: {
      saleId: true,
      inventoryId: true,
      type: true,
      source: true,
      quantity: true,
      previousQuantity: true,
      newQuantity: true,
    },
  });

  console.log('STEP_AFTER_CREATE');
  console.log(JSON.stringify({
    sale: saleAfterCreate,
    saleItems: createdSaleItems,
    inventory: inventoryAfterCreate,
    stockMovements: saleMovementsAfterCreate,
  }, null, 2));

  const cancelledSale = await cancelSale(createdSale.id);

  const saleAfterCancel = await prisma.sale.findUnique({
    where: { id: createdSale.id },
    select: { id: true, status: true, isCancelled: true },
  });

  const inventoryAfterCancel = await prisma.inventory.findUnique({
    where: { id: inventoryBefore.id },
    select: { id: true, sku: true, quantity: true, status: true },
  });

  const cancellationMovements = await prisma.stockMovement.findMany({
    where: { saleId: createdSale.id, inventoryId: inventoryBefore.id, reason: 'SALE_CANCELLATION' },
    orderBy: { createdAt: 'asc' },
    select: {
      saleId: true,
      inventoryId: true,
      type: true,
      source: true,
      quantity: true,
      previousQuantity: true,
      newQuantity: true,
      reason: true,
    },
  });

  console.log('STEP_AFTER_CANCEL');
  console.log(JSON.stringify({
    cancelledSale: {
      id: cancelledSale.id,
      status: cancelledSale.status,
      isCancelled: cancelledSale.isCancelled,
    },
    saleAfterCancel,
    inventoryAfterCancel,
    cancellationMovements,
    doubleRestorationDetected: cancellationMovements.length > 1,
  }, null, 2));

  process.exit(0);
})().catch((error) => {
  const stack = error && error.stack ? error.stack : String(error);
  console.error('TEST_REAL_SINGLE_SALE_FLOW_ERROR');
  console.error(stack);
  process.exit(1);
});
