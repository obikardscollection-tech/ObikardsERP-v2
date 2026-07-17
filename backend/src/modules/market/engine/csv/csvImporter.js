const { assertContext, assertContextData, assertReferenceRegistry } = require("../common/contextAssertions");

const INTERNALS = {
  KEYS: {
    DATA: "data",
    PROVIDER: "provider",
    REFERENCE_REGISTRY: "referenceRegistry",
    IMPORT: "import",
    SOURCE: "source",
    RUNTIME: "runtime",
    FLAGS: "flags",
    METADATA: "metadata",
    STATISTICS: "statistics",
    REFERENCE_COUNT: "referenceCount",
    PREPARED_AT: "preparedAt",
    STARTED_AT: "startedAt",
    FINISHED_AT: "finishedAt",
    DURATION_MS: "durationMs",
    READY_FOR_SNAPSHOT: "readyForSnapshot",
    READY_FOR_HISTORY: "readyForHistory",
    READY_FOR_ANALYTICS: "readyForAnalytics",
    VALID: "valid",
    REFERENCES: "references",
    TOTAL_REFERENCES: "totalReferences",
  },
  VALUES: {
    SOURCE: "unknown",
  },
};

/**
 * Resolve the generic import source from context.
 * @param {object} context
 * @returns {string}
 */
function resolveImportSource(context) {
  const provider = context[INTERNALS.KEYS.PROVIDER];

  if (typeof provider === "string" && provider.trim() !== "") {
    return provider;
  }

  return INTERNALS.VALUES.SOURCE;
}

/**
 * Read reference count without copying the registry.
 * @param {object} referenceRegistry
 * @returns {number}
 */
function readReferenceCount(referenceRegistry) {
  const count = referenceRegistry.count;

  if (Number.isInteger(count) && count >= 0) {
    return count;
  }

  return 0;
}

/**
 * Create import runtime structure.
 * @returns {{startedAt:string|null, finishedAt:string|null, durationMs:number}}
 */
function createImportRuntime() {
  // Extension point reserved for future runtime instrumentation.
  return {
    startedAt: null,
    finishedAt: null,
    durationMs: 0,
  };
}

/**
 * Create import flags structure.
 * @returns {{readyForSnapshot:boolean, readyForHistory:boolean, readyForAnalytics:boolean, valid:boolean}}
 */
function createImportFlags() {
  return {
    readyForSnapshot: true,
    readyForHistory: true,
    readyForAnalytics: true,
    valid: true,
  };
}

/**
 * Create import metadata structure.
 * @param {string} source
 * @param {number} referenceCount
 * @returns {{source:string, preparedAt:string, referenceCount:number}}
 */
function createImportMetadata(source, referenceCount) {
  return {
    source,
    preparedAt: new Date().toISOString(),
    referenceCount,
  };
}

/**
 * Create import statistics structure.
 * @param {number} referenceCount
 * @returns {{totalReferences:number}}
 */
function createImportStatistics(referenceCount) {
  return {
    totalReferences: referenceCount,
  };
}

/**
 * Create generic import payload from an existing reference registry.
 * @param {object} referenceRegistry
 * @param {string} source
 * @returns {{source:string, runtime:object, flags:object, metadata:object, statistics:object, references:object}}
 */
function createImport(referenceRegistry, source) {
  const referenceCount = readReferenceCount(referenceRegistry);

  return {
    source,
    runtime: createImportRuntime(),
    flags: createImportFlags(),
    metadata: createImportMetadata(source, referenceCount),
    statistics: createImportStatistics(referenceCount),
    references: referenceRegistry,
  };
}

/**
 * Build a new immutable context enriched with generic import data.
 * @param {object} context
 * @returns {object}
 */
function importCsvEngineStage(context) {
  assertContext(context);
  assertContextData(context[INTERNALS.KEYS.DATA]);

  const data = context[INTERNALS.KEYS.DATA];
  const referenceRegistry = data[INTERNALS.KEYS.REFERENCE_REGISTRY];
  const source = resolveImportSource(context);

  assertReferenceRegistry(referenceRegistry);

  const nextImport = createImport(referenceRegistry, source);

  const nextData = {
    ...data,
    [INTERNALS.KEYS.IMPORT]: nextImport,
  };

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  importCsvEngineStage,
};
