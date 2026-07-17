const { assertContext, assertContextData, assertSnapshot } = require("../common/contextAssertions");

const INTERNALS = {
  HISTORY_VERSION: 1,
  KEYS: {
    DATA: "data",
    SNAPSHOT: "snapshot",
    HISTORY: "history",
    VERSION: "version",
    COUNT: "count",
    METADATA: "metadata",
    RUNTIME: "runtime",
    FLAGS: "flags",
    INDEXES: "indexes",
    CACHE: "cache",
    SNAPSHOTS: "snapshots",
    CREATED_AT: "createdAt",
    STARTED_AT: "startedAt",
    FINISHED_AT: "finishedAt",
    DURATION_MS: "durationMs",
    INITIALIZED: "initialized",
    READY_FOR_ANALYTICS: "readyForAnalytics",
    VALID: "valid",
    ENTRIES: "entries",
  },
};

/**
 * Create history metadata structure.
 * @returns {{createdAt:string}}
 */
function createHistoryMetadata() {
  return {
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create history runtime structure.
 * @returns {{startedAt:string|null, finishedAt:string|null, durationMs:number}}
 */
function createHistoryRuntime() {
  // Extension point reserved for future runtime instrumentation.
  return {
    startedAt: null,
    finishedAt: null,
    durationMs: 0,
  };
}

/**
 * Create history flags structure.
 * @returns {{initialized:boolean, readyForAnalytics:boolean, valid:boolean}}
 */
function createHistoryFlags() {
  return {
    initialized: true,
    readyForAnalytics: true,
    valid: true,
  };
}

/**
 * Create history indexes structure.
 * @returns {object}
 */
function createHistoryIndexes() {
  // Extension point reserved for future indexing accelerators.
  return {};
}

/**
 * Create history cache structure.
 * @returns {object}
 */
function createHistoryCache() {
  // Extension point reserved for future history caching strategies.
  return {};
}

/**
 * Create history snapshots structure with direct snapshot reference.
 * @param {object} snapshot
 * @returns {{entries:object}}
 */
function createHistorySnapshots(snapshot) {
  return {
    entries: {
      entry0: snapshot,
    },
  };
}

/**
 * Build history registry with stable property order.
 * @param {object} snapshot
 * @returns {{version:number, count:number, metadata:object, runtime:object, flags:object, indexes:object, cache:object, snapshots:object}}
 */
function createHistoryRegistry(snapshot) {
  return {
    version: INTERNALS.HISTORY_VERSION,
    count: 1,
    metadata: createHistoryMetadata(),
    runtime: createHistoryRuntime(),
    flags: createHistoryFlags(),
    indexes: createHistoryIndexes(),
    cache: createHistoryCache(),
    snapshots: createHistorySnapshots(snapshot),
  };
}

/**
 * Build a new immutable context enriched with generic history data.
 * @param {object} context
 * @returns {object}
 */
function historyCsvEngineStage(context) {
  assertContext(context);
  assertContextData(context[INTERNALS.KEYS.DATA]);

  const data = context[INTERNALS.KEYS.DATA];
  const snapshot = data[INTERNALS.KEYS.SNAPSHOT];

  assertSnapshot(snapshot);

  const nextData = {
    ...data,
    [INTERNALS.KEYS.HISTORY]: createHistoryRegistry(snapshot),
  };

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  historyCsvEngineStage,
};
