const { createSupplier } = require("./createSupplierService");
const { getSuppliers } = require("./getSuppliersService");
const { getSupplierById } = require("./getSupplierByIdService");
const { updateSupplier } = require("./updateSupplierService");
const { deleteSupplier } = require("./deleteSupplierService");

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};