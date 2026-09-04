function backupError(message, options = {}) {
  const error = new Error(message);
  error.code = options.code || "BACKUP_ERROR";
  error.statusCode = options.statusCode || 500;
  if (options.details) error.details = options.details;
  return error;
}

module.exports = { backupError };