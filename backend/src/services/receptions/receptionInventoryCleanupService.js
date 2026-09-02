async function assertReceptionCanBeChanged(tx, receptionId) {
  const receptionItems =
    await tx.receptionItem.findMany({
      where: {
        receptionId,
      },
      include: {
        inventory: true,
      },
    });

  for (const receptionItem of receptionItems) {
    if (receptionItem.inventory.length > 0) {
      throw new Error(
        "Impossible de modifier ou supprimer une reception ayant genere du stock. L'historique des mouvements doit etre conserve."
      );
    }
  }
}

module.exports = {
  assertReceptionCanBeChanged,
};
