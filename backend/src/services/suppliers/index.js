const { createSupplier } = require("./createSupplierService");
const { getSuppliers } = require("./getSuppliersService");
const { searchSuppliers } = require("./searchSuppliersService");
const { getSupplierById } = require("./getSupplierByIdService");
const { updateSupplier } = require("./updateSupplierService");
const { deleteSupplier } = require("./deleteSupplierService");

module.exports = {
  createSupplier,
  getSuppliers,
  searchSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};