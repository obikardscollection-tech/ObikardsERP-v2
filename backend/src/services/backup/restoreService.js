const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const prisma = require("../../lib/prisma");
const { backupDirectory } = require("../../config/backupConfig");
const { photoDirectory } = require("../../config/inventoryPhotoConfig");
const { backupError } = require("./backupErrors");
const { buildBackupIdentity, createBackupCore } = require("./backupService");
const { withMaintenanceLock } = require("./maintenanceLock");
const { inspectPhotoConsistency } = require("./photoConsistencyService");
const { prepareBackup } = require("./preflightService");
const { inspectPostgresTools, restoreDatabaseDump } = require("./postgresToolsService");

async function copyDirectory(source, destination) {
  await fs.cp(source, destination, { recursive: true, errorOnExist: true, force: false });
}

async function validateRestoredDatabase(restoredPhotosDirectory) {
  const inventoryRows = await prisma.inventory.findMany({
    select: { id: true, frontPhoto: true, backPhoto: true, extraPhotos: true },
  });
  return inspectPhotoConsistency({ inventoryRows, photoDirectory: restoredPhotosDirectory });
}

async function validateClientPhotos(client, restoredPhotosDirectory) {
  const inventoryRows = await client.inventory.findMany({
    select: { id: true, frontPhoto: true, backPhoto: true, extraPhotos: true },
  });
  return inspectPhotoConsistency({ inventoryRows, photoDirectory: restoredPhotosDirectory });
}

async function swapPhotoDirectories(preparedPhotos, operationId) {
  const nextDirectory = `${photoDirectory}.restore-${operationId}`;
  const previousDirectory = `${photoDirectory}.previous-${operationId}`;
  let hadPrevious = false;
  try {
    await fs.rm(nextDirectory, { recursive: true, force: true });
    await fs.rm(previousDirectory, { recursive: true, force: true });
    await copyDirectory(preparedPhotos, nextDirectory);
    try {
      await fs.rename(photoDirectory, previousDirectory);
      hadPrevious = true;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await fs.rename(nextDirectory, photoDirectory);
    return { hadPrevious, nextDirectory, previousDirectory };
  } catch (error) {
    if (hadPrevious) {
      await fs.rm(photoDirectory, { recursive: true, force: true });
      await fs.rename(previousDirectory, photoDirectory);
    }
    await fs.rm(nextDirectory, { recursive: true, force: true });
    throw error;
  }
}

async function restoreBackup(filename) {
  const postgresVersions = await inspectPostgresTools();
  return withMaintenanceLock("RESTORE", async () => {
    const operationId = crypto.randomUUID();
    const safetyIdentity = buildBackupIdentity();
    let selected;
    let safety;
    let databaseRestoreStarted = false;
    let photoSwap = null;

    try {
      selected = await prepareBackup(filename, { keepExtracted: true, postgresVersions });
      const safetyMetadata = await createBackupCore(safetyIdentity, postgresVersions);
      safety = await prepareBackup(safetyMetadata.filename, { keepExtracted: true, postgresVersions });

      await prisma.$disconnect();
      databaseRestoreStarted = true;
      await restoreDatabaseDump(selected.dumpPath || path.join(selected.extractedDirectory, "database.dump"), process.env.DIRECT_URL);
      await validateRestoredDatabase(path.join(selected.extractedDirectory, "photos"));
      await prisma.authSession.deleteMany({});
      photoSwap = await swapPhotoDirectories(path.join(selected.extractedDirectory, "photos"), operationId);
      await validateRestoredDatabase(photoDirectory);
      if (photoSwap.hadPrevious) await fs.rm(photoSwap.previousDirectory, { recursive: true, force: true });

      return {
        restored: true,
        backup: selected.manifest,
        safetyBackup: safetyMetadata.filename,
        sessionsPurged: true,
      };
    } catch (error) {
      if (databaseRestoreStarted && safety) {
        try {
          await prisma.$disconnect();
          await restoreDatabaseDump(path.join(safety.extractedDirectory, "database.dump"), process.env.DIRECT_URL);
          await prisma.authSession.deleteMany({});
          if (photoSwap?.hadPrevious) {
            await fs.rm(photoDirectory, { recursive: true, force: true });
            await fs.rename(photoSwap.previousDirectory, photoDirectory);
          } else if (photoSwap) {
            await fs.rm(photoDirectory, { recursive: true, force: true });
          }
        } catch (rollbackError) {
          throw backupError("La restauration et son rollback ont echoue. Intervention manuelle requise.", {
            code: "RESTORE_ROLLBACK_FAILED",
            details: { restoreError: error.message, rollbackError: rollbackError.message },
          });
        }
      }
      throw error;
    } finally {
      for (const prepared of [selected, safety]) {
        if (prepared?.extractedDirectory) {
          await fs.rm(prepared.extractedDirectory, { recursive: true, force: true });
        }
      }
      await fs.rm(`${photoDirectory}.restore-${operationId}`, { recursive: true, force: true }).catch(() => {});
      await fs.rm(`${photoDirectory}.previous-${operationId}`, { recursive: true, force: true }).catch(() => {});
    }
  });
}

async function restoreBackupToTarget(filename, options) {
  if (!options?.databaseUrl || !options?.photoDirectory) {
    throw backupError("Une base et un repertoire photo cibles sont obligatoires.", {
      code: "RESTORE_TARGET_REQUIRED",
      statusCode: 400,
    });
  }
  if (options.databaseUrl === process.env.DIRECT_URL || path.resolve(options.photoDirectory) === photoDirectory) {
    throw backupError("La cible de restauration isolee doit etre distincte de la source.", {
      code: "RESTORE_TARGET_NOT_ISOLATED",
      statusCode: 400,
    });
  }

  const prepared = await prepareBackup(filename, {
    databaseUrl: options.databaseUrl,
    keepExtracted: true,
  });
  const client = new PrismaClient({ datasources: { db: { url: options.databaseUrl } } });
  const temporaryPhotos = `${path.resolve(options.photoDirectory)}.staging-${crypto.randomUUID()}`;

  try {
    await restoreDatabaseDump(prepared.dumpPath, options.databaseUrl);
    await fs.rm(temporaryPhotos, { recursive: true, force: true });
    await copyDirectory(path.join(prepared.extractedDirectory, "photos"), temporaryPhotos);
    await validateClientPhotos(client, temporaryPhotos);
    await client.authSession.deleteMany({});
    await fs.rm(path.resolve(options.photoDirectory), { recursive: true, force: true });
    await fs.rename(temporaryPhotos, path.resolve(options.photoDirectory));
    await validateClientPhotos(client, path.resolve(options.photoDirectory));
    return { restored: true, manifest: prepared.manifest, sessionsPurged: true };
  } finally {
    await client.$disconnect();
    await fs.rm(temporaryPhotos, { recursive: true, force: true });
    await fs.rm(prepared.extractedDirectory, { recursive: true, force: true });
  }
}

module.exports = {
  restoreBackup,
  restoreBackupToTarget,
  swapPhotoDirectories,
  validateClientPhotos,
  validateRestoredDatabase,
};