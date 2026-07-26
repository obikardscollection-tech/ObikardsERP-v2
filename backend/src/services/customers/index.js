const { createCustomer } = require("./createCustomerService");
const { getCustomers } = require("./getCustomersService");
const { searchCustomers } = require("./searchCustomersService");
const { getCustomerById } = require("./getCustomerByIdService");
const { updateCustomer } = require("./updateCustomerService");
const { deleteCustomer } = require("./deleteCustomerService");

module.exports = {
  createCustomer,
  getCustomers,
  searchCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};