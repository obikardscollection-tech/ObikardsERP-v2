const path = require("path");
const multer = require("multer");

const INTERNALS = {
  DEFAULT_MAX_SIZE_BYTES: 10 * 1024 * 1024,
  FIELD_NAME: "file",
  ALLOWED_MIME_TYPES: [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
  ],
};

/**
 * Normalize upload failures into explicit CSV error messages.
 * @param {unknown} error
 * @returns {string}
 */
function resolveUploadErrorMessage(error) {
  if (error && error.code === "LIMIT_FILE_SIZE") {
    return "Le fichier CSV depasse la taille maximale autorisee.";
  }

  return error && typeof error.message === "string"
    ? error.message
    : "Le fichier CSV est invalide.";
}

/**
 * Build the error payload returned for invalid CSV uploads.
 * @param {string} message
 * @returns {{error:string}}
 */
function createErrorPayload(message) {
  return {
    error: message,
  };
}

/**
 * Check whether the uploaded file looks like a CSV.
 * @param {Express.Multer.File|undefined} file
 * @returns {boolean}
 */
function isCsvFile(file) {
  if (!file) {
    return false;
  }

  const extension = path.extname(file.originalname || "").toLowerCase();

  return (
    extension === ".csv" &&
    INTERNALS.ALLOWED_MIME_TYPES.includes(file.mimetype)
  );
}

/**
 * Create a reusable CSV upload middleware.
 * @param {{fieldName?:string, maxSizeBytes?:number}} [options]
 * @returns {function}
 */
function createInventoryCsvUploadMiddleware(options = {}) {
  const fieldName = options.fieldName || INTERNALS.FIELD_NAME;
  const maxSizeBytes = options.maxSizeBytes || INTERNALS.DEFAULT_MAX_SIZE_BYTES;
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeBytes,
    },
    fileFilter(req, file, callback) {
      if (isCsvFile(file)) {
        return callback(null, true);
      }

      return callback(new Error("Le fichier uploadé doit être un CSV valide."));
    },
  });

  return function inventoryCsvUploadMiddleware(req, res, next) {
    upload.single(fieldName)(req, res, (error) => {
      if (error) {
        return res.status(400).json(createErrorPayload(resolveUploadErrorMessage(error)));
      }

      if (!req.file) {
        return res.status(400).json(createErrorPayload("Le fichier CSV est requis."));
      }

      if (!isCsvFile(req.file)) {
        return res.status(400).json(createErrorPayload("Le fichier uploadé doit être un CSV valide."));
      }

      return next();
    });
  };
}

const uploadInventoryCsv = createInventoryCsvUploadMiddleware();

module.exports = {
  createInventoryCsvUploadMiddleware,
  uploadInventoryCsv,
};