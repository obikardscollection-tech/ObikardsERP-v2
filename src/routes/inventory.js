const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventoryController");

// ===============================
// Liste
// ===============================

router.get("/", inventoryController.getInventory);

// ===============================
// Création
// ===============================

router.post("/", inventoryController.createInventory);

// ===============================
// Modification
// ===============================

router.put("/:id", inventoryController.updateInventory);

// ===============================
// Suppression
// ===============================

router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;