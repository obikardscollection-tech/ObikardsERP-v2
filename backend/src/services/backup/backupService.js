const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const {
  archivePrefix,
  backupDirectory,
  formatVersion,
  minFreeBytes,
} = require("../../config/backupConfig");
const { photoDirectory } = require("../../config/inventoryPhotoConfig");
const { createArchive, extractArchive, readArchiveEntry } = require("./archiveService");
const { createChecksums, parseChecksums, verifyChecksums } = require("./checksumService");
const { assertAvailableSpace, assertSafeFilename, ensurePrivateDirectory } = require("./filesystemService");
const { withMaintenanceLock } = require("./maintenanceLock");
const { validateManifest } = require("./manifestService");
const { inspectPhotoConsistency } = require("./photoConsistencyService");
const { createDatabaseDump, inspectPostgresTools } = require("./postgresToolsService");
const { backupError } = require("./backupErrors");
const packageInfo = require("../../../package.json");

function buildBackupIdentity() {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  return { id, filename: `${archivePrefix}${timestamp}-${id}.zip` };
}

function resolveBackupPath(filename) {
  assertSafeFilename(filename);
  if (!filename.startsWith(archivePrefix) || !filename.endsWith(".zip")) {
    throw backupError("Nom de sauvegarde invalide.", { code: "INVALID_BACKUP_FILENAME", statusCode: 400 });
  }
  return path.join(backupDirectory, filename);
}

async function createBackupCore(identity, postgresVersions) {
  const stagingDirectory = path.join(backupDirectory, `.staging-${identity.id}`);
  const temporaryArchive = path.join(backupDirectory, `.${identity.filename}.partial`);
  const finalArchive = resolveBackupPath(identity.filename);
  const photosStaging = path.join(stagingDirectory, "photos");
  const validationDirectory = path.join(stagingDirectory, "archive-validation");

  try {
    await fs.mkdir(photosStaging, { recursive: true, mode: 0o700 });
    const photoState = await inspectPhotoConsistency();
    await assertAvailableSpace(backupDirectory, Math.max(minFreeBytes, photoState.photoBytes * 3));

    const dumpPath = path.join(stagingDirectory, "database.dump");
    await createDatabaseDump(dumpPath);
    const dumpStats = await fs.stat(dumpPath);
    if (!dumpStats.isFile() || dumpStats.size === 0) {
      throw backupError("pg_dump n'a pas produit de dump exploitable.", { code: "EMPTY_DATABASE_DUMP" });
    }

    for (const photo of photoState.files) {
      await fs.copyFile(photo.filePath, path.join(photosStaging, photo.filename), fs.constants.COPYFILE_EXCL);
    }

    const manifest = {
      format: "obikards-backup",
      formatVersion,
      id: identity.id,
      createdAt: new Date().toISOString(),
      application: { name: packageInfo.name, version: packageInfo.version, commit: process.env.GIT_COMMIT || null },
      postgres: {
        dumpClientMajor: postgresVersions.pgDumpMajor,
        serverMajor: postgresVersions.serverMajor,
        serverVersion: postgresVersions.server,
      },
      dumpBytes: dumpStats.size,
      photoBytes: photoState.photoBytes,
      photoCount: photoState.photoCount,
      photos: photoState.files.map(({ filename }) => filename).sort(),
      ignoredOrphanPhotoCount: photoState.orphanFiles.length,
    };
    await fs.writeFile(path.join(stagingDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });

    const checksumEntries = [
      { archivePath: "database.dump", filePath: dumpPath },
      ...manifest.photos.map((filename) => ({
        archivePath: `photos/${filename}`,
        filePath: path.join(photosStaging, filename),
      })),
    ];
    const checksumPath = path.join(stagingDirectory, "checksums.sha256");
    await createChecksums(checksumEntries, checksumPath);
    await verifyChecksums(stagingDirectory, parseChecksums(await fs.readFile(checksumPath, "utf8")), checksumEntries.map(({ archivePath }) => archivePath));

    await createArchive(stagingDirectory, temporaryArchive);
    const verified = await extractArchive(temporaryArchive, validationDirectory);
    if (verified.manifest.id !== identity.id) {
      throw backupError("L'archive publiee ne correspond pas au backup courant.", { code: "ARCHIVE_ID_MISMATCH" });
    }
    await fs.rename(temporaryArchive, finalArchive);
    const archiveStats = await fs.stat(finalArchive);
    return { ...manifest, filename: identity.filename, archiveBytes: archiveStats.size };
  } finally {
    await fs.rm(stagingDirectory, { recursive: true, force: true });
    await fs.rm(temporaryArchive, { force: true });
  }
}

async function createBackup() {
  await ensurePrivateDirectory(backupDirectory);
  await assertAvailableSpace(backupDirectory, minFreeBytes);
  const postgresVersions = await inspectPostgresTools();
  const identity = buildBackupIdentity();
  return withMaintenanceLock("BACKUP", () => createBackupCore(identity, postgresVersions));
}

async function getBackupMetadata(filename) {
  const archivePath = resolveBackupPath(filename);
  const manifest = validateManifest(JSON.parse((await readArchiveEntry(archivePath, "manifest.json")).toString("utf8")));
  const stats = await fs.stat(archivePath);
  return { ...manifest, filename, archiveBytes: stats.size };
}

async function listBackups() {
  await ensurePrivateDirectory(backupDirectory);
  const entries = await fs.readdir(backupDirectory, { withFileTypes: true });
  const backups = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.startsWith(archivePrefix) || !entry.name.endsWith(".zip")) continue;
    try {
      backups.push(await getBackupMetadata(entry.name));
    } catch (error) {
      backups.push({ filename: entry.name, valid: false, error: error.code || "INVALID_ARCHIVE" });
    }
  }
  return backups.sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
}

async function deleteBackup(filename) {
  const archivePath = resolveBackupPath(filename);
  await fs.unlink(archivePath).catch((error) => {
    if (error.code === "ENOENT") throw backupError("Sauvegarde introuvable.", { code: "BACKUP_NOT_FOUND", statusCode: 404 });
    throw error;
  });
}

module.exports = {
  buildBackupIdentity,
  createBackup,
  createBackupCore,
  deleteBackup,
  getBackupMetadata,
  listBackups,
  resolveBackupPath,
};