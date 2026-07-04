const prisma = require("../../lib/prisma");

async function getSupplierById(id) {
  const supplier = await prisma.supplier.findUnique({
    where: {
      id,
    },
  });

  if (!supplier) {
    throw new Error("Fournisseur introuvable.");
  }

  return supplier;
}

module.exports = {
  getSupplierById,
};