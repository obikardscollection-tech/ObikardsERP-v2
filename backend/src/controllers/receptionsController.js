const receptionsService = require("../services/receptions");

async function create(req, res) {
  try {
    const reception =
      await receptionsService.createReception(req.body);

    return res.status(201).json(reception);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function createForPurchase(req, res) {
  try {
    const reception =
      await receptionsService.createReception({
        ...req.body,
        purchaseId: req.params.id,
      });

    return res.status(201).json(reception);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const receptions =
      await receptionsService.getReceptions();

    return res.json(receptions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const reception =
      await receptionsService.getReceptionById(
        req.params.id
      );

    return res.json(reception);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function getByPurchase(req, res) {
  try {
    const receptions =
      await receptionsService.getPurchaseReceptions(
        req.params.id
      );

    return res.json(receptions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const reception =
      await receptionsService.updateReception(
        req.params.id,
        req.body
      );

    return res.json(reception);
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
      await receptionsService.deleteReception(
        req.params.id
      );

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
  createForPurchase,
  getAll,
  getById,
  getByPurchase,
  update,
  remove,
};
