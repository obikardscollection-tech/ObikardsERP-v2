const marketHistoryService = require("../services/marketHistory");

async function create(req, res) {
  try {
    const history = await marketHistoryService.createMarketHistory(req.body);

    return res.status(201).json(history);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const history = await marketHistoryService.getMarketHistory();

    return res.json(history);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const history = await marketHistoryService.getMarketHistoryById(req.params.id);

    return res.json(history);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const history = await marketHistoryService.updateMarketHistory(
      req.params.id,
      req.body
    );

    return res.json(history);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await marketHistoryService.deleteMarketHistory(req.params.id);

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
