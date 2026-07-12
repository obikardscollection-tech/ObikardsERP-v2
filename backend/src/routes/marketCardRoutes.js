const express = require("express");
const marketCardController = require("../controllers/marketCardController");

const router = express.Router();

router.get("/", marketCardController.getAll);
router.get("/:id", marketCardController.getById);
router.post("/", marketCardController.create);
router.put("/:id", marketCardController.update);
router.delete("/:id", marketCardController.remove);

module.exports = router;