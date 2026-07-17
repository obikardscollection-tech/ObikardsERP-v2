const express = require("express");
const cardReferenceController = require("../controller/cardReferenceController");

const router = express.Router();

// Foundation-only route. No CRUD surface in this sprint.
router.get("/foundation", cardReferenceController.getFoundationMetadata);

module.exports = router;
