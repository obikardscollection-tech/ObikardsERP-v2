const prisma = require("../../lib/prisma");

async function deleteSupplier(id) {
  const supplier = await prisma.supplier.findUnique({
    where: {
      id,
    },
  });

  if (!supplier) {
    throw new Error("Fournisseur introuvable.");
  }

  await prisma.supplier.delete({
    where: {
      id,
    },
  });

  return {
    message: "Fournisseur supprimé avec succès.",
  };
}

module.exports = {
  deleteSupplier,
};