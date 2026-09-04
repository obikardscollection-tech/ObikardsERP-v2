const fs = require("node:fs/promises");
const path = require("node:path");
const prisma = require("../../lib/prisma");
const { photoDirectory } = require("../../config/inventoryPhotoConfig");
const { backupError } = require("./backupErrors");

const PHOTO_NAME_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

function photoNames(inventory) {
  const extras = Array.isArray(inventory.extraPhotos) ? inventory.extraPhotos : [];
  return [inventory.frontPhoto, inventory.backPhoto, ...extras].filter(Boolean);
}

async function assertPhotoContent(filename, filePath) {
  const handle = await fs.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buffer, 0, 12, 0);
    const data = buffer.subarray(0, bytesRead);
    const valid = filename.endsWith(".png")
      ? data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : filename.endsWith(".jpg")
        ? data.length >= 3 && data[0] === 255 && data[1] === 216 && data[2] === 255
        : data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP";
    if (!valid) throw new Error("signature invalide");
  } finally {
    await handle.close();
  }
}

async function inspectPhotoConsistency(options = {}) {
  const sourceDirectory = options.photoDirectory || photoDirectory;
  const inventoryRows = options.inventoryRows || await prisma.inventory.findMany({
    select: { id: true, frontPhoto: true, backPhoto: true, extraPhotos: true },
  });
  const references = new Map();
  const problems = [];

  for (const inventory of inventoryRows) {
    for (const filename of photoNames(inventory)) {
      if (!PHOTO_NAME_PATTERN.test(filename) || path.basename(filename) !== filename) {
        problems.push({ inventoryId: inventory.id, filename, reason: "INVALID_NAME" });
        continue;
      }
      if (references.has(filename)) {
        problems.push({ inventoryId: inventory.id, filename, reason: "DUPLICATE_REFERENCE" });
        continue;
      }
      references.set(filename, inventory.id);
    }
  }

  const files = [];
  for (const [filename, inventoryId] of references) {
    const filePath = path.join(sourceDirectory, filename);
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) throw new Error("not a file");
      await assertPhotoContent(filename, filePath);
      files.push({ filename, filePath, inventoryId, size: stats.size });
    } catch (error) {
      problems.push({ inventoryId, filename, reason: error.code === "ENOENT" ? "MISSING_FILE" : "INVALID_FILE" });
    }
  }

  if (problems.length > 0) {
    throw backupError("La coherence entre Inventory et les photos est invalide.", {
      code: "PHOTO_CONSISTENCY_FAILED",
      statusCode: 409,
      details: { problems },
    });
  }

  let directoryEntries = [];
  try {
    directoryEntries = await fs.readdir(sourceDirectory, { withFileTypes: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const orphanFiles = directoryEntries
    .filter((entry) => entry.isFile() && !references.has(entry.name))
    .map((entry) => entry.name);

  return {
    files,
    orphanFiles,
    photoBytes: files.reduce((total, file) => total + file.size, 0),
    photoCount: files.length,
  };
}

module.exports = {
  PHOTO_NAME_PATTERN,
  inspectPhotoConsistency,
  photoNames,
};