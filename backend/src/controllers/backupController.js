const backupService = require("../services/backup/backupService");
const { preflightBackup } = require("../services/backup/preflightService");
const { restoreBackup } = require("../services/backup/restoreService");

function sendError(res, error) {
  console.error(`[${error.code || "BACKUP_ERROR"}]`, error);
  const details = error.details ? { ...error.details } : null;
  if (details) {
    delete details.stderr;
    delete details.restoreError;
    delete details.rollbackError;
  }
  return res.status(error.statusCode || 500).json({
    code: error.code || "BACKUP_ERROR",
    message: error.message,
    ...(details && Object.keys(details).length > 0 ? { details } : {}),
  });
}

async function create(req, res) {
  try {
    return res.status(201).json(await backupService.createBackup());
  } catch (error) {
    return sendError(res, error);
  }
}

async function list(req, res) {
  try {
    return res.json({ backups: await backupService.listBackups() });
  } catch (error) {
    return sendError(res, error);
  }
}

async function metadata(req, res) {
  try {
    return res.json(await backupService.getBackupMetadata(req.params.filename));
  } catch (error) {
    return sendError(res, error);
  }
}

async function download(req, res) {
  try {
    const archivePath = backupService.resolveBackupPath(req.params.filename);
    await backupService.getBackupMetadata(req.params.filename);
    return res.download(archivePath, req.params.filename);
  } catch (error) {
    return sendError(res, error);
  }
}

async function remove(req, res) {
  try {
    await backupService.deleteBackup(req.params.filename);
    return res.status(204).end();
  } catch (error) {
    return sendError(res, error);
  }
}

async function preflight(req, res) {
  try {
    return res.json(await preflightBackup(req.params.filename));
  } catch (error) {
    return sendError(res, error);
  }
}

async function restore(req, res) {
  const expectedConfirmation = `RESTAURER ${req.params.filename}`;
  if (req.body?.confirmation !== expectedConfirmation) {
    return res.status(400).json({
      code: "RESTORE_CONFIRMATION_REQUIRED",
      message: `Saisissez exactement: ${expectedConfirmation}`,
    });
  }
  try {
    return res.json(await restoreBackup(req.params.filename));
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = { create, download, list, metadata, preflight, remove, restore, sendError };