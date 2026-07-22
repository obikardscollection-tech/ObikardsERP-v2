const dashboardService = require("../services/dashboard");

async function getDashboard(req, res) {
  try {
    const dashboardData = await dashboardService.getDashboardData();

    return res.json(dashboardData);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  getDashboard,
};