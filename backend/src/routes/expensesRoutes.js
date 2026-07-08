const express = require("express");

const expensesController = require("../controllers/expensesController");

const router = express.Router();

router.post("/", expensesController.create);

router.get("/", expensesController.getAll);

router.get("/:id", expensesController.getById);

router.put("/:id", expensesController.update);

router.delete("/:id", expensesController.remove);

module.exports = router;