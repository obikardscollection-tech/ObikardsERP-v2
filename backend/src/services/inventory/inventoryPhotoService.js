const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const prisma = require("../../lib/prisma");
const { photoDirectory } = require("../../config/inventoryPhotoConfig");

const SLOT_FIELDS = {
  front: "frontPhoto",
  back: "backPhoto",
  extra: "extraPhotos",
};
const MAX_EXTRA_PHOTOS = 10;
const FILE_NAME_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseExtraPhotos(value) {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
}

function detectPhotoType(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { extension: "png", contentType: "image/png" };
  }
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { extension: "webp", contentType: "image/webp" };
  }
  throw httpError("Le contenu du fichier ne correspond pas a une image autorisee.", 400);
}

function resolveStoredPath(filename) {
  if (!FILE_NAME_PATTERN.test(filename || "")) {
    throw httpError("Nom de photo invalide.", 400);
  }
  const resolved = path.resolve(photoDirectory, filename);
  if (path.dirname(resolved) !== photoDirectory) {
    throw httpError("Chemin de photo invalide.", 400);
  }
  return resolved;
}

async function removeFile(filename) {
  if (!filename) return;
  try {
    await fs.unlink(resolveStoredPath(filename));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function writePhoto(buffer) {
  const type = detectPhotoType(buffer);
  const filename = `${crypto.randomUUID()}.${type.extension}`;
  const finalPath = resolveStoredPath(filename);
  const temporaryPath = `${finalPath}.tmp`;
  await fs.mkdir(photoDirectory, { recursive: true });
  try {
    await fs.writeFile(temporaryPath, buffer, { flag: "wx" });
    await fs.rename(temporaryPath, finalPath);
    return filename;
  } catch (error) {
    await fs.rm(temporaryPath, { force: true });
    throw error;
  }
}

async function findInventoryPhotos(id) {
  const inventory = await prisma.inventory.findUnique({
    where: { id },
    select: { id: true, frontPhoto: true, backPhoto: true, extraPhotos: true },
  });
  if (!inventory) throw httpError("Inventory introuvable.", 404);
  return inventory;
}

async function uploadInventoryPhoto(id, slot, file) {
  const field = SLOT_FIELDS[slot];
  if (!field) throw httpError("Emplacement photo invalide.", 400);
  const inventory = await findInventoryPhotos(id);
  const currentExtraPhotos = parseExtraPhotos(inventory.extraPhotos);
  if (slot === "extra" && currentExtraPhotos.length >= MAX_EXTRA_PHOTOS) {
    throw httpError(`Un Inventory ne peut pas contenir plus de ${MAX_EXTRA_PHOTOS} photos supplementaires.`, 400);
  }
  const filename = await writePhoto(file.buffer);
  const previousFilename = slot === "extra" ? null : inventory[field];
  const data = slot === "extra"
    ? { extraPhotos: [...currentExtraPhotos, filename] }
    : { [field]: filename };

  let updated;
  try {
    updated = await prisma.inventory.update({ where: { id }, data });
  } catch (error) {
    await removeFile(filename);
    throw error;
  }

  if (previousFilename) {
    try {
      await removeFile(previousFilename);
    } catch (error) {
      await prisma.inventory.update({ where: { id }, data: { [field]: previousFilename } });
      await removeFile(filename);
      throw error;
    }
  }
  return updated;
}

function findPhotoField(inventory, filename) {
  if (inventory.frontPhoto === filename) return { field: "frontPhoto", value: null };
  if (inventory.backPhoto === filename) return { field: "backPhoto", value: null };
  const extras = parseExtraPhotos(inventory.extraPhotos);
  if (extras.includes(filename)) {
    return { field: "extraPhotos", value: extras.filter((entry) => entry !== filename) };
  }
  throw httpError("Photo introuvable pour cet Inventory.", 404);
}

async function getInventoryPhoto(id, filename) {
  const inventory = await findInventoryPhotos(id);
  findPhotoField(inventory, filename);
  const filePath = resolveStoredPath(filename);
  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code === "ENOENT") throw httpError("Fichier photo introuvable.", 404);
    throw error;
  }
  const contentType = filename.endsWith(".png") ? "image/png" : filename.endsWith(".webp") ? "image/webp" : "image/jpeg";
  return { filePath, contentType };
}

async function deleteInventoryPhoto(id, filename) {
  const inventory = await findInventoryPhotos(id);
  const association = findPhotoField(inventory, filename);
  const sourcePath = resolveStoredPath(filename);
  const stagedPath = `${sourcePath}.delete-${crypto.randomUUID()}`;
  let staged = false;
  try {
    await fs.rename(sourcePath, stagedPath);
    staged = true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  try {
    const updated = await prisma.inventory.update({
      where: { id },
      data: { [association.field]: association.value },
    });
    if (staged) await fs.unlink(stagedPath);
    return updated;
  } catch (error) {
    if (staged) await fs.rename(stagedPath, sourcePath);
    throw error;
  }
}

async function stageInventoryPhotoFiles(inventory) {
  const filenames = [
    inventory.frontPhoto,
    inventory.backPhoto,
    ...parseExtraPhotos(inventory.extraPhotos),
  ].filter(Boolean);
  const stagedFiles = [];

  try {
    for (const filename of filenames) {
      const sourcePath = resolveStoredPath(filename);
      const stagedPath = `${sourcePath}.delete-${crypto.randomUUID()}`;
      try {
        await fs.rename(sourcePath, stagedPath);
        stagedFiles.push({ sourcePath, stagedPath });
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    return stagedFiles;
  } catch (error) {
    await Promise.all(stagedFiles.map(({ sourcePath, stagedPath }) => fs.rename(stagedPath, sourcePath)));
    throw error;
  }
}

async function restoreStagedInventoryPhotoFiles(stagedFiles) {
  await Promise.all(stagedFiles.map(({ sourcePath, stagedPath }) => fs.rename(stagedPath, sourcePath)));
}

async function removeStagedInventoryPhotoFiles(stagedFiles) {
  await Promise.all(stagedFiles.map(({ stagedPath }) => fs.rm(stagedPath, { force: true })));
}

module.exports = {
  deleteInventoryPhoto,
  getInventoryPhoto,
  removeStagedInventoryPhotoFiles,
  restoreStagedInventoryPhotoFiles,
  stageInventoryPhotoFiles,
  uploadInventoryPhoto,
};