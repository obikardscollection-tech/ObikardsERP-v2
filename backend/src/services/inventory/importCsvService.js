const { INTERNALS } = require("./importCsv/constants");
const {
  createImportReport,
  createPreviewReport,
} = require("./importCsv/builders");
const {
  resolveCsvHeaders,
} = require("./importCsv/validation");
const {
  detectMissingCriticalColumns,
} = require("./importCsv/matching");
const {
  withPreparedCsvRows,
} = require("./importCsv/preparation");
const {
  runCsvPreviewPipeline,
  runCsvImportPipeline,
} = require("./importCsv/pipeline");
const {
  processImportRows,
} = require("./importCsv/importProcessor");
const {
  buildProviderDiagnostics,
  buildIgnoredColumns,
  buildRecognizedColumns,
  buildPreviewRows,
} = require("./importCsv/preview");

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
    await withPreparedCsvRows(file, async ({ context, matchedRows }) => {
      report.totalRows = matchedRows.length;

      const headers = resolveCsvHeaders(context, matchedRows);
      const missingCriticalColumns = detectMissingCriticalColumns(headers);

      if (missingCriticalColumns.length > 0) {
        report.warnings.push({
          row: 0,
          message: `${INTERNALS.WARNINGS.MISSING_CRITICAL_COLUMNS} [${missingCriticalColumns.join(", ")}]`,
        });
      }

      await processImportRows({ matchedRows, report });

      if (report.failed > 0 || report.conflicts.length > 0) {
        report.success = false;
      }
    }, runCsvImportPipeline);

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
 * @returns {Promise<{provider:string|null,providerVersion:string|null,confidence:number,score:number,maxScore:number,totalRows:number,validRows:number,invalidRows:number,recognizedColumns:string[],ignoredColumns:string[],matchedHeaders:string[],warnings:string[],errors:Array<{row:number,message:string}>,previewRows:object[],durationMs:number,statusCounters:{ready:number,skip:number,duplicate:number,invalid:number},matching:{single:number,multiple:number,none:number,unknown:number},conflicts:Array<{row:number,message:string}>,missingCriticalColumns:string[]}>}
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

      const missingCriticalColumns = detectMissingCriticalColumns(headers);
      report.missingCriticalColumns = missingCriticalColumns;

      if (missingCriticalColumns.length > 0) {
        report.warnings.push(
          `${INTERNALS.WARNINGS.MISSING_CRITICAL_COLUMNS} [${missingCriticalColumns.join(", ")}]`
        );
      }

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
    }, runCsvPreviewPipeline);

    return report;
  } finally {
    report.durationMs = Date.now() - startedAt;
  }
}

module.exports = {
  importInventoryFromCsv,
  previewInventoryFromCsv,
};