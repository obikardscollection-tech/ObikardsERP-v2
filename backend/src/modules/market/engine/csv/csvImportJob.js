const { assertContext, assertContextData, assertAnalytics } = require("../common/contextAssertions");

const INTERNALS = {
  IMPORT_JOB_VERSION: 1,
  KEYS: {
    DATA: "data",
    ANALYTICS: "analytics",
    IMPORT_JOB: "importJob",
    VERSION: "version",
    METADATA: "metadata",
    RUNTIME: "runtime",
    FLAGS: "flags",
    STATUS: "status",
    RESULT: "result",
    CREATED_AT: "createdAt",
    STARTED_AT: "startedAt",
    FINISHED_AT: "finishedAt",
    DURATION_MS: "durationMs",
    INITIALIZED: "initialized",
    VALID: "valid",
    STATE: "state",
  },
  VALUES: {
    STATE_COMPLETED: "completed",
  },
};

/**
 * Create import job metadata structure.
 * @returns {{createdAt:string}}
 */
function createImportJobMetadata() {
  return {
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create import job runtime structure.
 * @returns {{startedAt:string|null, finishedAt:string|null, durationMs:number}}
 */
function createImportJobRuntime() {
  // Extension point reserved for future runtime instrumentation.
  return {
    startedAt: null,
    finishedAt: null,
    durationMs: 0,
  };
}

/**
 * Create import job flags structure.
 * @returns {{initialized:boolean, valid:boolean}}
 */
function createImportJobFlags() {
  return {
    initialized: true,
    valid: true,
  };
}

/**
 * Create import job status structure.
 * @returns {{state:string}}
 */
function createImportJobStatus() {
  return {
    state: INTERNALS.VALUES.STATE_COMPLETED,
  };
}

/**
 * Create import job result structure.
 * @returns {object}
 */
function createImportJobResult() {
  // Extension point reserved for future import job result payloads.
  return {};
}

/**
 * Build import job document with stable property order.
 * @param {object} analytics
 * @returns {{version:number, metadata:object, runtime:object, flags:object, status:object, analytics:object, result:object}}
 */
function createImportJob(analytics) {
  return {
    version: INTERNALS.IMPORT_JOB_VERSION,
    metadata: createImportJobMetadata(),
    runtime: createImportJobRuntime(),
    flags: createImportJobFlags(),
    status: createImportJobStatus(),
    analytics,
    result: createImportJobResult(),
  };
}

/**
 * Build a new immutable context enriched with import job document.
 * @param {object} context
 * @returns {object}
 */
function importJobCsvEngineStage(context) {
  assertContext(context);
  assertContextData(context[INTERNALS.KEYS.DATA]);

  const data = context[INTERNALS.KEYS.DATA];
  const analytics = data[INTERNALS.KEYS.ANALYTICS];

  assertAnalytics(analytics);

  const nextData = {
    ...data,
    [INTERNALS.KEYS.IMPORT_JOB]: createImportJob(analytics),
  };

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  importJobCsvEngineStage,
};
