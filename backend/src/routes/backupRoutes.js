const express = require("express");
const backupController = require("../controllers/backupController");
const { authorize } = require("../middlewares/authorize");

const router = express.Router();
router.use(authorize("ADMIN"));

router.get("/", backupController.list);
router.post("/", backupController.create);
router.get("/:filename", backupController.metadata);
router.get("/:filename/download", backupController.download);
router.post("/:filename/preflight", backupController.preflight);
router.post("/:filename/restore", backupController.restore);
router.delete("/:filename", backupController.remove);

module.exports = router;