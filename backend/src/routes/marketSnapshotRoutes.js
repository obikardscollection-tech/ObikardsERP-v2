const express = require("express");
const marketSnapshotController = require("../controllers/marketSnapshotController");

const router = express.Router();

router.get("/", marketSnapshotController.getAll);
router.get("/:id", marketSnapshotController.getById);
router.post("/", marketSnapshotController.create);
router.put("/:id", marketSnapshotController.update);
router.delete("/:id", marketSnapshotController.remove);

module.exports = router;
