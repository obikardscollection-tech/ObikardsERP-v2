const { createSale } = require("./createSaleService");
const { getSales } = require("./getSalesService");
const { getSale } = require("./getSaleService");
const { updateSale } = require("./updateSaleService");
const { cancelSale } = require("./cancelSaleService");

module.exports = {
  createSale,
  getSales,
  getSale,
  updateSale,
  cancelSale,
};