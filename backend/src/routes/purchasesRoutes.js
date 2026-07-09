const express = require("express");

const purchasesController = require("../controllers/purchasesController");
const receptionsController = require("../controllers/receptionsController");

const router = express.Router();

router.post("/", purchasesController.create);
router.get("/", purchasesController.getAll);
router.get("/:id/receptions", receptionsController.getByPurchase);
router.post("/:id/receptions", receptionsController.createForPurchase);
router.get("/:id", purchasesController.getById);
router.put("/:id", purchasesController.update);
router.delete("/:id", purchasesController.remove);

module.exports = router;
