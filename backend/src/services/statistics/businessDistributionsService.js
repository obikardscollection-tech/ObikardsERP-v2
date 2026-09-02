const statisticsRepository = require("./statisticsRepository");
const { formatRange, getRangeFromFilters } = require("./statisticsCore");
const { aggregateByDimension } = require("./businessStatisticsService");

const DIMENSIONS = ["sport", "player", "brand", "supplier", "platform", "year"];

async function getBusinessDistributions(filters = {}) {
  const range = getRangeFromFilters(filters);
  const items = await statisticsRepository.getSaleItemsAnalytics(range);

  return {
    range: formatRange(range),
    distributions: Object.fromEntries(
      DIMENSIONS.map((dimension) => [
        `by${dimension.charAt(0).toUpperCase()}${dimension.slice(1)}`,
        aggregateByDimension(items, dimension),
      ])
    ),
  };
}

module.exports = {
  getBusinessDistributions,
};