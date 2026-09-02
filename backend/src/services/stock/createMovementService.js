const prisma = require("../../lib/prisma");

function normalizeInventoryQuantity(value, fallback = 0) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    throw new Error("La quantité doit être un entier positif ou nul.");
  }

  return parsed;
}

function resolveStatusFromQuantity(quantity, currentStatus = "IN_STOCK") {
  if (quantity > 0) {
    return "IN_STOCK";
  }

  if (currentStatus === "SOLD") {
    return "SOLD";
  }

  return currentStatus || "IN_STOCK";
}

async function createMovement(data) {
  if (!data || !data.inventoryId) {
    throw new Error("inventoryId est obligatoire pour créer un mouvement de stock.");
  }

  const client = data.tx || prisma;
  const previousQuantity = Number(data.previousQuantity ?? 0);
  const newQuantity = Number(data.newQuantity ?? previousQuantity);
  const deltaQuantity = Number(data.quantity ?? 0);

  if (!Number.isFinite(previousQuantity) || !Number.isFinite(newQuantity) || !Number.isFinite(deltaQuantity)) {
    throw new Error("Les quantités de stock doivent être numériques.");
  }

  if (deltaQuantity !== newQuantity - previousQuantity) {
    throw new Error("Le mouvement de stock est incohérent : quantity ne correspond pas au delta entre previousQuantity et newQuantity.");
  }

  if (newQuantity < 0) {
    throw new Error("Le stock ne peut pas être négatif.");
  }

  const movement = await client.stockMovement.create({
    data: {
      inventoryId: data.inventoryId,
      type: data.type,
      source: data.source || "MANUAL",
      quantity: deltaQuantity,
      previousQuantity,
      newQuantity,
      reason: data.reason || null,
      userId: data.userId || null,
      saleId: data.saleId || null,
      purchaseId: data.purchaseId || null,
      receptionId: data.receptionId || null,
      notes: data.notes || null,
    },
  });

  return movement;
}

async function applyInventoryQuantityDelta({
  tx = prisma,
  inventoryId,
  delta,
  type = "ADJUSTMENT",
  source = "SYSTEM",
  reason = null,
  notes = null,
  userId = null,
  saleId = null,
  purchaseId = null,
  receptionId = null,
}) {
  if (!inventoryId) {
    throw new Error("inventoryId est obligatoire.");
  }

  const signedDelta = Number(delta ?? 0);

  if (!Number.isFinite(signedDelta) || !Number.isInteger(signedDelta)) {
    throw new Error("Le delta de quantité doit être un entier.");
  }

  const inventory = await tx.inventory.findUnique({
    where: { id: inventoryId },
  });

  if (!inventory) {
    throw new Error("Article introuvable.");
  }

  const previousQuantity = Number(inventory.quantity || 0);
  const newQuantity = previousQuantity + signedDelta;

  if (newQuantity < 0) {
    throw new Error("Le stock ne peut pas être négatif.");
  }

  if (signedDelta === 0) {
    return {
      inventory,
      previousQuantity,
      newQuantity,
      movement: null,
      status: inventory.status || "IN_STOCK",
    };
  }

  const nextStatus = resolveStatusFromQuantity(newQuantity, inventory.status || "IN_STOCK");

  const updatedInventory = await tx.inventory.update({
    where: { id: inventoryId },
    data: {
      quantity: newQuantity,
      status: nextStatus,
    },
  });

  const movement = await createMovement({
    tx,
    inventoryId,
    type,
    source,
    quantity: signedDelta,
    previousQuantity,
    newQuantity,
    reason,
    notes,
    userId,
    saleId,
    purchaseId,
    receptionId,
  });

  return {
    inventory: updatedInventory,
    previousQuantity,
    newQuantity,
    movement,
    status: nextStatus,
  };
}

module.exports = {
  createMovement,
  normalizeInventoryQuantity,
  resolveStatusFromQuantity,
  applyInventoryQuantityDelta,
};