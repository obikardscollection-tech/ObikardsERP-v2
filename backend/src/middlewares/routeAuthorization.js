const { authorize } = require("./authorize");

const adminOnly = authorize("ADMIN");

function requiresAdmin(req) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return false;
  if (req.path === "/inventory/import/csv") return true;
  return req.path.startsWith("/market/");
}

function enforceRouteAuthorization(req, res, next) {
  if (!requiresAdmin(req)) return next();
  return adminOnly(req, res, next);
}

module.exports = {
  enforceRouteAuthorization,
  requiresAdmin,
};