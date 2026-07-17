const prisma = require("../../lib/prisma");

const inventoryMapper = require("./mappers/inventoryMapper");
const { resolveInventoryMarketPatch } = require("./marketAutoLinkService");

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
  const marketPatch = await resolveInventoryMarketPatch(marketInput);

  const item = await prisma.inventory.update({
    where: {
      id,
    },

    data: {
      ...mappedData,
      ...marketPatch,
    },
  });

  return item;
}

module.exports = {
  updateInventory,
};