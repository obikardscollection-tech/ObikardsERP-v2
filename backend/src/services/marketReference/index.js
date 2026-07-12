const { createMarketReference } = require("./createMarketReferenceService");
const { getMarketReferences } = require("./getMarketReferencesService");
const { getMarketReferenceById } = require("./getMarketReferenceByIdService");
const { updateMarketReference } = require("./updateMarketReferenceService");
const { deleteMarketReference } = require("./deleteMarketReferenceService");

module.exports = {
  createMarketReference,
  getMarketReferences,
  getMarketReferenceById,
  updateMarketReference,
  deleteMarketReference,
};
