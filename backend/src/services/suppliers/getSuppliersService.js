const prisma = require("../../lib/prisma");

async function getSuppliers() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return suppliers;
}

module.exports = {
  getSuppliers,
};