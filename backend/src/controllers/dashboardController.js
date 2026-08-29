const dashboardService = require("../services/dashboard");

async function getDashboard(req, res) {
  try {
    const dashboardData = await dashboardService.getDashboardData({
      period: req.query.period,
      from: req.query.from,
      to: req.query.to,
      granularity: req.query.granularity,
    });

    return res.json(dashboardData);
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
}

module.exports = {
  getDashboard,
};