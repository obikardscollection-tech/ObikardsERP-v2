const fsPromises = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const {
  readCsvEngineStage,
  validateCsvEngineStage,
  normalizeCsvEngineStage,
  fingerprintCsvEngineStage,
  matchCsvEngineStage,
  referenceCsvEngineStage,
  importCsvEngineStage,
  snapshotCsvEngineStage,
  historyCsvEngineStage,
  analyticsCsvEngineStage,
  importJobCsvEngineStage,
  importErrorCsvEngineStage,
} = require("../../modules/market/engine/csv");

const { createInventory } = require("./createInventoryService");

const INTERNALS = {
  TEMP_PREFIX: "obikards-inventory-import-",
  ALLOWED_MIME_TYPES: [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
  ],
  REPORT: {
    SUCCESS: true,
    TOTAL_ROWS: 0,
    CREATED: 0,
    UPDATED: 0,
    FAILED: 0,
    SKIPPED: 0,
    WARNINGS: [],
  },
  DATA_KEYS: {
    MATCHED_ROWS: "matchedRows",
  },
};

/**
 * Create a fresh import report structure.
 * @returns {{success:boolean,totalRows:number,created:number,updated:number,failed:number,skipped:number,warnings:Array<unknown>,errors:Array<{row:number,message:string}>,durationMs:number}}
 */
function createImportReport() {
  return {
    success: INTERNALS.REPORT.SUCCESS,
    totalRows: INTERNALS.REPORT.TOTAL_ROWS,
    created: INTERNALS.REPORT.CREATED,
    updated: INTERNALS.REPORT.UPDATED,
    failed: INTERNALS.REPORT.FAILED,
    skipped: INTERNALS.REPORT.SKIPPED,
    warnings: [...INTERNALS.REPORT.WARNINGS],
    errors: [],
    durationMs: 0,
  };
}

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
    throw createBadRequestError("Le fichier CSV est requis.");
  }

  const extension = path.extname(file.originalname || "").toLowerCase();

  if (extension !== ".csv") {
    throw createBadRequestError("Le fichier uploadé doit avoir l'extension .csv.");
  }

  if (!INTERNALS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw createBadRequestError("Le type MIME du fichier doit correspondre à un CSV.");
  }
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
 * Normalize one CSV row into an Inventory-compatible DTO.
 * The current inventory mapper already understands the same field contract,
 * so this stage only preserves the row shape and trims accidental prototype noise.
 * @param {object} row
 * @returns {object}
 */
function createInventoryInput(row) {
  return { ...row };
}

/**
 * Run the full CSV engine pipeline and return the final context.
 * @param {string} filePath
 * @returns {Promise<object>}
 */
async function runCsvImportPipeline(filePath) {
  let context = await readCsvEngineStage({ filePath });
  context = await validateCsvEngineStage(context);
  context = await normalizeCsvEngineStage(context);
  context = await fingerprintCsvEngineStage(context);
  context = await matchCsvEngineStage(context);
  context = await referenceCsvEngineStage(context);
  context = await importCsvEngineStage(context);
  context = await snapshotCsvEngineStage(context);
  context = await historyCsvEngineStage(context);
  context = await analyticsCsvEngineStage(context);
  context = await importJobCsvEngineStage(context);
  context = await importErrorCsvEngineStage(context);

  return context;
}

/**
 * Materialize the uploaded CSV into a temporary file.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @returns {Promise<string>}
 */
async function writeTempCsvFile(buffer, originalName) {
  const tempFileName = `${INTERNALS.TEMP_PREFIX}${crypto.randomUUID()}${path.extname(originalName || ".csv") || ".csv"}`;
  const tempFilePath = path.join(os.tmpdir(), tempFileName);

  await fsPromises.writeFile(tempFilePath, buffer);

  return tempFilePath;
}

/**
 * Import inventory rows from an uploaded CSV file.
 * @param {{buffer:Buffer, originalname?:string}} file
 * @returns {Promise<{totalRows:number, created:number, failed:number, errors:Array<{row:number,message:string}>}>}
 */
async function importInventoryFromCsv(file) {
  const startedAt = Date.now();
  const report = createImportReport();
  let tempFilePath = null;

  try {
    assertUploadedCsvFile(file);

    tempFilePath = await writeTempCsvFile(file.buffer, file.originalname);

    const context = await runCsvImportPipeline(tempFilePath);
    const matchedRows = context?.data?.[INTERNALS.DATA_KEYS.MATCHED_ROWS];

    if (!Array.isArray(matchedRows)) {
      throw new Error("Les lignes matchees du CSV sont introuvables.");
    }

    report.totalRows = matchedRows.length;

    // Future extension points:
    // - duplicate detection before createInventory
    // - automatic update path when the record already exists
    // - preview mode that only returns the import report
    // - batch import orchestration for large CSV files
    // - rollback strategy for critical failures
    for (let index = 0; index < matchedRows.length; index += 1) {
      const row = matchedRows[index];

      if (!row || typeof row !== "object" || Array.isArray(row) || !hasMeaningfulValue(row)) {
        report.failed += 1;
        report.errors.push({
          row: index + 1,
          message: "Ligne CSV vide ou invalide.",
        });
        continue;
      }

      try {
        await createInventory(createInventoryInput(row));
        report.created += 1;
      } catch (error) {
        report.failed += 1;
        report.errors.push({
          row: index + 1,
          message: error.message,
        });
      }
    }

    return report;
  } finally {
    report.durationMs = Date.now() - startedAt;

    if (typeof tempFilePath === "string") {
      await fsPromises.unlink(tempFilePath).catch(() => {});
    }
  }
}

module.exports = {
  importInventoryFromCsv,
};