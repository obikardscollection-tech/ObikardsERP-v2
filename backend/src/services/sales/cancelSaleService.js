const prisma = require("../../lib/prisma");

async function cancelSale(id) {
  const existingSale = await prisma.sale.findUnique({
    where: {
      id,
    },
  });

  if (!existingSale) {
    throw new Error("Vente introuvable.");
  }

  const sale = await prisma.sale.update({
    where: {
      id,
    },
    data: {
      status: "CANCELLED",
      isCancelled: true,
    },
  });

  return sale;
}

module.exports = {
  cancelSale,
};
