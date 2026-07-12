const marketCardService = require("../services/marketCard");

async function create(req, res) {
  try {
    const card = await marketCardService.createMarketCard(req.body);

    return res.status(201).json(card);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const cards = await marketCardService.getMarketCards();

    return res.json(cards);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const card = await marketCardService.getMarketCardById(req.params.id);

    return res.json(card);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const card = await marketCardService.updateMarketCard(req.params.id, req.body);

    return res.json(card);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await marketCardService.deleteMarketCard(req.params.id);

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