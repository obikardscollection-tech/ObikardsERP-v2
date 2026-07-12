const express = require("express");
const marketHistoryController = require("../controllers/marketHistoryController");

const router = express.Router();

router.get("/", marketHistoryController.getAll);
router.get("/:id", marketHistoryController.getById);
router.post("/", marketHistoryController.create);
router.put("/:id", marketHistoryController.update);
router.delete("/:id", marketHistoryController.remove);

module.exports = router;
