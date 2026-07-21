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

const {
  mapCsvRowToInventoryDto,
  INVENTORY_CSV_PROVIDERS,
} = require("./mappers/inventoryCsvMapper");
const {
  resolveInventoryCsvProviderDiagnostics,
} = require("./mappers/inventoryCsvProviderResolver");
const {
  synchronizeInventoryFromDto,
  INVENTORY_SYNC_STATUS,
} = require("./inventorySynchronizationService");

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
    DUPLICATES: 0,
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
 * @returns {{success:boolean,totalRows:number,created:number,updated:number,failed:number,skipped:number,duplicates:number,warnings:Array<unknown>,errors:Array<{row:number,message:string}>,rows:Array<{row:number,status:string,identifier:string|null,changes:string[],warnings:string[],errors:string[]}>,durationMs:number}}
 */
function createImportReport() {
  return {
    success: INTERNALS.REPORT.SUCCESS,
    totalRows: INTERNALS.REPORT.TOTAL_ROWS,
    created: INTERNALS.REPORT.CREATED,
    updated: INTERNALS.REPORT.UPDATED,
    failed: INTERNALS.REPORT.FAILED,
    skipped: INTERNALS.REPORT.SKIPPED,
    duplicates: INTERNALS.REPORT.DUPLICATES,
    warnings: [...INTERNALS.REPORT.WARNINGS],
    errors: [],
    rows: [],
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

/**
 * Build a readable row identifier from inventory DTO fields.
 * @param {object|null|undefined} dto
 * @returns {string|null}
 */
function createRowIdentifier(dto) {
  if (!dto || typeof dto !== "object" || Array.isArray(dto)) {
    return null;
  }

  const year = dto.year !== undefined && dto.year !== null ? String(dto.year).trim() : "";
  const series = typeof dto.series === "string" ? dto.series.trim() : "";
  const cardNumber = typeof dto.cardNumber === "string" ? dto.cardNumber.trim() : "";
  const player = typeof dto.player === "string" ? dto.player.trim() : "";
  const parallel = typeof dto.parallel === "string" ? dto.parallel.trim() : "";
  const variation = typeof dto.variation === "string" ? dto.variation.trim() : "";
  const grade = typeof dto.grade === "string" ? dto.grade.trim() : "";

  const baseParts = [];

  if (year) {
    baseParts.push(year);
  }

  if (series) {
    baseParts.push(series);
  }

  let baseIdentifier = baseParts.join(" ");

  if (cardNumber) {
    baseIdentifier = baseIdentifier ? `${baseIdentifier} #${cardNumber}` : `#${cardNumber}`;
  }

  const suffixParts = [];

  if (parallel) {
    suffixParts.push(parallel);
  }

  if (variation) {
    suffixParts.push(variation);
  }

  if (grade) {
    suffixParts.push(grade);
  }

  if (suffixParts.length > 0) {
    baseIdentifier = baseIdentifier
      ? `${baseIdentifier} ${suffixParts.join(" ")}`
      : suffixParts.join(" ");
  }

  if (player) {
    return baseIdentifier ? `${player} - ${baseIdentifier}` : player;
  }

  return baseIdentifier || null;
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
  const firstRow = matchedRows.length > 0 ? resolveMatchedSourceRow(matchedRows[0]) : null;
  const providerDiagnostics = resolveInventoryCsvProviderDiagnostics({
    headers,
    row: firstRow,
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
    const row = resolveMatchedSourceRow(matchedRows[index]);

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

const SHARED_CSV_ANALYSIS_STAGES = [
  readCsvEngineStage,
  validateCsvEngineStage,
  normalizeCsvEngineStage,
  fingerprintCsvEngineStage,
  matchCsvEngineStage,
];

const IMPORT_CSV_ENRICHMENT_STAGES = [
  referenceCsvEngineStage,
  importCsvEngineStage,
  snapshotCsvEngineStage,
  historyCsvEngineStage,
  analyticsCsvEngineStage,
  importJobCsvEngineStage,
  importErrorCsvEngineStage,
];

/**
 * Execute a sequence of CSV engine stages.
 * @param {object} initialContext
 * @param {Array<(context:object)=>object|Promise<object>>} stages
 * @returns {Promise<object>}
 */
async function runCsvEngineStages(initialContext, stages) {
  let context = initialContext;

  for (const stage of stages) {
    context = await stage(context);
  }

  return context;
}

/**
 * Run the shared read-only CSV analysis pipeline.
 * @param {string} filePath
 * @returns {Promise<object>}
 */
async function runCsvAnalysisPipeline(filePath) {
  return runCsvEngineStages({ filePath }, SHARED_CSV_ANALYSIS_STAGES);
}

/**
 * Run the preview CSV pipeline.
 * @param {string} filePath
 * @returns {Promise<object>}
 */
async function runCsvPreviewPipeline(filePath) {
  return runCsvAnalysisPipeline(filePath);
}

/**
 * Run the import CSV pipeline and return the final context.
 * @param {string} filePath
 * @returns {Promise<object>}
 */
async function runCsvImportPipeline(filePath) {
  const analysisContext = await runCsvAnalysisPipeline(filePath);

  return runCsvEngineStages(analysisContext, IMPORT_CSV_ENRICHMENT_STAGES);
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
 * @param {{pipeline?:(filePath:string)=>Promise<object>}} [options]
 */
async function withPreparedCsvRows(file, worker, options = {}) {
  assertUploadedCsvFile(file);

  let tempFilePath = null;
  const pipeline =
    typeof options.pipeline === "function"
      ? options.pipeline
      : runCsvImportPipeline;

  try {
    tempFilePath = await writeTempCsvFile(file.buffer, file.originalname);

    const context = await pipeline(tempFilePath);
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
        const row = resolveMatchedSourceRow(matchedRows[index]);

        if (!row || typeof row !== "object" || Array.isArray(row) || !hasMeaningfulValue(row)) {
          report.failed += 1;
          report.errors.push(createRowError(index, INTERNALS.ERRORS.EMPTY_ROW));
          report.rows.push({
            row: index + 1,
            status: INVENTORY_SYNC_STATUS.INVALID,
            identifier: null,
            changes: [],
            warnings: [],
            errors: [INTERNALS.ERRORS.EMPTY_ROW],
          });
          continue;
        }

        let inventoryInput = null;

        try {
          inventoryInput = mapCsvRowToInventoryDto(row, {
            provider: INTERNALS.PROVIDERS.DEFAULT,
            // Future extension point: persist ignored columns in report diagnostics.
            onIgnoredColumn: null,
          });

          const syncResult = await synchronizeInventoryFromDto(inventoryInput);

          report.rows.push({
            row: index + 1,
            status: syncResult.status,
            identifier: createRowIdentifier(inventoryInput),
            changes:
              syncResult.status === INVENTORY_SYNC_STATUS.UPDATE
                ? Object.keys(syncResult.changes || {})
                : [],
            warnings: Array.isArray(syncResult.warnings) ? syncResult.warnings : [],
            errors: Array.isArray(syncResult.errors) ? syncResult.errors : [],
          });

          if (Array.isArray(syncResult.warnings) && syncResult.warnings.length > 0) {
            for (const warning of syncResult.warnings) {
              report.warnings.push({
                row: index + 1,
                message: warning,
              });
            }
          }

          if (syncResult.status === INVENTORY_SYNC_STATUS.CREATE) {
            report.created += 1;
            continue;
          }

          if (syncResult.status === INVENTORY_SYNC_STATUS.UPDATE) {
            report.updated += 1;
            continue;
          }

          if (syncResult.status === INVENTORY_SYNC_STATUS.SKIP) {
            report.skipped += 1;
            continue;
          }

          report.failed += 1;
          report.errors.push(
            createRowError(
              index,
              Array.isArray(syncResult.errors) && syncResult.errors.length > 0
                ? syncResult.errors[0]
                : INTERNALS.ERRORS.EMPTY_ROW
            )
          );
          continue;
        } catch (error) {
          report.failed += 1;
          report.errors.push(createRowError(index, error.message));
          report.rows.push({
            row: index + 1,
            status: INVENTORY_SYNC_STATUS.INVALID,
            identifier: createRowIdentifier(inventoryInput),
            changes: [],
            warnings: [],
            errors: [error.message],
          });
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
    }, {
      pipeline: runCsvPreviewPipeline,
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