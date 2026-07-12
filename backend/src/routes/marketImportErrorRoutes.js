const express = require("express");
const marketImportErrorController = require("../controllers/marketImportErrorController");

const router = express.Router();

router.get("/", marketImportErrorController.getAll);
router.get("/:id", marketImportErrorController.getById);
router.post("/", marketImportErrorController.create);
router.put("/:id", marketImportErrorController.update);
router.delete("/:id", marketImportErrorController.remove);

module.exports = router;
