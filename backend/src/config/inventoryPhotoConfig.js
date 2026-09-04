const path = require("node:path");

const configuredDirectory = process.env.INVENTORY_PHOTO_DIR;
const photoDirectory = path.resolve(
  configuredDirectory || path.join(__dirname, "../../data/inventory-photos")
);
const maxPhotoBytes = Number(process.env.INVENTORY_PHOTO_MAX_BYTES || 5 * 1024 * 1024);

if (!Number.isFinite(maxPhotoBytes) || maxPhotoBytes <= 0) {
  throw new Error("INVENTORY_PHOTO_MAX_BYTES doit etre un nombre positif.");
}

module.exports = {
  maxPhotoBytes,
  photoDirectory,
};