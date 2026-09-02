const prisma = require("../../lib/prisma");

const inventoryMapper = require("./mappers/inventoryMapper");
const { resolveInventoryMarketIntegration } = require("./marketAutoLinkService");
const { createMarketSnapshot } = require("../../modules/market/snapshots");
const { applyInventoryQuantityDelta } = require("../stock/createMovementService");

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
    subset: data.subset !== undefined ? data.subset : currentItem.subset,
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

  const mappedData = inventoryMapper({
    ...existingItem,
    askingPrice: existingItem.salePrice,
    ...data,
  });
  const titleFields = ["year", "brand", "player"];

  if (data.sport === undefined) {
    mappedData.category = existingItem.category;
  }

  if (data.title !== undefined) {
    mappedData.title = data.title;
  } else if (!titleFields.some((field) => data[field] !== undefined)) {
    mappedData.title = existingItem.title;
  }

  const quantityProvided = Object.prototype.hasOwnProperty.call(data, "quantity");

  if (!quantityProvided) {
    delete mappedData.quantity;
  }

  const quantityWasChanged = quantityProvided && Number(existingItem.quantity || 0) !== Number(mappedData.quantity || 0);
  const marketInput = createInventoryMarketInput(existingItem, data, mappedData);
  const marketIntegration = await resolveInventoryMarketIntegration(marketInput);

  const item = await prisma.$transaction(async (tx) => {
    const inventoryUpdateData = { ...mappedData, ...marketIntegration.patch };

    if (quantityWasChanged) {
      delete inventoryUpdateData.quantity;
    }

    const updatedItem = await tx.inventory.update({
      where: {
        id,
      },
      data: inventoryUpdateData,
    });

    if (quantityWasChanged) {
      const delta = Number(mappedData.quantity ?? 0) - Number(existingItem.quantity ?? 0);

      const result = await applyInventoryQuantityDelta({
        tx,
        inventoryId: id,
        delta,
        type: "ADJUSTMENT",
        source: "INVENTORY",
        reason: "INVENTORY_QUANTITY_UPDATE",
        notes: "Mise à jour de quantité de l'inventaire",
      });

      updatedItem.quantity = result.newQuantity;
      updatedItem.status = result.status;
    }

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

async function refreshInventoryMarket(id, explicitSportsCardsProId = null) {
  const existingItem = await prisma.inventory.findUnique({
    where: {
      id,
    },
  });

  if (!existingItem) {
    throw new Error("Inventory introuvable.");
  }

  const marketInput = {
    sport: existingItem.sport,
    player: existingItem.player,
    year: existingItem.year,
    brand: existingItem.brand,
    set: existingItem.set ?? existingItem.series,
    series: existingItem.series,
    subset: existingItem.subset ?? null,
    cardNumber: existingItem.cardNumber,
    parallel: existingItem.parallel,
    variation: existingItem.variation,
    grade: existingItem.grade,
    purchasePrice: existingItem.purchasePrice,
    fees: existingItem.fees ?? null,
    exchangeRate: existingItem.exchangeRate ?? null,
    sportsCardsProId: explicitSportsCardsProId ?? existingItem.sportsCardsProId ?? null,
  };

  const marketIntegration = await resolveInventoryMarketIntegration(marketInput);

  const item = await prisma.$transaction(async (tx) => {
    const updatedItem = await tx.inventory.update({
      where: {
        id,
      },
      data: {
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
  refreshInventoryMarket,
};