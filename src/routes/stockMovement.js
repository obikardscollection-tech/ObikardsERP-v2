const express = require("express");
const router = express.Router();

const stockMovementController = require("../controllers/stockMovementController");

// ===============================
// Historique des mouvements
// ===============================

router.get(
  "/:inventoryId",
  stockMovementController.getMovementHistory
);

// ===============================
// Ajustement du stock
// ===============================

router.post(
  "/adjust",
  stockMovementController.adjustStock
);

module.exports = router;