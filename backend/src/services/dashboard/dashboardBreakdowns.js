const { toSortedArray } = require("./dashboardUtils");

function buildBreakdowns({
  salesByPlatformMap,
  purchasesByPlatformMap,
  inventoryBySportMap,
  salesBySportMap,
  totalSalesAmount,
  totalPurchasesAmount,
  estimatedStockValue,
}) {
  const activeSportsCount = Array.from(inventoryBySportMap.keys()).filter(
    (sport) => sport !== "UNSPECIFIED"
  ).length;

  return {
    breakdowns: {
      salesByPlatform: toSortedArray(salesByPlatformMap, totalSalesAmount),
      purchasesByPlatform: toSortedArray(purchasesByPlatformMap, totalPurchasesAmount),
      inventoryBySport: toSortedArray(inventoryBySportMap, estimatedStockValue),
      salesBySport: toSortedArray(salesBySportMap, totalSalesAmount),
    },
    activeSportsCount,
    activeSalesPlatformsCount: salesByPlatformMap.size,
    activePurchasePlatformsCount: purchasesByPlatformMap.size,
  };
}

module.exports = {
  buildBreakdowns,
};
