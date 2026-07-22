const {
  SUPPORTED_PERIODS,
  SUPPORTED_GRANULARITY,
  SUPPORTED_DIMENSIONS,
  SUPPORTED_TOP_CATEGORIES,
} = require("./statisticsCore");
const {
  getFinancialIndicators,
  getTemporalAnalysis,
} = require("./financialStatisticsService");
const {
  getStockStatistics,
  getStockDistribution,
} = require("./stockStatisticsService");
const {
  getBusinessAnalysis,
  getTopRanking,
  getSalesDistribution,
  getBenefitsDistribution,
  getSalesByDimension,
} = require("./businessStatisticsService");
const { getChartEvolution } = require("./chartStatisticsService");
const { getMarketAnalysis } = require("./marketStatisticsService");

module.exports = {
  SUPPORTED_PERIODS,
  SUPPORTED_GRANULARITY,
  SUPPORTED_DIMENSIONS,
  SUPPORTED_TOP_CATEGORIES,
  getFinancialIndicators,
  getTemporalAnalysis,
  getStockStatistics,
  getBusinessAnalysis,
  getTopRanking,
  getChartEvolution,
  getSalesDistribution,
  getStockDistribution,
  getBenefitsDistribution,
  getSalesByDimension,
  getMarketAnalysis,
};
