const inventoryService = require("../services/inventory");

async function getInventory(req, res) {
  try {
    const items = await inventoryService.getInventory();

    res.json(items);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function createInventory(req, res) {
  try {
    const item = await inventoryService.createInventory(req.body);

    res.status(201).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function updateInventory(req, res) {
  try {
    const item = await inventoryService.updateInventory(
      req.params.id,
      req.body
    );

    res.json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function refreshInventoryMarket(req, res) {
  try {
    const explicitSportsCardsProId = req.body && req.body.sportsCardsProId ? req.body.sportsCardsProId : null;
    const item = await inventoryService.refreshInventoryMarket(req.params.id, explicitSportsCardsProId);

    res.json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function deleteInventory(req, res) {
  try {
    const result = await inventoryService.deleteInventory(req.params.id);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function uploadInventoryPhoto(req, res, next) {
  try {
    const item = await inventoryService.uploadInventoryPhoto(req.params.id, req.params.slot, req.file);
    return res.status(201).json(item);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    return next(error);
  }
}

async function getInventoryPhoto(req, res, next) {
  try {
    const photo = await inventoryService.getInventoryPhoto(req.params.id, req.params.filename);
    res.type(photo.contentType);
    return res.sendFile(photo.filePath);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    return next(error);
  }
}

async function deleteInventoryPhoto(req, res, next) {
  try {
    const item = await inventoryService.deleteInventoryPhoto(req.params.id, req.params.filename);
    return res.json(item);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    return next(error);
  }
}

async function importInventoryCsv(req, res) {
  try {
    const report = await inventoryService.importInventoryFromCsv(req.file);

    res.status(200).json(report);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      error: error.message,
    });
  }
}

async function previewInventoryCsv(req, res) {
  try {
    const report = await inventoryService.previewInventoryFromCsv(req.file);

    res.status(200).json(report);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      error: error.message,
    });
  }
}

module.exports = {
  getInventory,
  createInventory,
  updateInventory,
  refreshInventoryMarket,
  deleteInventory,
  importInventoryCsv,
  previewInventoryCsv,
  uploadInventoryPhoto,
  getInventoryPhoto,
  deleteInventoryPhoto,
};