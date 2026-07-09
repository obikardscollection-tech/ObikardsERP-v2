const express = require("express");

const receptionsController = require("../controllers/receptionsController");

const router = express.Router();

router.post("/", receptionsController.create);
router.get("/", receptionsController.getAll);
router.get("/:id", receptionsController.getById);
router.put("/:id", receptionsController.update);
router.delete("/:id", receptionsController.remove);

module.exports = router;
