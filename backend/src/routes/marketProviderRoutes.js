const express = require("express");
const marketProviderController = require("../controllers/marketProviderController");

const router = express.Router();

router.get("/", marketProviderController.getAll);
router.get("/:id", marketProviderController.getById);
router.post("/", marketProviderController.create);
router.put("/:id", marketProviderController.update);
router.delete("/:id", marketProviderController.remove);

module.exports = router;