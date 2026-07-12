const marketImportErrorService = require("../services/marketImportError");

async function create(req, res) {
  try {
    const importError = await marketImportErrorService.createMarketImportError(req.body);

    return res.status(201).json(importError);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const importErrors = await marketImportErrorService.getMarketImportErrors();

    return res.json(importErrors);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const importError = await marketImportErrorService.getMarketImportErrorById(req.params.id);

    return res.json(importError);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const importError = await marketImportErrorService.updateMarketImportError(
      req.params.id,
      req.body
    );

    return res.json(importError);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await marketImportErrorService.deleteMarketImportError(req.params.id);

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
