const { createCustomer } = require("./createCustomerService");
const { getCustomers } = require("./getCustomersService");
const { getCustomerById } = require("./getCustomerByIdService");
const { updateCustomer } = require("./updateCustomerService");
const { deleteCustomer } = require("./deleteCustomerService");

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};