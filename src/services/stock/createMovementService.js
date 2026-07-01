const prisma = require("../../lib/prisma");

async function createMovement(data) {
  const movement = await prisma.stockMovement.create({
    data: {
      inventoryId: data.inventoryId,

      type: data.type,
      source: data.source || "MANUAL",

      quantity: data.quantity,

      previousQuantity: data.previousQuantity,
      newQuantity: data.newQuantity,

      reason: data.reason || null,

      userId: data.userId || null,
    },
  });

  return movement;
}

module.exports = {
  createMovement,
};