const {
  ENV,
  DEFAULTS,
  IMPORT_SOURCE,
  ERROR_CODES,
} = require("./sportsCardsProConstants");
const { SyncError } = require("./sportsCardsProHelpers");

function resolveFilePath(inputFilePath) {
  const candidate =
    typeof inputFilePath === "string" && inputFilePath.trim() !== ""
      ? inputFilePath.trim()
      : process.env[ENV.DEFAULT_CSV_PATH];

  if (typeof candidate !== "string" || candidate.trim() === "") {
    throw new SyncError(
      "Le chemin du fichier SportsCardsPro CSV est requis.",
      ERROR_CODES.INVALID_CSV_PATH
    );
  }

  return candidate;
}

function resolveStaleMinutes() {
  const raw = process.env[ENV.STALE_MINUTES];

  if (!raw) {
    return DEFAULTS.STALE_MINUTES;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULTS.STALE_MINUTES;
  }

  return parsed;
}

function normalizeImportSource(source) {
  if (source === IMPORT_SOURCE.SCHEDULER) {
    return IMPORT_SOURCE.SCHEDULER;
  }

  return IMPORT_SOURCE.MANUAL;
}

function isAutoSyncEnabled() {
  const value = process.env[ENV.AUTO_SYNC_ENABLED];

  if (value === undefined || value === null) {
    return DEFAULTS.AUTO_SYNC_ENABLED;
  }

  return String(value).trim().toLowerCase() === "true";
}

function resolveAutoSyncIntervalMinutes() {
  const raw = process.env[ENV.AUTO_SYNC_INTERVAL_MINUTES];

  if (!raw) {
    return DEFAULTS.AUTO_SYNC_INTERVAL_MINUTES;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULTS.AUTO_SYNC_INTERVAL_MINUTES;
  }

  return parsed;
}

function resolveAutoSyncCsvPath() {
  return resolveFilePath(process.env[ENV.DEFAULT_CSV_PATH]);
}

module.exports = {
  resolveFilePath,
  resolveStaleMinutes,
  normalizeImportSource,
  isAutoSyncEnabled,
  resolveAutoSyncIntervalMinutes,
  resolveAutoSyncCsvPath,
};
