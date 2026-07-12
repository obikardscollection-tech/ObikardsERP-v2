const marketProviderService = require("../services/marketProvider");

async function create(req, res) {
  try {
    const provider = await marketProviderService.createProvider(req.body);

    return res.status(201).json(provider);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const providers = await marketProviderService.getProviders();

    return res.json(providers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const provider = await marketProviderService.getProviderById(req.params.id);

    return res.json(provider);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const provider = await marketProviderService.updateProvider(
      req.params.id,
      req.body
    );

    return res.json(provider);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await marketProviderService.deleteProvider(req.params.id);

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