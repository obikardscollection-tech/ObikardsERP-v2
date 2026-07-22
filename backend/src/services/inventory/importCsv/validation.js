const path = require("path");

const { INTERNALS } = require("./constants");

/**
 * Build a structured HTTP 400 validation error.
 * @param {string} message
 * @returns {Error & {statusCode:number}}
 */
function createBadRequestError(message) {
  const error = new Error(message);

  error.statusCode = 400;

  return error;
}

/**
 * Validate the uploaded CSV file before the engine runs.
 * @param {{buffer:Buffer, originalname?:string, mimetype?:string}|undefined} file
 */
function assertUploadedCsvFile(file) {
  if (!file || !Buffer.isBuffer(file.buffer)) {
    throw createBadRequestError(INTERNALS.ERRORS.CSV_REQUIRED);
  }

  const extension = path.extname(file.originalname || "").toLowerCase();

  if (extension !== ".csv") {
    throw createBadRequestError(INTERNALS.ERRORS.CSV_INVALID_EXTENSION);
  }

  if (!INTERNALS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw createBadRequestError(INTERNALS.ERRORS.CSV_INVALID_MIMETYPE);
  }
}

/**
 * Ensure matched rows exist and are consumable.
 * @param {unknown} matchedRows
 * @returns {object[]}
 */
function validateMatchedRows(matchedRows) {
  if (!Array.isArray(matchedRows)) {
    throw new Error(INTERNALS.ERRORS.MATCHED_ROWS_NOT_FOUND);
  }

  return matchedRows;
}

/**
 * Check whether a CSV row contains at least one meaningful value.
 * @param {object} row
 * @returns {boolean}
 */
function hasMeaningfulValue(row) {
  for (const value of Object.values(row)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string" && value.trim() === "") {
      continue;
    }

    return true;
  }

  return false;
}

/**
 * Resolve the source CSV row from a matched row payload.
 * Supports both legacy plain rows and structured rows produced by the matcher.
 * @param {unknown} matchedRow
 * @returns {object|null}
 */
function resolveMatchedSourceRow(matchedRow) {
  if (!matchedRow || typeof matchedRow !== "object" || Array.isArray(matchedRow)) {
    return null;
  }

  if (
    matchedRow.originalLine &&
    typeof matchedRow.originalLine === "object" &&
    !Array.isArray(matchedRow.originalLine)
  ) {
    return matchedRow.originalLine;
  }

  return matchedRow;
}

/**
 * Resolve CSV headers from context metadata or matched row keys.
 * @param {object} context
 * @param {object[]} matchedRows
 * @returns {string[]}
 */
function resolveCsvHeaders(context, matchedRows) {
  const metadataHeaders = context && context.metadata
    ? context.metadata[INTERNALS.METADATA_KEYS.HEADERS]
    : null;

  if (Array.isArray(metadataHeaders) && metadataHeaders.length > 0) {
    return metadataHeaders;
  }

  if (Array.isArray(matchedRows) && matchedRows.length > 0) {
    const sourceRow = resolveMatchedSourceRow(matchedRows[0]);

    if (sourceRow) {
      return Object.keys(sourceRow);
    }
  }

  return [];
}

/**
 * Normalize one column label for stable set comparisons.
 * @param {unknown} value
 * @returns {string}
 */
function normalizeColumnLabel(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

module.exports = {
  assertUploadedCsvFile,
  validateMatchedRows,
  hasMeaningfulValue,
  resolveMatchedSourceRow,
  resolveCsvHeaders,
  normalizeColumnLabel,
};
