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
const {
  mapCsvRowToInventoryDto,
  INVENTORY_CSV_PROVIDERS,
} = require("./mappers/inventoryCsvMapper");
const {
  resolveInventoryCsvProviderDiagnostics,
} = require("./mappers/inventoryCsvProviderResolver");

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
  ERRORS: {
    CSV_REQUIRED: "Le fichier CSV est requis.",
    CSV_INVALID_EXTENSION: "Le fichier uploadé doit avoir l'extension .csv.",
    CSV_INVALID_MIMETYPE: "Le type MIME du fichier doit correspondre à un CSV.",
    MATCHED_ROWS_NOT_FOUND: "Les lignes matchees du CSV sont introuvables.",
    EMPTY_ROW: "Ligne CSV vide ou invalide.",
  },
  WARNINGS: {
    PROVIDER_FALLBACK: "Aucun provider specifique detecte: fallback CUSTOM_CSV applique.",
  },
  DATA_KEYS: {
    MATCHED_ROWS: "matchedRows",
  },
  METADATA_KEYS: {
    HEADERS: "headers",
  },
  PROVIDERS: {
    DEFAULT: INVENTORY_CSV_PROVIDERS.CUSTOM_CSV,
  },
  PREVIEW: {
    SAMPLE_SIZE: 20,
  },
};

// ===============================
// Builders
// ===============================

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
 * Create a fresh CSV preview report structure.
 * @returns {{provider:string|null,providerVersion:string|null,confidence:number,score:number,maxScore:number,totalRows:number,validRows:number,invalidRows:number,recognizedColumns:string[],ignoredColumns:string[],matchedHeaders:string[],warnings:string[],errors:Array<{row:number,message:string}>,previewRows:object[],durationMs:number,statusCounters:{create:number,update:number,skip:number,duplicate:number,invalid:number}}}
 */
function createPreviewReport() {
  return {
    provider: null,
    providerVersion: null,
    confidence: 0,
    score: 0,
    maxScore: 0,
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    recognizedColumns: [],
    ignoredColumns: [],
    matchedHeaders: [],
    warnings: [],
    errors: [],
    previewRows: [],
    durationMs: 0,
    statusCounters: {
      create: 0,
      update: 0,
      skip: 0,
      duplicate: 0,
      invalid: 0,
    },
  };
}

/**
 * Build a row-scoped error payload.
 * @param {number} rowIndex
 * @param {string} message
 * @returns {{row:number,message:string}}
 */
function createRowError(rowIndex, message) {
  return {
    row: rowIndex + 1,
    message,
  };
}

// ===============================
// Validation
// ===============================

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

  if (Array.isArray(matchedRows) && matchedRows.length > 0 && matchedRows[0] && typeof matchedRows[0] === "object") {
    return Object.keys(matchedRows[0]);
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

// ===============================
// Helpers
// ===============================

/**
 * Safely remove a temporary CSV file.
 * @param {string|null} tempFilePath
 * @returns {Promise<void>}
 */
async function cleanupTempFile(tempFilePath) {
  if (typeof tempFilePath === "string") {
    await fsPromises.unlink(tempFilePath).catch(() => {});
  }
}

/**
 * Build provider diagnostics and derived CSV headers.
 * @param {object} context
 * @param {object[]} matchedRows
 * @returns {{headers:string[],providerDiagnostics:object}}
 */
function buildProviderDiagnostics(context, matchedRows) {
  const headers = resolveCsvHeaders(context, matchedRows);
  const providerDiagnostics = resolveInventoryCsvProviderDiagnostics({
    headers,
    row: matchedRows[0] || null,
    fallbackProvider: INTERNALS.PROVIDERS.DEFAULT,
  });

  return {
    headers,
    providerDiagnostics,
  };
}

/**
 * Build ignored columns sets from provider diagnostics.
 * @param {object} providerDiagnostics
 * @returns {{ignoredColumns:Set<string>,ignoredNormalized:Set<string>}}
 */
function buildIgnoredColumns(providerDiagnostics) {
  const ignoredHeaders = providerDiagnostics.ignoredHeaders || [];

  return {
    ignoredColumns: new Set(ignoredHeaders),
    ignoredNormalized: new Set(
      ignoredHeaders.map((column) => normalizeColumnLabel(column))
    ),
  };
}

/**
 * Build recognized columns set from headers and provider diagnostics.
 * @param {string[]} headers
 * @param {object} providerDiagnostics
 * @param {Set<string>} ignoredNormalized
 * @returns {Set<string>}
 */
function buildRecognizedColumns(headers, providerDiagnostics, ignoredNormalized) {
  const recognizedColumns = new Set(providerDiagnostics.recognizedHeaders || []);
  const headerDisplayByNormalized = new Map();

  for (const header of headers) {
    const normalizedHeader = normalizeColumnLabel(header);

    if (!normalizedHeader) {
      continue;
    }

    if (!headerDisplayByNormalized.has(normalizedHeader)) {
      headerDisplayByNormalized.set(normalizedHeader, header);
    }

    if (!ignoredNormalized.has(normalizedHeader)) {
      recognizedColumns.add(headerDisplayByNormalized.get(normalizedHeader));
    }
  }

  return recognizedColumns;
}

/**
 * Build preview rows and row-level diagnostics.
 * @param {object[]} matchedRows
 * @param {string} provider
 * @param {Set<string>} ignoredColumns
 * @param {ReturnType<typeof createPreviewReport>} report
 */
function buildPreviewRows(matchedRows, provider, ignoredColumns, report) {
  for (let index = 0; index < matchedRows.length; index += 1) {
    const row = matchedRows[index];

    if (!row || typeof row !== "object" || Array.isArray(row) || !hasMeaningfulValue(row)) {
      report.invalidRows += 1;
      report.statusCounters.invalid += 1;
      report.errors.push(createRowError(index, INTERNALS.ERRORS.EMPTY_ROW));
      continue;
    }

    report.validRows += 1;

    let dto;

    try {
      dto = mapCsvRowToInventoryDto(row, {
        provider,
        onIgnoredColumn(column) {
          ignoredColumns.add(column);
        },
      });
    } catch (error) {
      report.validRows -= 1;
      report.invalidRows += 1;
      report.statusCounters.invalid += 1;
      report.errors.push(createRowError(index, error.message));
      continue;
    }

    if (report.previewRows.length < INTERNALS.PREVIEW.SAMPLE_SIZE) {
      report.previewRows.push(dto);
    }
  }
}

// ===============================
// Pipeline
// ===============================

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
 * Execute the shared CSV preparation flow and auto-clean temp file.
 * @param {{buffer:Buffer, originalname?:string, mimetype?:string}} file
 * @param {(payload:{context:object,matchedRows:object[]})=>Promise<void>|void} worker
 */
async function withPreparedCsvRows(file, worker) {
  assertUploadedCsvFile(file);

  let tempFilePath = null;

  try {
    tempFilePath = await writeTempCsvFile(file.buffer, file.originalname);

    const context = await runCsvImportPipeline(tempFilePath);
    const matchedRows = validateMatchedRows(
      context?.data?.[INTERNALS.DATA_KEYS.MATCHED_ROWS]
    );

    await worker({ context, matchedRows });
  } finally {
    await cleanupTempFile(tempFilePath);
  }
}

// ===============================
// Import
// ===============================

/**
 * Import inventory rows from an uploaded CSV file.
 * @param {{buffer:Buffer, originalname?:string}} file
 * @returns {Promise<{totalRows:number, created:number, failed:number, errors:Array<{row:number,message:string}>}>}
 */
async function importInventoryFromCsv(file) {
  const startedAt = Date.now();
  const report = createImportReport();

  try {
    await withPreparedCsvRows(file, async ({ matchedRows }) => {
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
          report.errors.push(createRowError(index, INTERNALS.ERRORS.EMPTY_ROW));
          continue;
        }

        try {
          const inventoryInput = mapCsvRowToInventoryDto(row, {
            provider: INTERNALS.PROVIDERS.DEFAULT,
            // Future extension point: persist ignored columns in report diagnostics.
            onIgnoredColumn: null,
          });

          await createInventory(inventoryInput);
          report.created += 1;
        } catch (error) {
          report.failed += 1;
          report.errors.push(createRowError(index, error.message));
        }
      }
    });

    return report;
  } finally {
    report.durationMs = Date.now() - startedAt;
  }
}

// ===============================
// Preview
// ===============================

/**
 * Build a full inventory CSV preview report without any database write.
 * @param {{buffer:Buffer, originalname?:string, mimetype?:string}} file
 * @returns {Promise<{provider:string|null,providerVersion:string|null,confidence:number,score:number,maxScore:number,totalRows:number,validRows:number,invalidRows:number,recognizedColumns:string[],ignoredColumns:string[],matchedHeaders:string[],warnings:string[],errors:Array<{row:number,message:string}>,previewRows:object[],durationMs:number,statusCounters:{create:number,update:number,skip:number,duplicate:number,invalid:number}}>} 
 */
async function previewInventoryFromCsv(file) {
  const startedAt = Date.now();
  const report = createPreviewReport();

  try {
    await withPreparedCsvRows(file, ({ context, matchedRows }) => {
      report.totalRows = matchedRows.length;

      const { headers, providerDiagnostics } = buildProviderDiagnostics(context, matchedRows);

      report.provider = providerDiagnostics.provider;
      report.providerVersion = providerDiagnostics.version;
      report.confidence = providerDiagnostics.confidence;
      report.score = providerDiagnostics.score;
      report.maxScore = providerDiagnostics.maxScore;
      report.matchedHeaders = [...providerDiagnostics.matchedHeaders];

      const { ignoredColumns, ignoredNormalized } = buildIgnoredColumns(providerDiagnostics);
      const recognizedColumns = buildRecognizedColumns(
        headers,
        providerDiagnostics,
        ignoredNormalized
      );

      if (providerDiagnostics.provider === INTERNALS.PROVIDERS.DEFAULT && providerDiagnostics.score === 0) {
        report.warnings.push(INTERNALS.WARNINGS.PROVIDER_FALLBACK);
      }

      buildPreviewRows(
        matchedRows,
        providerDiagnostics.provider,
        ignoredColumns,
        report
      );

      report.recognizedColumns = Array.from(recognizedColumns);
      report.ignoredColumns = Array.from(ignoredColumns);
    });

    return report;
  } finally {
    report.durationMs = Date.now() - startedAt;
  }
}

module.exports = {
  importInventoryFromCsv,
  previewInventoryFromCsv,
};