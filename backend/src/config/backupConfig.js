const path = require("node:path");

function positiveInteger(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} doit etre un entier positif.`);
  }
  return value;
}

module.exports = {
  archivePrefix: "obikards-backup-",
  backupDirectory: path.resolve(process.env.BACKUP_DIR || path.join(__dirname, "../../data/backups")),
  formatVersion: 1,
  maxArchiveBytes: positiveInteger("BACKUP_MAX_ARCHIVE_BYTES", 2 * 1024 * 1024 * 1024),
  maxCompressionRatio: positiveInteger("BACKUP_MAX_COMPRESSION_RATIO", 100),
  maxEntries: positiveInteger("BACKUP_MAX_ENTRIES", 20000),
  maxExtractedBytes: positiveInteger("BACKUP_MAX_EXTRACTED_BYTES", 5 * 1024 * 1024 * 1024),
  minFreeBytes: positiveInteger("BACKUP_MIN_FREE_BYTES", 512 * 1024 * 1024),
  pgDumpPath: process.env.PG_DUMP_PATH || "pg_dump",
  pgRestorePath: process.env.PG_RESTORE_PATH || "pg_restore",
  psqlPath: process.env.PSQL_PATH || "psql",
};