const marketImportJobService = require("../services/marketImportJob");

async function create(req, res) {
  try {
    const importJob = await marketImportJobService.createMarketImportJob(req.body);

    return res.status(201).json(importJob);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const importJobs = await marketImportJobService.getMarketImportJobs({
      providerCode: req.query.providerCode,
      take: req.query.take,
      skip: req.query.skip,
    });

    return res.json(importJobs);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const importJob = await marketImportJobService.getMarketImportJobById(req.params.id);

    return res.json(importJob);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const importJob = await marketImportJobService.updateMarketImportJob(
      req.params.id,
      req.body
    );

    return res.json(importJob);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await marketImportJobService.deleteMarketImportJob(req.params.id);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function triggerSportsCardsProSync(req, res) {
  try {
    const payload = req.body || {};
    const result = await marketImportJobService.executeSportsCardsProSync({
      source: "MANUAL",
      filePath: payload.filePath,
    });

    return res.status(202).json(result);
  } catch (error) {
    console.error(error);

    if (error && error.code === "IMPORT_ALREADY_RUNNING") {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getSportsCardsProSyncStats(req, res) {
  try {
    const stats = await marketImportJobService.getSportsCardsProSyncStatistics();

    return res.json(stats);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
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
  triggerSportsCardsProSync,
  getSportsCardsProSyncStats,
};
