const purchasesService = require("../services/purchases");

async function create(req, res) {
  try {
    const purchase = await purchasesService.createPurchase(req.body);

    return res.status(201).json(purchase);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const purchases = await purchasesService.getPurchases();

    return res.json(purchases);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const purchase = await purchasesService.getPurchaseById(req.params.id);

    return res.json(purchase);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const purchase = await purchasesService.updatePurchase(
      req.params.id,
      req.body
    );

    return res.json(purchase);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await purchasesService.deletePurchase(req.params.id);

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