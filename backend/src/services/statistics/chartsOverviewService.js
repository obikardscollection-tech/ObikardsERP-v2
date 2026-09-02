const statisticsRepository = require("./statisticsRepository");
const { formatRange, getRangeFromFilters, resolveGranularity } = require("./statisticsCore");
const {
  bucketPurchases,
  bucketSales,
  bucketStockMovements,
  mapSalesEvolutionMetric,
} = require("./chartStatisticsService");
const {
  getBenefitsDistribution,
  getSalesDistribution,
} = require("./businessStatisticsService");

async function getChartsOverview(filters = {}) {
  const range = getRangeFromFilters(filters);
  const granularity = resolveGranularity(range, filters.granularity);
  const [sales, purchases, movements, salesDistribution, benefitsDistribution] = await Promise.all([
    statisticsRepository.getSalesTimeline(range),
    statisticsRepository.getPurchasesTimeline(range),
    statisticsRepository.getStockMovementsTimeline(range),
    getSalesDistribution(filters),
    getBenefitsDistribution(filters),
  ]);
  const salesRows = bucketSales(sales, granularity);
  const purchaseRows = bucketPurchases(purchases, granularity);
  const stockRows = bucketStockMovements(movements, granularity);
  const chart = (metric) => mapSalesEvolutionMetric(salesRows, metric);

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
    },
  };
}

module.exports = {
  getChartsOverview,
};