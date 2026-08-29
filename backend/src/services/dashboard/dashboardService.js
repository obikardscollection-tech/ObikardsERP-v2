const { getDashboardSnapshot } = require("./dashboardRepository");
const {
  SUPPORTED_PERIODS,
  SUPPORTED_GRANULARITY,
  parseDateRange,
  getPreviousRange,
  resolveGranularity,
  splitByRanges,
} = require("./dashboardFilters");
const {
  ratio,
} = require("./dashboardUtils");
const {
  computeInventoryAggregates,
  computeSalesAggregates,
  computePurchasesAggregates,
  computeExpensesAggregates,
  computeOverview,
  computeComparisons,
  computeOperations,
} = require("./dashboardCalculators");
const {
  createTimelineAccumulator,
  addSaleToTimeline,
  addPurchaseToTimeline,
  addExpenseToTimeline,
  finalizeTimeline,
} = require("./dashboardTimeline");
const { buildBreakdowns } = require("./dashboardBreakdowns");
const { buildAlerts } = require("./dashboardAlerts");
const { buildRecentActivity } = require("./dashboardActivities");

async function getDashboardData(filters = {}) {
  const range = parseDateRange(filters);
  const granularity = resolveGranularity(range, filters.granularity);
  const previousRange = getPreviousRange(range);

  const {
    inventoryGroups,
    lowStockCount,
    invalidQuantityCount,
    sales,
    purchases,
    expenses,
    customersCount,
    cancelledSalesCount,
    receptionsAggregate,
    recentReceptions,
    awaitingPurchasesCount,
    stockMovementsAggregate,
    stockEntriesAggregate,
    stockExitsAggregate,
    recentStockMovements,
  } = await getDashboardSnapshot(range, previousRange);

  const {
    current: inRangeSales,
    previous: previousSales,
  } = splitByRanges(sales, (item) => item.soldAt, range, previousRange);

  const {
    current: inRangePurchases,
    previous: previousPurchases,
  } = splitByRanges(purchases, (item) => item.purchasedAt, range, previousRange);

  const {
    current: inRangeExpenses,
    previous: previousExpenses,
  } = splitByRanges(expenses, (item) => item.expenseDate, range, previousRange);

  const financeTimelineAccumulator = createTimelineAccumulator(granularity);

  const inventoryMetrics = computeInventoryAggregates(
    inventoryGroups,
    lowStockCount,
    invalidQuantityCount
  );

  const salesMetrics = computeSalesAggregates(inRangeSales, {
    onItem: (sale) => {
      addSaleToTimeline(financeTimelineAccumulator, sale);
    },
  });

  const purchasesMetrics = computePurchasesAggregates(inRangePurchases, {
    onItem: (purchase) => {
      addPurchaseToTimeline(financeTimelineAccumulator, purchase);
    },
  });

  const expensesMetrics = computeExpensesAggregates(inRangeExpenses, {
    onItem: (expense) => {
      addExpenseToTimeline(financeTimelineAccumulator, expense);
    },
  });

  const previousSalesMetrics = computeSalesAggregates(previousSales);
  const previousPurchasesMetrics = computePurchasesAggregates(previousPurchases);
  const previousExpensesMetrics = computeExpensesAggregates(previousExpenses);

  const { breakdowns, activeSportsCount, activeSalesPlatformsCount, activePurchasePlatformsCount } = buildBreakdowns({
    salesByPlatformMap: salesMetrics.salesByPlatformMap,
    purchasesByPlatformMap: purchasesMetrics.purchasesByPlatformMap,
    inventoryBySportMap: inventoryMetrics.inventoryBySportMap,
    salesBySportMap: salesMetrics.salesBySportMap,
    totalSalesAmount: salesMetrics.totalSalesAmount,
    totalPurchasesAmount: purchasesMetrics.totalPurchasesAmount,
    estimatedStockValue: inventoryMetrics.estimatedStockValue,
  });

  const overview = computeOverview({
    inventory: inventoryMetrics,
    sales: salesMetrics,
    purchases: purchasesMetrics,
    expenses: expensesMetrics,
    customersCount,
    activeSportsCount,
    activeSalesPlatformsCount,
    activePurchasePlatformsCount,
  });

  const previousOverview = computeOverview({
    inventory: inventoryMetrics,
    sales: previousSalesMetrics,
    purchases: previousPurchasesMetrics,
    expenses: previousExpensesMetrics,
    customersCount,
    activeSportsCount,
    activeSalesPlatformsCount: previousSalesMetrics.salesByPlatformMap.size,
    activePurchasePlatformsCount: previousPurchasesMetrics.purchasesByPlatformMap.size,
  });

  const comparisons = computeComparisons(overview, previousOverview);
  const operations = computeOperations({
    receptionsAggregate,
    recentReceptions,
    awaitingPurchasesCount,
    stockMovementsAggregate,
    stockEntriesAggregate,
    stockExitsAggregate,
    recentStockMovements,
  });

  const alerts = buildAlerts({
    lowQuantityCount: inventoryMetrics.lowQuantityCount,
    invalidQuantityCount: inventoryMetrics.invalidQuantityCount,
    salesCount: salesMetrics.totalSalesCount,
    purchasesCount: purchasesMetrics.totalPurchasesCount,
    netCashFlow: overview.operatingBalance,
    expenseGrowthRate: comparisons.expensesGrowthRate,
    expensesCount: expensesMetrics.totalExpensesCount,
    cancelledSalesRatio: ratio(cancelledSalesCount, salesMetrics.totalSalesCount + cancelledSalesCount),
    salesGrowthRate: comparisons.salesGrowthRate,
    previousSalesAmount: previousSalesMetrics.totalSalesAmount,
  });

  const recentActivity = buildRecentActivity({
    sales: inRangeSales,
    purchases: inRangePurchases,
    expenses: inRangeExpenses,
  });

  return {
    filters: {
      applied: {
        period: range.period,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        granularity,
      },
      supportedPeriods: SUPPORTED_PERIODS,
      supportedGranularity: SUPPORTED_GRANULARITY,
    },
    overview,
    comparisons,
    operations,
    charts: {
      financeTimeline: finalizeTimeline(financeTimelineAccumulator),
      transactionsByType: {
        sales: salesMetrics.totalSalesCount,
        purchases: purchasesMetrics.totalPurchasesCount,
        expenses: expensesMetrics.totalExpensesCount,
      },
    },
    breakdowns,
    recentActivity,
    alerts,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  getDashboardData,
};
