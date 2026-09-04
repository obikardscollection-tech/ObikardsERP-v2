const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const testRoot = path.join(os.tmpdir(), `obikards-backup-restore-${process.pid}`);
process.env.BACKUP_DIR = path.join(testRoot, "backups");
process.env.INVENTORY_PHOTO_DIR = path.join(testRoot, "source-photos");

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { PrismaClient } = require("@prisma/client");
const prisma = require("../src/lib/prisma");
const { createBackup } = require("../src/services/backup/backupService");
const { restoreBackup, restoreBackupToTarget } = require("../src/services/backup/restoreService");

const restoreDatabaseUrl = process.env.TEST_RESTORE_DATABASE_URL;

test("Sprint 28 real backup restores database and photos", {
  skip: restoreDatabaseUrl ? false : "TEST_RESTORE_DATABASE_URL non configuree",
}, async () => {
  const marker = `SPRINT28_${Date.now()}_${process.pid}`;
  const created = {};
  const photoNames = {
    front: `${crypto.randomUUID()}.png`,
    back: `${crypto.randomUUID()}.jpg`,
    extra: [`${crypto.randomUUID()}.webp`, `${crypto.randomUUID()}.png`],
  };
  const photoBuffers = new Map([
    [photoNames.front, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1])],
    [photoNames.back, Buffer.from([255, 216, 255, 1])],
    [photoNames.extra[0], Buffer.from("RIFF1234WEBPpayload", "ascii")],
    [photoNames.extra[1], Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 2])],
  ]);
  const targetPhotos = path.join(testRoot, "restored-photos");
  let targetClient;

  try {
    await fs.mkdir(process.env.INVENTORY_PHOTO_DIR, { recursive: true });
    for (const [filename, buffer] of photoBuffers) {
      await fs.writeFile(path.join(process.env.INVENTORY_PHOTO_DIR, filename), buffer);
    }

    created.user = await prisma.user.create({ data: {
      email: `${marker.toLowerCase()}@example.test`, passwordHash: "argon2-test-hash", displayName: marker, role: "ADMIN",
    } });
    created.session = await prisma.authSession.create({ data: {
      userId: created.user.id, tokenHash: crypto.createHash("sha256").update(marker).digest("hex"), expiresAt: new Date(Date.now() + 3600000),
    } });
    created.customer = await prisma.customer.create({ data: { customerNumber: `${marker}_C`, firstName: marker } });
    created.supplier = await prisma.supplier.create({ data: { supplierNumber: `${marker}_S`, name: marker } });
    created.cardReference = await prisma.cardReference.create({ data: {
      sport: "BASEBALL", year: 2026, player: marker, referenceFingerprint: `${marker}_REF`,
    } });
    created.purchase = await prisma.purchase.create({ data: {
      purchaseNumber: `${marker}_P`, supplierId: created.supplier.id, platform: "DIRECT", status: "RECEIVED", totalItems: 3, totalAmount: 30,
    } });
    created.purchaseItem = await prisma.purchaseItem.create({ data: {
      purchaseId: created.purchase.id, name: marker, quantity: 3, unitPrice: 10, totalPrice: 30, inventoryCreated: true,
    } });
    created.reception = await prisma.reception.create({ data: {
      receptionNumber: `${marker}_R`, purchaseId: created.purchase.id, totalQuantity: 3, remainingQuantity: 0,
    } });
    created.receptionItem = await prisma.receptionItem.create({ data: {
      receptionId: created.reception.id, purchaseItemId: created.purchaseItem.id, quantityReceived: 3, quantityRemaining: 0, inventoryCreated: true,
    } });
    created.inventory = await prisma.inventory.create({ data: {
      sku: `${marker}_SKU`, category: "TEST", title: marker, quantity: 3, purchasePrice: 10,
      cardReferenceId: created.cardReference.id, purchaseItemId: created.purchaseItem.id, receptionItemId: created.receptionItem.id,
      frontPhoto: photoNames.front, backPhoto: photoNames.back, extraPhotos: photoNames.extra,
    } });
    created.movement = await prisma.stockMovement.create({ data: {
      inventoryId: created.inventory.id, type: "RECEIPT", source: "PURCHASE", quantity: 3, previousQuantity: 0, newQuantity: 3,
      purchaseId: created.purchase.id, receptionId: created.reception.id,
    } });
    created.sale = await prisma.sale.create({ data: {
      orderNumber: `${marker}_SALE`, platform: "DIRECT", status: "COMPLETED", customerId: created.customer.id,
      totalItems: 1, totalAmount: 25, profit: 15,
    } });
    created.saleItem = await prisma.saleItem.create({ data: {
      saleId: created.sale.id, inventoryId: created.inventory.id, quantity: 1, unitPrice: 25, totalPrice: 25,
      purchasePriceSnapshot: 10, profitSnapshot: 15,
    } });
    created.expense = await prisma.expense.create({ data: {
      expenseNumber: `${marker}_E`, category: "SHIPPING", supplierId: created.supplier.id, title: marker,
      amountHT: 10, tax: 2, amountTTC: 12, paymentMethod: "CARD", paymentStatus: "PAID", expenseDate: new Date(),
    } });

    const backup = await createBackup();
    assert.equal(backup.photoCount, 4);
    assert.equal(backup.photos.length, 4);

    await prisma.inventory.update({ where: { id: created.inventory.id }, data: { quantity: 99 } });
    await prisma.expense.delete({ where: { id: created.expense.id } });
    await fs.writeFile(
      path.join(process.env.INVENTORY_PHOTO_DIR, photoNames.front),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 99])
    );

    const inPlaceRestore = await restoreBackup(backup.filename);
    assert.equal(inPlaceRestore.restored, true);
    assert.equal(inPlaceRestore.sessionsPurged, true);
    assert.equal((await prisma.inventory.findUnique({ where: { id: created.inventory.id } })).quantity, 3);
    assert.equal(await prisma.expense.count({ where: { id: created.expense.id } }), 1);
    assert.equal(await prisma.authSession.count(), 0);
    assert.deepEqual(
      await fs.readFile(path.join(process.env.INVENTORY_PHOTO_DIR, photoNames.front)),
      photoBuffers.get(photoNames.front)
    );

    const restored = await restoreBackupToTarget(backup.filename, {
      databaseUrl: restoreDatabaseUrl,
      photoDirectory: targetPhotos,
    });
    assert.equal(restored.restored, true);
    assert.equal(restored.sessionsPurged, true);

    targetClient = new PrismaClient({ datasources: { db: { url: restoreDatabaseUrl } } });
    const restoredInventory = await targetClient.inventory.findUnique({ where: { id: created.inventory.id } });
    assert.equal(restoredInventory.quantity, 3);
    assert.equal(restoredInventory.frontPhoto, photoNames.front);
    assert.equal(restoredInventory.backPhoto, photoNames.back);
    assert.deepEqual(restoredInventory.extraPhotos, photoNames.extra);
    for (const filename of photoBuffers.keys()) {
      assert.deepEqual(await fs.readFile(path.join(targetPhotos, filename)), photoBuffers.get(filename));
    }
    const counts = await Promise.all([
      targetClient.user.count({ where: { id: created.user.id } }),
      targetClient.authSession.count(),
      targetClient.customer.count({ where: { id: created.customer.id } }),
      targetClient.supplier.count({ where: { id: created.supplier.id } }),
      targetClient.expense.count({ where: { id: created.expense.id } }),
      targetClient.purchase.count({ where: { id: created.purchase.id } }),
      targetClient.purchaseItem.count({ where: { id: created.purchaseItem.id } }),
      targetClient.reception.count({ where: { id: created.reception.id } }),
      targetClient.receptionItem.count({ where: { id: created.receptionItem.id } }),
      targetClient.stockMovement.count({ where: { id: created.movement.id } }),
      targetClient.sale.count({ where: { id: created.sale.id } }),
      targetClient.saleItem.count({ where: { id: created.saleItem.id } }),
      targetClient.cardReference.count({ where: { id: created.cardReference.id } }),
    ]);
    assert.deepEqual(counts, [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  } finally {
    await targetClient?.$disconnect();
    if (created.sale) await prisma.sale.deleteMany({ where: { id: created.sale.id } });
    if (created.expense) await prisma.expense.deleteMany({ where: { id: created.expense.id } });
    if (created.inventory) await prisma.inventory.deleteMany({ where: { id: created.inventory.id } });
    if (created.reception) await prisma.reception.deleteMany({ where: { id: created.reception.id } });
    if (created.purchase) await prisma.purchase.deleteMany({ where: { id: created.purchase.id } });
    if (created.cardReference) await prisma.cardReference.deleteMany({ where: { id: created.cardReference.id } });
    if (created.customer) await prisma.customer.deleteMany({ where: { id: created.customer.id } });
    if (created.supplier) await prisma.supplier.deleteMany({ where: { id: created.supplier.id } });
    if (created.user) await prisma.user.deleteMany({ where: { id: created.user.id } });
    await fs.rm(testRoot, { recursive: true, force: true });
    await prisma.$disconnect();
  }
});