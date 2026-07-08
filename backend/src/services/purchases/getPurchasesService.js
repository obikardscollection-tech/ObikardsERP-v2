const prisma = require("../../lib/prisma");

async function getPurchases() {
  const purchases = await prisma.purchase.findMany({
    include: {
      supplier: true,
      purchaseItems: {
        include: {
          inventory: true,
        },
      },
    },
    orderBy: {
      purchasedAt: "desc",
    },
  });

  return purchases;
}

module.exports = {
  getPurchases,
};