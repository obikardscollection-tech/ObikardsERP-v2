const prisma = require("../../lib/prisma");

async function getSale(id) {
  const sale = await prisma.sale.findUnique({
    where: {
      id,
    },
    include: {
      saleItems: true,
    },
  });

  if (!sale) {
    throw new Error("Vente introuvable.");
  }

  return sale;
}

module.exports = {
  getSale,
};
