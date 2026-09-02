const statisticsService = require("../services/statistics");

function buildFilters(req) {
  return {
    period: req.query.period,
    from: req.query.from,
    to: req.query.to,
    granularity: req.query.granularity,
    limit: req.query.limit,
    olderThanDays: req.query.olderThanDays,
    lowStockMax: req.query.lowStockMax,
    highStockMin: req.query.highStockMin,
  };
}

function sendError(res, error, fallbackStatus = 500) {
  const statusCode = error.statusCode || fallbackStatus;

  return res.status(statusCode).json({
    message: error.message,
  });
}

async function getFinancialIndicators(req, res) {
  try {
    const data = await statisticsService.getFinancialIndicators(buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getTemporalAnalysis(req, res) {
  try {
    const data = await statisticsService.getTemporalAnalysis(buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getStockStatistics(req, res) {
  try {
    const data = await statisticsService.getStockStatistics(buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getBusinessAnalysis(req, res) {
  try {
    const data = await statisticsService.getBusinessAnalysis(
      req.params.dimension,
      buildFilters(req)
    );

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getBusinessDistributions(req, res) {
  try {
    const data = await statisticsService.getBusinessDistributions(buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getChartsOverview(req, res) {
  try {
    const data = await statisticsService.getChartsOverview(buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getTopRanking(req, res) {
  try {
    const data = await statisticsService.getTopRanking(
      req.params.category,
      buildFilters(req)
    );

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getRevenueEvolution(req, res) {
  try {
    const data = await statisticsService.getChartEvolution("revenue", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getProfitEvolution(req, res) {
  try {
    const data = await statisticsService.getChartEvolution("profit", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getRoiEvolution(req, res) {
  try {
    const data = await statisticsService.getChartEvolution("roi", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getSalesEvolution(req, res) {
  try {
    const data = await statisticsService.getChartEvolution("sales", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getMarginEvolution(req, res) {
  try {
    const data = await statisticsService.getChartEvolution("margin", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getPurchasesEvolution(req, res) {
  try {
    const data = await statisticsService.getChartEvolution("purchases", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getStockEvolution(req, res) {
  try {
    const data = await statisticsService.getChartEvolution("stock", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getSalesDistribution(req, res) {
  try {
    const data = await statisticsService.getSalesDistribution(buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getStockDistribution(req, res) {
  try {
    const data = await statisticsService.getStockDistribution(buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getBenefitsDistribution(req, res) {
  try {
    const data = await statisticsService.getBenefitsDistribution(buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getSalesBySport(req, res) {
  try {
    const data = await statisticsService.getSalesByDimension("sport", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getSalesByBrand(req, res) {
  try {
    const data = await statisticsService.getSalesByDimension("brand", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getSalesByPlayer(req, res) {
  try {
    const data = await statisticsService.getSalesByDimension("player", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getSalesByPlatform(req, res) {
  try {
    const data = await statisticsService.getSalesByDimension("platform", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getSalesByYear(req, res) {
  try {
    const data = await statisticsService.getSalesByDimension("year", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getMarketAnalysis(req, res) {
  try {
    const data = await statisticsService.getMarketAnalysis(buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

async function getSalesBySupplier(req, res) {
  try {
    const data = await statisticsService.getSalesByDimension("supplier", buildFilters(req));

    return res.json(data);
  } catch (error) {
    console.error(error);

    return sendError(res, error);
  }
}

module.exports = {
  getFinancialIndicators,
  getTemporalAnalysis,
  getStockStatistics,
  getBusinessAnalysis,
  getBusinessDistributions,
  getChartsOverview,
  getTopRanking,
  getRevenueEvolution,
  getProfitEvolution,
  getRoiEvolution,
  getSalesEvolution,
  getMarginEvolution,
  getPurchasesEvolution,
  getStockEvolution,
  getSalesDistribution,
  getBenefitsDistribution,
  getStockDistribution,
  getSalesBySport,
  getSalesByPlayer,
  getSalesByBrand,
  getSalesBySupplier,
  getSalesByPlatform,
  getSalesByYear,
  getMarketAnalysis,
};