const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventoryController");
const { uploadInventoryCsv } = require("../middlewares/inventoryCsvUploadMiddleware");
const { uploadInventoryPhoto } = require("../middlewares/inventoryPhotoUploadMiddleware");

// ===============================
// Liste
// ===============================

router.get("/", inventoryController.getInventory);

// ===============================
// Création
// ===============================

router.post("/", inventoryController.createInventory);

router.post("/import/csv", uploadInventoryCsv, inventoryController.importInventoryCsv);
router.post("/import/csv/preview", uploadInventoryCsv, inventoryController.previewInventoryCsv);
router.post("/:id/photos/:slot", uploadInventoryPhoto, inventoryController.uploadInventoryPhoto);
router.get("/:id/photos/:filename", inventoryController.getInventoryPhoto);
router.delete("/:id/photos/:filename", inventoryController.deleteInventoryPhoto);

// ===============================
// Modification
// ===============================

router.post("/:id/market/refresh", inventoryController.refreshInventoryMarket);
router.put("/:id", inventoryController.updateInventory);

// ===============================
// Suppression
// ===============================

router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;