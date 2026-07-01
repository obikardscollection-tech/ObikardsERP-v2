const stockService = require("../services/stock");

async function adjustStock(req, res) {
  try {
    const result = await stockService.adjustStock(req.body);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function getMovementHistory(req, res) {
  try {
    const movements = await stockService.getMovementHistory(
      req.params.inventoryId
    );

    res.json(movements);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  adjustStock,
  getMovementHistory,
};