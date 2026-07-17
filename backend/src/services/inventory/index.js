const { generateSku } = require("./skuService");
const { getInventory } = require("./getInventoryService");
const { createInventory } = require("./createInventoryService");
const { updateInventory } = require("./updateInventoryService");
const { deleteInventory } = require("./deleteInventoryService");
const { resolveInventoryMarketPatch } = require("./marketAutoLinkService");

module.exports = {
  generateSku,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  resolveInventoryMarketPatch,
};