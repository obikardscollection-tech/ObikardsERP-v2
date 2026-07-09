const { createSale } = require("../services/sales/createSaleService");
const { getSales } = require("../services/sales/getSalesService");
const { getSale } = require("../services/sales/getSaleService");
const { updateSale } = require("../services/sales/updateSaleService");
const { cancelSale } = require("../services/sales/cancelSaleService");

async function create(req, res) {
  try {
    const sale = await createSale(req.body);

    return res.status(201).json(sale);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const sales = await getSales();

    return res.json(sales);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const sale = await getSale(req.params.id);

    return res.json(sale);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const sale = await updateSale(req.params.id, req.body);

    return res.json(sale);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await cancelSale(req.params.id);

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