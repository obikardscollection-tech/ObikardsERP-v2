const {
  mapCsvRowToInventoryDto,
} = require("../mappers/inventoryCsvMapper");
const {
  resolveInventoryCsvProviderDiagnostics,
} = require("../mappers/inventoryCsvProviderResolver");
const { INTERNALS } = require("./constants");
const {
  createRowError,
  createRowIdentifier,
} = require("./builders");
const {
  hasMeaningfulValue,
  resolveMatchedSourceRow,
  resolveCsvHeaders,
  normalizeColumnLabel,
} = require("./validation");
const {
  resolveMatchingPayload,
  summarizeMatching,
  bumpMatchingCounters,
  createDuplicateFingerprint,
  validateImportabilityFromMatching,
} = require("./matching");

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
 * @param {ReturnType<import("./builders").createPreviewReport>} report
 */
function buildPreviewRows(matchedRows, provider, ignoredColumns, report) {
  const duplicateFingerprints = new Set();

  for (let index = 0; index < matchedRows.length; index += 1) {
    const matchedRow = matchedRows[index];
    const row = resolveMatchedSourceRow(matchedRow);
    const matchingSummary = summarizeMatching(resolveMatchingPayload(matchedRow));

    bumpMatchingCounters(report.matching, matchingSummary);

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

    const fingerprint = createDuplicateFingerprint(dto);
    const isDuplicate = fingerprint ? duplicateFingerprints.has(fingerprint) : false;

    if (fingerprint) {
      duplicateFingerprints.add(fingerprint);
    }

    const importability = validateImportabilityFromMatching(matchingSummary);

    if (isDuplicate) {
      report.statusCounters.duplicate += 1;
    } else if (!importability.importable) {
      report.statusCounters.skip += 1;
      if (matchingSummary.status === INTERNALS.MATCHING.STATUS.MULTIPLE) {
        report.conflicts.push(createRowError(index, INTERNALS.ERRORS.CONFLICTING_MATCHES));
      }
    } else {
      report.statusCounters.ready += 1;
    }

    if (report.previewRows.length < INTERNALS.PREVIEW.SAMPLE_SIZE) {
      report.previewRows.push({
        row: index + 1,
        status: isDuplicate
          ? "DUPLICATE"
          : importability.importable
            ? "READY"
            : "SKIP",
        identifier: createRowIdentifier(dto),
        dto,
        matching: matchingSummary,
        warnings: [
          ...(isDuplicate ? [INTERNALS.ERRORS.DUPLICATE_ROW] : []),
          ...(importability.message ? [importability.message] : []),
        ],
      });
    }
  }
}

module.exports = {
  buildProviderDiagnostics,
  buildIgnoredColumns,
  buildRecognizedColumns,
  buildPreviewRows,
};
