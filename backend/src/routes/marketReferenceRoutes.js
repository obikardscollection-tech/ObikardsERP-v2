const express = require("express");
const marketReferenceController = require("../controllers/marketReferenceController");

const router = express.Router();

router.get("/", marketReferenceController.getAll);
router.get("/:id", marketReferenceController.getById);
router.post("/", marketReferenceController.create);
router.put("/:id", marketReferenceController.update);
router.delete("/:id", marketReferenceController.remove);

module.exports = router;
