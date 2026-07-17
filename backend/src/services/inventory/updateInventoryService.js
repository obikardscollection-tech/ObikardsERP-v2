const prisma = require("../../lib/prisma");

const inventoryMapper = require("./mappers/inventoryMapper");
const { resolveInventoryMarketIntegration } = require("./marketAutoLinkService");
const { createMarketSnapshot } = require("../../modules/market/snapshots");

/**
 * Merge current inventory item with incoming update payload.
 * @param {object} currentItem
 * @param {object} data
 * @param {object} mappedData
 * @returns {object}
 */
function createInventoryMarketInput(currentItem, data, mappedData) {
  return {
    player: data.player !== undefined ? data.player : currentItem.player,
    year: data.year !== undefined ? data.year : currentItem.year,
    set: data.set !== undefined ? data.set : undefined,
    series: mappedData.series !== undefined ? mappedData.series : currentItem.series,
    cardNumber: data.cardNumber !== undefined ? data.cardNumber : currentItem.cardNumber,
    parallel: data.parallel !== undefined ? data.parallel : currentItem.parallel,
    variation: data.variation !== undefined ? data.variation : currentItem.variation,
    grade: data.grade !== undefined ? data.grade : currentItem.grade,
    purchasePrice:
      data.purchasePrice !== undefined ? data.purchasePrice : currentItem.purchasePrice,
    fees: data.fees !== undefined ? data.fees : null,
    exchangeRate: data.exchangeRate !== undefined ? data.exchangeRate : null,
  };
}

async function updateInventory(id, data) {
  const existingItem = await prisma.inventory.findUnique({
    where: {
      id,
    },
  });

  if (!existingItem) {
    throw new Error("Inventory introuvable.");
  }

  const mappedData = inventoryMapper(data);
  const marketInput = createInventoryMarketInput(existingItem, data, mappedData);
  const marketIntegration = await resolveInventoryMarketIntegration(marketInput);

  const item = await prisma.$transaction(async (tx) => {
    const updatedItem = await tx.inventory.update({
      where: {
        id,
      },

      data: {
        ...mappedData,
        ...marketIntegration.patch,
      },
    });

    if (marketIntegration.refreshResult) {
      await createMarketSnapshot({
        inventoryId: updatedItem.id,
        refreshResult: marketIntegration.refreshResult,
        db: tx,
      });
    }

    return updatedItem;
  });

  return item;
}

module.exports = {
  updateInventory,
};