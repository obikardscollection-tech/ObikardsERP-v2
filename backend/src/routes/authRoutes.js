const express = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/authenticate");
const { loginRateLimiter } = require("../middlewares/loginRateLimiter");

const router = express.Router();

router.post("/login", loginRateLimiter, authController.loginUser);
router.post("/logout", authController.logoutUser);
router.get("/me", authenticate, authController.getCurrentUser);

module.exports = router;