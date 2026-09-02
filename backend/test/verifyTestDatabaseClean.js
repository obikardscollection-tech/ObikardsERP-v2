const assert = require("node:assert/strict");
const prisma = require("../src/lib/prisma");

async function main() {
  const counts = await Promise.all([
    prisma.authSession.count(),
    prisma.user.count(),
    prisma.stockMovement.count(),
    prisma.saleItem.count(),
    prisma.sale.count(),
    prisma.inventory.count(),
    prisma.receptionItem.count(),
    prisma.reception.count(),
    prisma.purchaseItem.count(),
    prisma.purchase.count(),
    prisma.expense.count(),
    prisma.customer.count(),
    prisma.supplier.count(),
  ]);

  assert.deepEqual(counts, Array(counts.length).fill(0), "La base de test contient des donnees residuelles.");
  console.log(`Test database cleanup verified: ${counts.length} tables empty.`);
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });