const prisma = require("../../lib/prisma");

async function getReceptions() {
  // Récupérer toutes les réceptions complètes
  const receptions = await prisma.reception.findMany({
    include: {
      purchase: {
        include: {
          supplier: true,
        },
      },
      receptionItems: {
        include: {
          purchaseItem: true,
          inventory: true,
        },
      },
    },
    orderBy: {
      receivedAt: "desc",
    },
  });

  // Récupérer les IDs des achats qui ont déjà une réception
  const purchasesWithReceptions =
    await prisma.reception.findMany({
      select: {
        purchaseId: true,
      },
      distinct: ["purchaseId"],
    });

  const purchaseIdsWithReceptions = new Set(
    purchasesWithReceptions.map((r) => r.purchaseId)
  );

  // Récupérer les achats non complètement reçus (PENDING ou PARTIALLY_RECEIVED)
  // en excluant ceux qui ont déjà une réception
  const unreceivdPurchases = await prisma.purchase.findMany({
    where: {
      status: {
        in: ["PENDING", "PARTIALLY_RECEIVED"],
      },
    },
    include: {
      supplier: true,
      purchaseItems: true,
    },
    orderBy: {
      purchasedAt: "desc",
    },
  });

  // Filtrer les achats qui n'ont pas de réception
  const purchasesWithoutReceptions = unreceivdPurchases.filter(
    (purchase) => !purchaseIdsWithReceptions.has(purchase.id)
  );

  // Transformer les achats en "réceptions virtuelles" pour l'affichage
  const virtualReceptions =
    purchasesWithoutReceptions.map((purchase) => ({
      id: `virtual-${purchase.id}`,
      receptionNumber: `PLAN-${purchase.purchaseNumber}`,
      purchaseId: purchase.id,
      purchase,
      totalQuantity: purchase.purchaseItems.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0
      ),
      remainingQuantity: purchase.purchaseItems.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0
      ),
      notes: `Plan de réception pour achat ${purchase.purchaseNumber}`,
      receivedAt: purchase.purchasedAt,
      receptionItems: purchase.purchaseItems.map(
        (item) => ({
          id: `virtual-${item.id}`,
          receptionId: `virtual-${purchase.id}`,
          purchaseItemId: item.id,
          purchaseItem: item,
          quantityReceived: 0,
          quantityRemaining: Number(
            item.quantity || 0
          ),
          inventory: [],
          inventoryCreated: false,
          notes: null,
        })
      ),
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      isVirtual: true, // Marqueur pour le frontend
    }));

  // Combiner et trier par date
  return [
    ...virtualReceptions,
    ...receptions,
  ].sort(
    (a, b) =>
      new Date(b.receivedAt) - new Date(a.receivedAt)
  );
}

module.exports = {
  getReceptions,
};
