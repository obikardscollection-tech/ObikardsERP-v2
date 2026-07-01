const prisma = require("../../lib/prisma");

async function adjustStock({
  inventoryId,
  quantity,
  type,
  source = "MANUAL",
  reason = null,
  userId = null,
}) {
  if (!inventoryId) {
    throw new Error("inventoryId est obligatoire.");
  }

  if (!Number.isInteger(quantity) || quantity === 0) {
    throw new Error("La quantité doit être un entier différent de 0.");
  }

  if (!type) {
    throw new Error("Le type de mouvement est obligatoire.");
  }

  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: {
        id: inventoryId,
      },
    });

    if (!inventory) {
      throw new Error("Article introuvable.");
    }

    const previousQuantity = inventory.quantity;
    const newQuantity = previousQuantity + quantity;

    if (newQuantity < 0) {
      throw new Error("Le stock ne peut pas être négatif.");
    }

    await tx.inventory.update({
      where: {
        id: inventoryId,
      },
      data: {
        quantity: newQuantity,
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        inventoryId,
        type,
        source,
        quantity,
        previousQuantity,
        newQuantity,
        reason,
        userId,
      },
    });

    return {
      inventoryId,
      previousQuantity,
      newQuantity,
      movement,
    };
  });
}

module.exports = {
  adjustStock,
};