const { generateSku } = require("./skuService");
const { getInventory } = require("./getInventoryService");
const { searchInventory } = require("./searchInventoryService");
const { createInventory } = require("./createInventoryService");
const { updateInventory, refreshInventoryMarket } = require("./updateInventoryService");
const { deleteInventory } = require("./deleteInventoryService");
const { resolveInventoryMarketPatch } = require("./marketAutoLinkService");
const { importInventoryFromCsv, previewInventoryFromCsv } = require("./importCsvService");
const {
  deleteInventoryPhoto,
  getInventoryPhoto,
  uploadInventoryPhoto,
} = require("./inventoryPhotoService");

module.exports = {
  generateSku,
  getInventory,
  searchInventory,
  createInventory,
  updateInventory,
  refreshInventoryMarket,
  deleteInventory,
  resolveInventoryMarketPatch,
  importInventoryFromCsv,
  previewInventoryFromCsv,
  deleteInventoryPhoto,
  getInventoryPhoto,
  uploadInventoryPhoto,
};