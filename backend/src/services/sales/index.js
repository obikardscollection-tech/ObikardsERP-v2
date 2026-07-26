const { createSale } = require("./createSaleService");
const { getSales } = require("./getSalesService");
const { searchSales } = require("./searchSalesService");
const { getSale } = require("./getSaleService");
const { updateSale } = require("./updateSaleService");
const { cancelSale } = require("./cancelSaleService");

module.exports = {
  createSale,
  getSales,
  searchSales,
  getSale,
  updateSale,
  cancelSale,
};