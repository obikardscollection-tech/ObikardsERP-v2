const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { backupDirectory, minFreeBytes } = require("../../config/backupConfig");
const { extractArchive } = require("./archiveService");
const { backupError } = require("./backupErrors");
const { assertAvailableSpace, ensurePrivateDirectory } = require("./filesystemService");
const { inspectPhotoConsistency } = require("./photoConsistencyService");
const { inspectPostgresTools, validateDatabaseDump } = require("./postgresToolsService");
const { resolveBackupPath } = require("./backupService");

async function validateExtractedBackup(extractedDirectory, manifest) {
  const dumpPath = path.join(extractedDirectory, "database.dump");
  const dumpStats = await fs.stat(dumpPath);
  if (!dumpStats.isFile() || dumpStats.size !== manifest.dumpBytes) {
    throw backupError("La taille du dump ne correspond pas au manifest.", {
      code: "DUMP_SIZE_MISMATCH",
      statusCode: 400,
    });
  }
  await validateDatabaseDump(dumpPath);

  const inventoryRows = manifest.photos.map((filename, index) => ({
    id: `manifest-${index}`,
    frontPhoto: filename,
    backPhoto: null,
    extraPhotos: [],
  }));
  const photoState = await inspectPhotoConsistency({
    inventoryRows,
    photoDirectory: path.join(extractedDirectory, "photos"),
  });
  if (photoState.photoCount !== manifest.photoCount || photoState.photoBytes !== manifest.photoBytes) {
    throw backupError("Les photos ne correspondent pas au manifest.", {
      code: "PHOTO_MANIFEST_MISMATCH",
      statusCode: 400,
    });
  }
  return { dumpPath, photoState };
}

async function prepareBackup(filename, options = {}) {
  await ensurePrivateDirectory(backupDirectory);
  await assertAvailableSpace(backupDirectory, minFreeBytes);
  const postgresVersions = options.postgresVersions || await inspectPostgresTools(options.databaseUrl);
  const archivePath = resolveBackupPath(filename);
  const extractedDirectory = path.join(backupDirectory, `.preflight-${crypto.randomUUID()}`);
  let completed = false;

  try {
    const { manifest } = await extractArchive(archivePath, extractedDirectory);
    await fs.mkdir(path.join(extractedDirectory, "photos"), { recursive: true, mode: 0o700 });
    if (postgresVersions.pgRestoreMajor < manifest.postgres.serverMajor
      || postgresVersions.serverMajor < manifest.postgres.serverMajor) {
      throw backupError("La version PostgreSQL cible est incompatible avec cette sauvegarde.", {
        code: "POSTGRES_VERSION_INCOMPATIBLE",
        statusCode: 400,
        details: {
          backupServerMajor: manifest.postgres.serverMajor,
          restoreClientMajor: postgresVersions.pgRestoreMajor,
          targetServerMajor: postgresVersions.serverMajor,
        },
      });
    }
    const extracted = await validateExtractedBackup(extractedDirectory, manifest);
    completed = true;
    if (options.keepExtracted) return { archivePath, extractedDirectory, manifest, postgresVersions, ...extracted };
    return { manifest, postgresVersions };
  } finally {
    if (!options.keepExtracted || !completed) await fs.rm(extractedDirectory, { recursive: true, force: true });
  }
}

async function preflightBackup(filename) {
  const result = await prepareBackup(filename);
  return { valid: true, manifest: result.manifest, postgres: result.postgresVersions };
}

module.exports = {
  preflightBackup,
  prepareBackup,
  validateExtractedBackup,
};