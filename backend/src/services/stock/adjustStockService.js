const prisma = require("../../lib/prisma");
const { applyInventoryQuantityDelta } = require("./createMovementService");

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
    const result = await applyInventoryQuantityDelta({
      tx,
      inventoryId,
      delta: quantity,
      type,
      source,
      reason,
      userId,
      notes: reason || "Ajustement manuel du stock",
    });

    return {
      inventoryId,
      previousQuantity: result.previousQuantity,
      newQuantity: result.newQuantity,
      movement: result.movement,
      status: result.status,
    };
  });
}

module.exports = {
  adjustStock,
};