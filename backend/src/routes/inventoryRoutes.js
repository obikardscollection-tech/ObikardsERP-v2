const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventoryController");
const { uploadInventoryCsv } = require("../middlewares/inventoryCsvUploadMiddleware");

// ===============================
// Liste
// ===============================

router.get("/", inventoryController.getInventory);

// ===============================
// Création
// ===============================

router.post("/", inventoryController.createInventory);

router.post("/import/csv", uploadInventoryCsv, inventoryController.importInventoryCsv);

// ===============================
// Modification
// ===============================

router.put("/:id", inventoryController.updateInventory);

// ===============================
// Suppression
// ===============================

router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;