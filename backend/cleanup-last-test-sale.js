const prisma = require('./src/lib/prisma');

(async () => {
  const targetSaleId = 'cmtalio430001sv70awz7lca2';
  const targetInventoryId = 'cmt9wyuu30000svm4recehjp8';

  const beforeSale = await prisma.sale.findUnique({
    where: { id: targetSaleId },
    include: { saleItems: true },
  });

  const beforeInventory = await prisma.inventory.findUnique({
    where: { id: targetInventoryId },
    select: {
      id: true,
      sku: true,
      quantity: true,
      status: true,
    },
  });

  const beforeMovements = await prisma.stockMovement.findMany({
    where: { saleId: targetSaleId },
    select: {
      id: true,
      saleId: true,
      inventoryId: true,
      type: true,
      source: true,
      quantity: true,
      previousQuantity: true,
      newQuantity: true,
      reason: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('BEFORE');
  console.log(JSON.stringify({
    sale: beforeSale,
    inventory: beforeInventory,
    stockMovements: beforeMovements,
  }, null, 2));

  await prisma.$transaction(async (tx) => {
    const saleItems = await tx.saleItem.findMany({
      where: { saleId: targetSaleId },
      select: { id: true },
    });

    if (saleItems.length > 0) {
      await tx.saleItem.deleteMany({
        where: { saleId: targetSaleId },
      });
    }

    await tx.sale.delete({
      where: { id: targetSaleId },
    });
  });

  const afterSale = await prisma.sale.findUnique({
    where: { id: targetSaleId },
  });

  const afterSaleItems = await prisma.saleItem.findMany({
    where: { saleId: targetSaleId },
  });

  const afterInventory = await prisma.inventory.findUnique({
    where: { id: targetInventoryId },
    select: {
      id: true,
      sku: true,
      quantity: true,
      status: true,
    },
  });

  const afterMovements = await prisma.stockMovement.findMany({
    where: { saleId: targetSaleId },
    select: {
      id: true,
      saleId: true,
      inventoryId: true,
      type: true,
      source: true,
      quantity: true,
      previousQuantity: true,
      newQuantity: true,
      reason: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('AFTER');
  console.log(JSON.stringify({
    sale: afterSale,
    saleItems: afterSaleItems,
    inventory: afterInventory,
    stockMovements: afterMovements,
  }, null, 2));

  process.exit(0);
})().catch((error) => {
  console.error('ERROR');
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
