const marketProviderCardService = require("../services/marketProviderCard");

async function create(req, res) {
  try {
    const providerCard = await marketProviderCardService.createMarketProviderCard(
      req.body
    );

    return res.status(201).json(providerCard);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const providerCards =
      await marketProviderCardService.getMarketProviderCards();

    return res.json(providerCards);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const providerCard =
      await marketProviderCardService.getMarketProviderCardById(req.params.id);

    return res.json(providerCard);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const providerCard =
      await marketProviderCardService.updateMarketProviderCard(
        req.params.id,
        req.body
      );

    return res.json(providerCard);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result =
      await marketProviderCardService.deleteMarketProviderCard(req.params.id);

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