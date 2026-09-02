const { frontendOrigin } = require("../config/authConfig");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function originGuard(req, res, next) {
  const origin = req.get("origin");

  if (SAFE_METHODS.has(req.method) || !origin || origin === frontendOrigin) {
    return next();
  }

  return res.status(403).json({ message: "Origine non autorisée." });
}

module.exports = {
  originGuard,
};