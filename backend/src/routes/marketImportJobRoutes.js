const express = require("express");
const marketImportJobController = require("../controllers/marketImportJobController");

const router = express.Router();

router.get("/", marketImportJobController.getAll);
router.get("/:id", marketImportJobController.getById);
router.post("/", marketImportJobController.create);
router.put("/:id", marketImportJobController.update);
router.delete("/:id", marketImportJobController.remove);

module.exports = router;
