const express = require("express");
const marketImportJobController = require("../controllers/marketImportJobController");

const router = express.Router();

router.get("/", marketImportJobController.getAll);
router.get("/stats/sportscardspro", marketImportJobController.getSportsCardsProSyncStats);
router.post("/sync/sportscardspro", marketImportJobController.triggerSportsCardsProSync);
router.post("/sync/sportscardspro/single", marketImportJobController.triggerSingleSportsCardsProCardSync);
router.get("/:id", marketImportJobController.getById);
router.post("/", marketImportJobController.create);
router.put("/:id", marketImportJobController.update);
router.delete("/:id", marketImportJobController.remove);

module.exports = router;
