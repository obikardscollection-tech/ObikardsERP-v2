const prisma = require("../../lib/prisma");

async function deletePurchase(id) {
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      id,
    },
  });

  if (!existingPurchase) {
    throw new Error("Achat introuvable.");
  }

  await prisma.purchase.delete({
    where: {
      id,
    },
  });

  return {
    message: "Achat supprimé avec succès.",
  };
}

module.exports = {
  deletePurchase,
};