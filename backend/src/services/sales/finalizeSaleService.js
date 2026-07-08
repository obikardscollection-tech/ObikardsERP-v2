async function finalizeSale(tx, items) {
  for (const item of items) {
    const inventory = await tx.inventory.findUnique({
      where: {
        id: item.inventoryId,
      },
    });

    if (!inventory) {
      throw new Error(`Article introuvable : ${item.inventoryId}`);
    }

    const newQuantity = inventory.quantity - Number(item.quantity);

    await tx.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        quantity: newQuantity,
        status: newQuantity > 0 ? "IN_STOCK" : "SOLD",
      },
    });
  }
}

module.exports = {
  finalizeSale,
};