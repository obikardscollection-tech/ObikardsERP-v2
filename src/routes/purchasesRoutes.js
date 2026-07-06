const express = require("express");

const purchasesController = require("../controllers/purchasesController");

const router = express.Router();

router.post("/", purchasesController.create);
router.get("/", purchasesController.getAll);
router.get("/:id", purchasesController.getById);
router.put("/:id", purchasesController.update);
router.delete("/:id", purchasesController.remove);

module.exports = router;