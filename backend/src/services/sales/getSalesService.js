const prisma = require("../../lib/prisma");

async function getSales() {
  return prisma.sale.findMany({
    include: {
      saleItems: true,
    },

    orderBy: {
      soldAt: "desc",
    },
  });
}

module.exports = {
  getSales,
};