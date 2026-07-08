const express = require("express");

const suppliersController = require("../controllers/suppliersController");

const router = express.Router();

router.post("/", suppliersController.create);
router.get("/", suppliersController.getAll);
router.get("/:id", suppliersController.getById);
router.put("/:id", suppliersController.update);
router.delete("/:id", suppliersController.remove);

module.exports = router;