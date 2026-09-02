const { rateLimit } = require("express-rate-limit");

const loginRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_LOGIN_WINDOW_MS || 15 * 60 * 1000),
  limit: Number(process.env.AUTH_LOGIN_MAX_ATTEMPTS || 5),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler(req, res) {
    res.status(429).json({ message: "Trop de tentatives de connexion. Réessayez plus tard." });
  },
});

module.exports = {
  loginRateLimiter,
};