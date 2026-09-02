const prisma = require("../../lib/prisma");

async function deletePurchase(id) {
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      _count: {
        select: {
          receptions: true,
        },
      },
    },
  });

  if (!existingPurchase) {
    throw new Error("Achat introuvable.");
  }

  if (existingPurchase._count.receptions > 0) {
    throw new Error(
      "Impossible de supprimer un achat partiellement ou totalement receptionne. L'historique de stock doit etre conserve."
    );
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