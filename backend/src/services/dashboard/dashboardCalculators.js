const { toNumber, ratio, growthRate, pushAggregate } = require("./dashboardUtils");

function computeInventoryAggregates(inventory) {
  const inventoryBySportMap = new Map();
  let totalQuantity = 0;
  let estimatedStockValue = 0;
  let inStockQuantity = 0;
  let lowQuantityCount = 0;
  let invalidQuantityCount = 0;

  for (const item of inventory) {
    const quantity = toNumber(item.quantity);
    totalQuantity += quantity;

    if (quantity < 0) {
      invalidQuantityCount += 1;
    }

    if (item.status !== "IN_STOCK") {
      continue;
    }

    if (quantity <= 1) {
      lowQuantityCount += 1;
    }

    const stockValue = toNumber(item.purchasePrice) * quantity;
    estimatedStockValue += stockValue;
    inStockQuantity += quantity;

    pushAggregate(
      inventoryBySportMap,
      item.sport || "UNSPECIFIED",
      stockValue,
      1,
      quantity
    );
  }

  return {
    totalItems: inventory.length,
    totalQuantity,
    estimatedStockValue,
    inStockQuantity,
    lowQuantityCount,
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
  const netCashFlow = sales.totalSalesAmount - purchases.totalPurchasesAmount - expenses.totalExpensesAmount;
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
    netCashFlow,
    averageOrderValue,
    marginRate,
    sellThroughRate,
    activeSportsCount,
    activeSalesPlatformsCount,
    activePurchasePlatformsCount,
  };
}

function computeComparisons({
  totalSalesAmount,
  totalPurchasesAmount,
  totalExpensesAmount,
  previousSalesAmount,
  previousPurchasesAmount,
  previousExpensesAmount,
}) {
  return {
    salesGrowthRate: growthRate(totalSalesAmount, previousSalesAmount),
    purchasesGrowthRate: growthRate(totalPurchasesAmount, previousPurchasesAmount),
    expensesGrowthRate: growthRate(totalExpensesAmount, previousExpensesAmount),
  };
}

module.exports = {
  computeInventoryAggregates,
  computeSalesAggregates,
  computePurchasesAggregates,
  computeExpensesAggregates,
  computeOverview,
  computeComparisons,
};
