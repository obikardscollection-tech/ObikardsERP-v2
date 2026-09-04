const fs = require("node:fs/promises");
const path = require("node:path");
const { backupError } = require("./backupErrors");

async function ensurePrivateDirectory(directory) {
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
}

async function assertAvailableSpace(directory, requiredBytes) {
  await ensurePrivateDirectory(directory);
  if (typeof fs.statfs !== "function") return;

  const stats = await fs.statfs(directory);
  const availableBytes = Number(stats.bavail) * Number(stats.bsize);
  if (availableBytes < requiredBytes) {
    throw backupError("Espace disque insuffisant pour l'operation.", {
      code: "INSUFFICIENT_DISK_SPACE",
      statusCode: 507,
      details: { availableBytes, requiredBytes },
    });
  }
}

function assertSafeFilename(filename) {
  if (!filename || path.basename(filename) !== filename || filename.includes("\0")) {
    throw backupError("Nom de fichier de sauvegarde invalide.", {
      code: "INVALID_BACKUP_FILENAME",
      statusCode: 400,
    });
  }
  return filename;
}

module.exports = {
  assertAvailableSpace,
  assertSafeFilename,
  ensurePrivateDirectory,
};