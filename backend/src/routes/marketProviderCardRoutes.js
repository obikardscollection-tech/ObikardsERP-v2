const express = require("express");
const marketProviderCardController = require("../controllers/marketProviderCardController");

const router = express.Router();

router.get("/", marketProviderCardController.getAll);
router.get("/:id", marketProviderCardController.getById);
router.post("/", marketProviderCardController.create);
router.put("/:id", marketProviderCardController.update);
router.delete("/:id", marketProviderCardController.remove);

module.exports = router;