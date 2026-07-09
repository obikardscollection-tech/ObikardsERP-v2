async function updatePurchaseReceptionState(tx, purchaseId) {
  const purchase = await tx.purchase.findUnique({
    where: {
      id: purchaseId,
    },
    include: {
      purchaseItems: {
        include: {
          receptionItems: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new Error("Achat introuvable.");
  }

  const totalOrdered = purchase.purchaseItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const totalReceived = purchase.purchaseItems.reduce(
    (total, item) => {
      const received = item.receptionItems.reduce(
        (itemTotal, receptionItem) =>
          itemTotal +
          Number(receptionItem.quantityReceived || 0),
        0
      );

      return total + received;
    },
    0
  );

  let status = "PENDING";

  if (totalReceived >= totalOrdered && totalOrdered > 0) {
    status = "RECEIVED";
  } else if (totalReceived > 0) {
    status = "PARTIALLY_RECEIVED";
  }

  for (const purchaseItem of purchase.purchaseItems) {
    const received = purchaseItem.receptionItems.reduce(
      (total, receptionItem) =>
        total + Number(receptionItem.quantityReceived || 0),
      0
    );

    await tx.purchaseItem.update({
      where: {
        id: purchaseItem.id,
      },
      data: {
        inventoryCreated:
          received >= Number(purchaseItem.quantity || 0),
      },
    });
  }

  return tx.purchase.update({
    where: {
      id: purchaseId,
    },
    data: {
      status,
    },
  });
}

module.exports = {
  updatePurchaseReceptionState,
};
