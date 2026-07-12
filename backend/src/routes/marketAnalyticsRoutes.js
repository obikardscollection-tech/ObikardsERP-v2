const express = require("express");
const marketAnalyticsController = require("../controllers/marketAnalyticsController");

const router = express.Router();

router.get("/", marketAnalyticsController.getAll);
router.get("/:id", marketAnalyticsController.getById);
router.post("/", marketAnalyticsController.create);
router.put("/:id", marketAnalyticsController.update);
router.delete("/:id", marketAnalyticsController.remove);

module.exports = router;
