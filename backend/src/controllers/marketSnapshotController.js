const marketSnapshotService = require("../services/marketSnapshot");

async function create(req, res) {
  try {
    const snapshot = await marketSnapshotService.createMarketSnapshot(req.body);

    return res.status(201).json(snapshot);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const snapshots = await marketSnapshotService.getMarketSnapshots();

    return res.json(snapshots);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const snapshot = await marketSnapshotService.getMarketSnapshotById(req.params.id);

    return res.json(snapshot);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const snapshot = await marketSnapshotService.updateMarketSnapshot(
      req.params.id,
      req.body
    );

    return res.json(snapshot);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await marketSnapshotService.deleteMarketSnapshot(req.params.id);

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
