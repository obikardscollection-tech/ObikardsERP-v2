const { beginMutation, getMaintenanceState } = require("../services/backup/maintenanceLock");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function maintenanceBarrier(req, res, next) {
  if (req.path.startsWith("/backups")) return next();

  const maintenance = getMaintenanceState();
  if (maintenance.active && maintenance.operation === "RESTORE") {
    return res.status(503).json({
      code: "MAINTENANCE_ACTIVE",
      message: "Une restauration est en cours.",
    });
  }
  if (SAFE_METHODS.has(req.method)) return next();

  try {
    const endMutation = beginMutation();
    res.once("finish", endMutation);
    res.once("close", endMutation);
    return next();
  } catch (error) {
    return res.status(error.statusCode || 503).json({
      code: error.code,
      message: error.message,
    });
  }
}

module.exports = {
  maintenanceBarrier,
};