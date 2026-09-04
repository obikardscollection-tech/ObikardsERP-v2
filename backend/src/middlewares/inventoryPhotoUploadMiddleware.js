const multer = require("multer");
const { maxPhotoBytes } = require("../config/inventoryPhotoConfig");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxPhotoBytes, files: 1 },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Format photo non autorise."));
    }
    return callback(null, true);
  },
});

function uploadInventoryPhoto(req, res, next) {
  upload.single("photo")(req, res, (error) => {
    if (error) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "La photo depasse la taille maximale autorisee."
        : error.message;
      return res.status(400).json({ error: message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "La photo est requise." });
    }

    return next();
  });
}

module.exports = {
  uploadInventoryPhoto,
};