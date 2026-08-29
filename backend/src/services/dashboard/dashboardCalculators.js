const { toNumber, ratio, growthRate, pushAggregate } = require("./dashboardUtils");

function computeInventoryAggregates(inventoryGroups, lowStockCount, invalidQuantityCount) {
  const inventoryBySportMap = new Map();
  let totalItems = 0;
  let estimatedStockValue = 0;
  let inStockQuantity = 0;

  for (const group of inventoryGroups) {
    const quantity = toNumber(group._sum?.quantity);
    const referenceCount = toNumber(group._count?.id);
    const stockValue = toNumber(group.purchasePrice) * quantity;
    totalItems += referenceCount;
    estimatedStockValue += stockValue;
    inStockQuantity += quantity;

    pushAggregate(
      inventoryBySportMap,
      group.sport || "UNSPECIFIED",
      stockValue,
      referenceCount,
      quantity
    );
  }

  return {
    totalItems,
    totalQuantity: inStockQuantity,
    estimatedStockValue,
    inStockQuantity,
    lowQuantityCount: lowStockCount,
    invalidQuantityCount,
    inventoryBySportMap,
  };
}

function computeSalesAggregates(sales, options = {}) {
  const salesByPlatformMap = new Map();
  const salesBySportMap = new Map();
  let totalSalesAmount = 0;
  let totalSoldItems = 0;
  let grossProfit = 0;
  let cancelledSalesCount = 0;

  for (const sale of sales) {
    const saleAmount = toNumber(sale.totalAmount);
    const soldItems = sale.totalItems || sale.saleItems?.length || 0;

    totalSalesAmount += saleAmount;
    totalSoldItems += toNumber(soldItems);
    grossProfit += toNumber(sale.profit);

    if (sale.isCancelled || sale.status === "CANCELLED") {
      cancelledSalesCount += 1;
    }

    pushAggregate(
      salesByPlatformMap,
      sale.platform || "OTHER",
      saleAmount,
      1,
      soldItems
    );

    for (const item of sale.saleItems || []) {
      pushAggregate(
        salesBySportMap,
        item.inventory?.sport || "UNSPECIFIED",
        item.totalPrice,
        1,
        item.quantity
      );
    }

    if (options.onItem) {
      options.onItem(sale);
    }
  }

  return {
    totalSalesCount: sales.length,
    totalSalesAmount,
    totalSoldItems,
    grossProfit,
    cancelledSalesCount,
    salesByPlatformMap,
    salesBySportMap,
  };
}

function computePurchasesAggregates(purchases, options = {}) {
  const purchasesByPlatformMap = new Map();
  let totalPurchasesAmount = 0;

  for (const purchase of purchases) {
    const purchaseAmount = toNumber(purchase.totalAmount);
    totalPurchasesAmount += purchaseAmount;

    pushAggregate(
      purchasesByPlatformMap,
      purchase.platform || "OTHER",
      purchaseAmount,
      1,
      purchase.totalItems
    );

    if (options.onItem) {
      options.onItem(purchase);
    }
  }

  return {
    totalPurchasesCount: purchases.length,
    totalPurchasesAmount,
    purchasesByPlatformMap,
  };
}

function computeExpensesAggregates(expenses, options = {}) {
  let totalExpensesAmount = 0;

  for (const expense of expenses) {
    totalExpensesAmount += toNumber(expense.amountTTC);

    if (options.onItem) {
      options.onItem(expense);
    }
  }

  return {
    totalExpensesCount: expenses.length,
    totalExpensesAmount,
  };
}

function computeOverview({
  inventory,
  sales,
  purchases,
  expenses,
  customersCount,
  activeSportsCount,
  activeSalesPlatformsCount,
  activePurchasePlatformsCount,
}) {
  const operatingBalance = sales.totalSalesAmount - purchases.totalPurchasesAmount - expenses.totalExpensesAmount;
  const averageOrderValue = sales.totalSalesCount > 0
    ? sales.totalSalesAmount / sales.totalSalesCount
    : 0;
  const marginRate = sales.totalSalesAmount > 0
    ? (sales.grossProfit / sales.totalSalesAmount) * 100
    : 0;
  const sellThroughRate = ratio(
    sales.totalSoldItems,
    sales.totalSoldItems + inventory.inStockQuantity
  );

  return {
    totalItems: inventory.totalItems,
    totalQuantity: inventory.totalQuantity,
    estimatedStockValue: inventory.estimatedStockValue,
    totalSalesCount: sales.totalSalesCount,
    totalSalesAmount: sales.totalSalesAmount,
    totalSoldItems: sales.totalSoldItems,
    totalPurchasesCount: purchases.totalPurchasesCount,
    totalPurchasesAmount: purchases.totalPurchasesAmount,
    totalExpensesCount: expenses.totalExpensesCount,
    totalExpensesAmount: expenses.totalExpensesAmount,
    totalCustomers: customersCount,
    grossProfit: sales.grossProfit,
    operatingBalance,
    netCashFlow: operatingBalance,
    averageOrderValue,
    marginRate,
    sellThroughRate,
    lowQuantityCount: inventory.lowQuantityCount,
    invalidQuantityCount: inventory.invalidQuantityCount,
    activeSportsCount,
    activeSalesPlatformsCount,
    activePurchasePlatformsCount,
  };
}

function computeOperations({
  receptionsAggregate,
  recentReceptions,
  awaitingPurchasesCount,
  stockMovementsAggregate,
  stockEntriesAggregate,
  stockExitsAggregate,
  recentStockMovements,
}) {
  return {
    receptions: {
      count: toNumber(receptionsAggregate?._count?.id),
      receivedQuantity: toNumber(receptionsAggregate?._sum?.totalQuantity),
      awaitingPurchasesCount: toNumber(awaitingPurchasesCount),
      recent: recentReceptions,
    },
    stockMovements: {
      count: toNumber(stockMovementsAggregate?._count?.id),
      entriesQuantity: toNumber(stockEntriesAggregate?._sum?.quantity),
      exitsQuantity: Math.abs(toNumber(stockExitsAggregate?._sum?.quantity)),
      netQuantity: toNumber(stockMovementsAggregate?._sum?.quantity),
      recent: recentStockMovements,
    },
  };
}

function computeComparisons(current, previous) {
  return {
    salesGrowthRate: growthRate(current.totalSalesAmount, previous.totalSalesAmount),
    grossProfitGrowthRate: growthRate(current.grossProfit, previous.grossProfit),
    marginRateGrowthRate: growthRate(current.marginRate, previous.marginRate),
    averageOrderValueGrowthRate: growthRate(current.averageOrderValue, previous.averageOrderValue),
    salesCountGrowthRate: growthRate(current.totalSalesCount, previous.totalSalesCount),
    purchasesGrowthRate: growthRate(current.totalPurchasesAmount, previous.totalPurchasesAmount),
    expensesGrowthRate: growthRate(current.totalExpensesAmount, previous.totalExpensesAmount),
    operatingBalanceGrowthRate: growthRate(current.operatingBalance, previous.operatingBalance),
    sellThroughRateGrowthRate: null,
  };
}

module.exports = {
  computeInventoryAggregates,
  computeSalesAggregates,
  computePurchasesAggregates,
  computeExpensesAggregates,
  computeOverview,
  computeComparisons,
  computeOperations,
};
