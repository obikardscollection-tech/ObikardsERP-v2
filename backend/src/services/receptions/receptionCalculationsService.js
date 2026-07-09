function normalizeReceptionItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Au moins une ligne de reception est obligatoire.");
  }

  return items.map((item) => ({
    ...item,
    purchaseItemId: item.purchaseItemId,
    quantityReceived: Number(item.quantityReceived || item.quantity || 0),
    notes: item.notes || null,
  }));
}

function getTotalOrdered(purchase) {
  return purchase.purchaseItems.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);
}

function indexPurchaseItems(purchase) {
  return purchase.purchaseItems.reduce((index, item) => {
    index[item.id] = item;

    return index;
  }, {});
}

async function getReceivedQuantities(
  tx,
  purchaseId,
  excludedReceptionId = null
) {
  const receptionItems =
    await tx.receptionItem.findMany({
      where: {
        purchaseItem: {
          purchaseId,
        },
        ...(excludedReceptionId
          ? {
              receptionId: {
                not: excludedReceptionId,
              },
            }
          : {}),
      },
    });

  return receptionItems.reduce((totals, item) => {
    totals[item.purchaseItemId] =
      (totals[item.purchaseItemId] || 0) +
      Number(item.quantityReceived || 0);

    return totals;
  }, {});
}

function validateReceptionPlan(
  purchase,
  items,
  receivedQuantities
) {
  const purchaseItemsById =
    indexPurchaseItems(purchase);

  const seenPurchaseItems = new Set();

  const plannedItems = items.map((item) => {
    if (!item.purchaseItemId) {
      throw new Error("purchaseItemId est obligatoire.");
    }

    if (seenPurchaseItems.has(item.purchaseItemId)) {
      throw new Error(
        "Une ligne d'achat ne peut etre recue qu'une seule fois par reception."
      );
    }

    seenPurchaseItems.add(item.purchaseItemId);

    const purchaseItem =
      purchaseItemsById[item.purchaseItemId];

    if (!purchaseItem) {
      throw new Error(
        `Ligne d'achat introuvable : ${item.purchaseItemId}.`
      );
    }

    if (item.quantityReceived <= 0) {
      throw new Error(
        `La quantite recue doit etre superieure a 0 pour "${purchaseItem.name}".`
      );
    }

    const previousReceived =
      receivedQuantities[item.purchaseItemId] || 0;

    const quantityAfterReception =
      previousReceived + item.quantityReceived;

    if (
      quantityAfterReception >
      Number(purchaseItem.quantity || 0)
    ) {
      throw new Error(
        `Quantite recue superieure a la quantite commandee pour "${purchaseItem.name}".`
      );
    }

    return {
      ...item,
      purchaseItem,
      quantityRemaining:
        Number(purchaseItem.quantity || 0) -
        quantityAfterReception,
    };
  });

  const totalQuantity = plannedItems.reduce(
    (total, item) =>
      total + Number(item.quantityReceived || 0),
    0
  );

  const previousTotalReceived = Object.values(
    receivedQuantities
  ).reduce((total, quantity) => {
    return total + Number(quantity || 0);
  }, 0);

  const totalOrdered = getTotalOrdered(purchase);

  return {
    items: plannedItems,
    totalQuantity,
    remainingQuantity:
      totalOrdered - previousTotalReceived - totalQuantity,
  };
}

module.exports = {
  getReceivedQuantities,
  getTotalOrdered,
  normalizeReceptionItems,
  validateReceptionPlan,
};
