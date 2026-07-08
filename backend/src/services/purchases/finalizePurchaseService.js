const prisma = require("../../lib/prisma");

async function finalizePurchase(purchaseId) {
  const purchase = await prisma.purchase.update({
    where: {
      id: purchaseId,
    },
    data: {
      status: "RECEIVED",
    },
  });

  return purchase;
}

module.exports = {
  finalizePurchase,
};