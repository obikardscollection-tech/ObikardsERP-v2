const marketAnalyticsService = require("../services/marketAnalytics");

async function create(req, res) {
  try {
    const analytics = await marketAnalyticsService.createMarketAnalytics(req.body);

    return res.status(201).json(analytics);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const analytics = await marketAnalyticsService.getMarketAnalytics();

    return res.json(analytics);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const analytics = await marketAnalyticsService.getMarketAnalyticsById(req.params.id);

    return res.json(analytics);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const analytics = await marketAnalyticsService.updateMarketAnalytics(
      req.params.id,
      req.body
    );

    return res.json(analytics);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await marketAnalyticsService.deleteMarketAnalytics(req.params.id);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
