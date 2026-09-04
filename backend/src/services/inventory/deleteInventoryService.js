const prisma = require("../../lib/prisma");
const {
  removeStagedInventoryPhotoFiles,
  restoreStagedInventoryPhotoFiles,
  stageInventoryPhotoFiles,
} = require("./inventoryPhotoService");

async function deleteInventory(id) {
  const inventory = await prisma.inventory.findUnique({
    where: { id },
    include: {
      saleItems: true,
      stockMovements: true,
    },
  });

  if (!inventory) {
    throw new Error("Inventory introuvable.");
  }

  if ((inventory.saleItems || []).length > 0) {
    throw new Error("Impossible de supprimer un inventory référencé par une vente.");
  }

  if ((inventory.stockMovements || []).length > 0) {
    throw new Error("Impossible de supprimer un inventory ayant un historique de mouvement de stock.");
  }

  const stagedFiles = await stageInventoryPhotoFiles(inventory);

  try {
    await prisma.inventory.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    await restoreStagedInventoryPhotoFiles(stagedFiles);
    throw error;
  }

  await removeStagedInventoryPhotoFiles(stagedFiles);

  return {
    success: true,
  };
}

module.exports = {
  deleteInventory,
};