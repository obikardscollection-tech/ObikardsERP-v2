const { assertContext, assertContextData, assertImportJob } = require("../common/contextAssertions");

const INTERNALS = {
  IMPORT_ERROR_VERSION: 1,
  KEYS: {
    DATA: "data",
    IMPORT_JOB: "importJob",
    IMPORT_ERROR: "importError",
    VERSION: "version",
    METADATA: "metadata",
    RUNTIME: "runtime",
    FLAGS: "flags",
    SUMMARY: "summary",
    ENTRIES: "entries",
    CREATED_AT: "createdAt",
    STARTED_AT: "startedAt",
    FINISHED_AT: "finishedAt",
    DURATION_MS: "durationMs",
    INITIALIZED: "initialized",
    VALID: "valid",
    TOTAL_ERRORS: "totalErrors",
    HAS_ERRORS: "hasErrors",
  },
};

/**
 * Create import error metadata structure.
 * @returns {{createdAt:string}}
 */
function createImportErrorMetadata() {
  return {
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create import error runtime structure.
 * @returns {{startedAt:string|null, finishedAt:string|null, durationMs:number}}
 */
function createImportErrorRuntime() {
  // Extension point reserved for future runtime instrumentation.
  return {
    startedAt: null,
    finishedAt: null,
    durationMs: 0,
  };
}

/**
 * Create import error flags structure.
 * @returns {{initialized:boolean, valid:boolean}}
 */
function createImportErrorFlags() {
  return {
    initialized: true,
    valid: true,
  };
}

/**
 * Create import error technical summary.
 * @returns {{totalErrors:number, hasErrors:boolean}}
 */
function createImportErrorSummary() {
  return {
    totalErrors: 0,
    hasErrors: false,
  };
}

/**
 * Create import error entries indexed registry.
 * @returns {object}
 */
function createImportErrorEntries() {
  // Extension point reserved for future indexed error registries.
  return {};
}

/**
 * Build import error document with stable property order.
 * @param {object} importJob
 * @returns {{version:number, metadata:object, runtime:object, flags:object, summary:object, entries:object, importJob:object}}
 */
function createImportError(importJob) {
  return {
    version: INTERNALS.IMPORT_ERROR_VERSION,
    metadata: createImportErrorMetadata(),
    runtime: createImportErrorRuntime(),
    flags: createImportErrorFlags(),
    summary: createImportErrorSummary(),
    entries: createImportErrorEntries(),
    importJob,
  };
}

/**
 * Build a new immutable context enriched with import error document.
 * @param {object} context
 * @returns {object}
 */
function importErrorCsvEngineStage(context) {
  assertContext(context);
  assertContextData(context[INTERNALS.KEYS.DATA]);

  const data = context[INTERNALS.KEYS.DATA];
  const importJob = data[INTERNALS.KEYS.IMPORT_JOB];

  assertImportJob(importJob);

  const nextData = {
    ...data,
    [INTERNALS.KEYS.IMPORT_ERROR]: createImportError(importJob),
  };

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  importErrorCsvEngineStage,
};
