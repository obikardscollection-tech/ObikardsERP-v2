const express = require("express");

const customersController = require("../controllers/customersController");

const router = express.Router();

router.post("/", customersController.create);
router.get("/", customersController.getAll);
router.get("/:id", customersController.getById);
router.put("/:id", customersController.update);
router.delete("/:id", customersController.remove);

module.exports = router;