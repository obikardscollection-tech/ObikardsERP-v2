const { createProvider } = require("./createProviderService");
const { getProviders } = require("./getProvidersService");
const { getProviderById } = require("./getProviderByIdService");
const { updateProvider } = require("./updateProviderService");
const { deleteProvider } = require("./deleteProviderService");

module.exports = {
  createProvider,
  getProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
};