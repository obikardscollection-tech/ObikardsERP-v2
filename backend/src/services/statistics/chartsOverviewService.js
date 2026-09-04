const statisticsRepository = require("./statisticsRepository");
const { formatRange, getRangeFromFilters, resolveGranularity } = require("./statisticsCore");
const {
  bucketExpenses,
  bucketPurchases,
  bucketSales,
  bucketStockMovements,
  mapSalesEvolutionMetric,
} = require("./chartStatisticsService");
const {
  getBenefitsDistribution,
  getSalesDistribution,
} = require("./businessStatisticsService");
const { ratio, toNumber } = require("./statisticsCore");

async function getChartsOverview(filters = {}) {
  const range = getRangeFromFilters(filters);
  const granularity = resolveGranularity(range, filters.granularity);
  const [sales, purchases, expenses, expenseCategories, movements, salesDistribution, benefitsDistribution] = await Promise.all([
    statisticsRepository.getSalesTimeline(range),
    statisticsRepository.getPurchasesTimeline(range),
    statisticsRepository.getExpensesTimeline(range),
    statisticsRepository.getExpensesByCategory(range),
    statisticsRepository.getStockMovementsTimeline(range),
    getSalesDistribution(filters),
    getBenefitsDistribution(filters),
  ]);
  const salesRows = bucketSales(sales, granularity);
  const purchaseRows = bucketPurchases(purchases, granularity);
  const expenseRows = bucketExpenses(expenses, granularity);
  const stockRows = bucketStockMovements(movements, granularity);
  const chart = (metric) => mapSalesEvolutionMetric(salesRows, metric);
  const totalExpensesTTC = expenseCategories.reduce(
    (total, category) => total + toNumber(category._sum.amountTTC),
    0
  );

  return {
    range: formatRange(range),
    granularity,
    revenue: chart("revenue"),
    profit: chart("profit"),
    roi: chart("roi"),
    sales: chart("sales"),
    purchases: {
      data: purchaseRows.map((row) => ({ period: row.period, value: row.montantAchat })),
      quantites: purchaseRows.map((row) => ({ period: row.period, value: row.quantiteAchetee })),
    },
    expenses: {
      data: expenseRows.map((row) => ({ period: row.period, value: row.montantTTC })),
      ht: expenseRows.map((row) => ({ period: row.period, value: row.montantHT })),
      taxes: expenseRows.map((row) => ({ period: row.period, value: row.tva })),
      count: expenseRows.map((row) => ({ period: row.period, value: row.nombreDepenses })),
    },
    stock: {
      data: stockRows.map((row) => ({ period: row.period, value: row.cumul })),
      net: stockRows.map((row) => ({ period: row.period, value: row.net })),
      entries: stockRows.map((row) => ({ period: row.period, value: row.entree })),
      outputs: stockRows.map((row) => ({ period: row.period, value: row.sortie })),
    },
    distributions: {
      salesByPlatform: salesDistribution.byPlatform,
      salesByStatus: salesDistribution.byStatus,
      benefitsBySport: benefitsDistribution.bySport,
      benefitsByBrand: benefitsDistribution.byBrand,
      benefitsBySupplier: benefitsDistribution.bySupplier,
      expensesByCategory: expenseCategories
        .map((category) => ({
          category: category.category,
          depensesHT: toNumber(category._sum.amountHT),
          tvaDepenses: toNumber(category._sum.tax),
          depensesTTC: toNumber(category._sum.amountTTC),
          nombreDepenses: toNumber(category._count.id),
          partDepensesTTC: ratio(category._sum.amountTTC, totalExpensesTTC),
        }))
        .sort((a, b) => a.category.localeCompare(b.category)),
    },
  };
}

module.exports = {
  getChartsOverview,
};