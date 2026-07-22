const {
  mapCsvRowToInventoryDto,
} = require("../mappers/inventoryCsvMapper");
const {
  synchronizeInventoryFromDto,
  INVENTORY_SYNC_STATUS,
} = require("../inventorySynchronizationService");
const { INTERNALS } = require("./constants");
const {
  createRowError,
  createRowIdentifier,
} = require("./builders");
const {
  hasMeaningfulValue,
  resolveMatchedSourceRow,
} = require("./validation");
const {
  resolveMatchingPayload,
  summarizeMatching,
  bumpMatchingCounters,
  createDuplicateFingerprint,
  validateImportabilityFromMatching,
} = require("./matching");

/**
 * Apply one synchronize result to report counters.
 * @param {ReturnType<import("./builders").createImportReport>} report
 * @param {number} rowIndex
 * @param {{status:string,changes?:Record<string,unknown>,warnings?:string[],errors?:string[]}} syncResult
 */
function applySyncCounters(report, rowIndex, syncResult) {
  if (syncResult.status === INVENTORY_SYNC_STATUS.CREATE) {
    report.created += 1;
    return;
  }

  if (syncResult.status === INVENTORY_SYNC_STATUS.UPDATE) {
    report.updated += 1;
    return;
  }

  if (syncResult.status === INVENTORY_SYNC_STATUS.SKIP) {
    report.skipped += 1;
    return;
  }

  report.failed += 1;
  report.errors.push(
    createRowError(
      rowIndex,
      Array.isArray(syncResult.errors) && syncResult.errors.length > 0
        ? syncResult.errors[0]
        : INTERNALS.ERRORS.EMPTY_ROW
    )
  );
}

/**
 * Process all matched rows and mutate import report.
 * @param {{matchedRows:object[],report:ReturnType<import("./builders").createImportReport>}} input
 */
async function processImportRows(input) {
  const { matchedRows, report } = input;
  const duplicateFingerprints = new Set();

  for (let index = 0; index < matchedRows.length; index += 1) {
    const matchedRow = matchedRows[index];
    const row = resolveMatchedSourceRow(matchedRow);
    const matchingSummary = summarizeMatching(resolveMatchingPayload(matchedRow));

    bumpMatchingCounters(report.matching, matchingSummary);

    if (!row || typeof row !== "object" || Array.isArray(row) || !hasMeaningfulValue(row)) {
      report.failed += 1;
      report.invalidRows += 1;
      report.errors.push(createRowError(index, INTERNALS.ERRORS.EMPTY_ROW));
      report.rows.push({
        row: index + 1,
        status: INVENTORY_SYNC_STATUS.INVALID,
        identifier: null,
        changes: [],
        warnings: [],
        errors: [INTERNALS.ERRORS.EMPTY_ROW],
        matching: matchingSummary,
      });
      continue;
    }

    let inventoryInput = null;

    try {
      inventoryInput = mapCsvRowToInventoryDto(row, {
        provider: INTERNALS.PROVIDERS.DEFAULT,
        onIgnoredColumn: null,
      });

      const duplicateFingerprint = createDuplicateFingerprint(inventoryInput);

      if (duplicateFingerprint && duplicateFingerprints.has(duplicateFingerprint)) {
        report.duplicates += 1;
        report.skipped += 1;
        report.rows.push({
          row: index + 1,
          status: "DUPLICATE",
          identifier: createRowIdentifier(inventoryInput),
          changes: [],
          warnings: [INTERNALS.ERRORS.DUPLICATE_ROW],
          errors: [],
          matching: matchingSummary,
        });
        continue;
      }

      if (duplicateFingerprint) {
        duplicateFingerprints.add(duplicateFingerprint);
      }

      const importability = validateImportabilityFromMatching(matchingSummary);

      if (!importability.importable) {
        report.skipped += 1;

        if (matchingSummary.status === INTERNALS.MATCHING.STATUS.MULTIPLE) {
          report.conflicts.push(createRowError(index, INTERNALS.ERRORS.CONFLICTING_MATCHES));
        }

        report.rows.push({
          row: index + 1,
          status: INVENTORY_SYNC_STATUS.SKIP,
          identifier: createRowIdentifier(inventoryInput),
          changes: [],
          warnings: importability.message ? [importability.message] : [],
          errors: [],
          matching: matchingSummary,
        });
        continue;
      }

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
        matching: matchingSummary,
      });

      if (Array.isArray(syncResult.warnings) && syncResult.warnings.length > 0) {
        for (const warning of syncResult.warnings) {
          report.warnings.push({
            row: index + 1,
            message: warning,
          });
        }
      }

      applySyncCounters(report, index, syncResult);
    } catch (error) {
      report.failed += 1;
      report.invalidRows += 1;
      report.errors.push(createRowError(index, error.message));
      report.rows.push({
        row: index + 1,
        status: INVENTORY_SYNC_STATUS.INVALID,
        identifier: createRowIdentifier(inventoryInput),
        changes: [],
        warnings: [],
        errors: [error.message],
        matching: matchingSummary,
      });
    }
  }
}

module.exports = {
  processImportRows,
};
