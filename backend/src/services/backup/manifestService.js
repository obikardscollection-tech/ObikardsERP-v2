const { PHOTO_NAME_PATTERN } = require("./photoConsistencyService");
const { formatVersion } = require("../../config/backupConfig");
const { backupError } = require("./backupErrors");

function validateManifest(manifest) {
  const valid = manifest
    && typeof manifest === "object"
    && manifest.format === "obikards-backup"
    && manifest.formatVersion === formatVersion
    && typeof manifest.id === "string"
    && typeof manifest.createdAt === "string"
    && Number.isSafeInteger(manifest.photoCount)
    && Number.isSafeInteger(manifest.photoBytes)
    && Number.isSafeInteger(manifest.dumpBytes)
    && Array.isArray(manifest.photos)
    && manifest.photos.length === manifest.photoCount
    && manifest.photos.every((filename) => typeof filename === "string" && PHOTO_NAME_PATTERN.test(filename))
    && new Set(manifest.photos).size === manifest.photos.length
    && Number.isSafeInteger(manifest.postgres?.dumpClientMajor)
    && Number.isSafeInteger(manifest.postgres?.serverMajor)
    && typeof manifest.postgres?.serverVersion === "string";

  if (!valid || Number.isNaN(Date.parse(manifest.createdAt))) {
    throw backupError("Manifest de sauvegarde invalide ou incompatible.", {
      code: "INVALID_BACKUP_MANIFEST",
      statusCode: 400,
    });
  }
  return manifest;
}

module.exports = { validateManifest };