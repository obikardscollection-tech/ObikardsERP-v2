const { createSale } = require("../services/sales/createSaleService");

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

module.exports = {
  create,
};