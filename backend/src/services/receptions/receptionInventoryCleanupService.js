async function deleteReceptionInventories(tx, receptionId) {
  const receptionItems =
    await tx.receptionItem.findMany({
      where: {
        receptionId,
      },
      include: {
        inventory: {
          include: {
            saleItems: true,
          },
        },
      },
    });

  for (const receptionItem of receptionItems) {
    for (const inventory of receptionItem.inventory) {
      if (inventory.saleItems.length > 0) {
        throw new Error(
          "Impossible de modifier une reception dont l'inventaire a deja ete vendu."
        );
      }
    }
  }

  for (const receptionItem of receptionItems) {
    for (const inventory of receptionItem.inventory) {
      await tx.inventory.delete({
        where: {
          id: inventory.id,
        },
      });
    }
  }
}

module.exports = {
  deleteReceptionInventories,
};
