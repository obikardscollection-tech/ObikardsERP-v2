const { assertContext, assertContextData, assertHistory } = require("../common/contextAssertions");

const INTERNALS = {
  ANALYTICS_VERSION: 1,
  KEYS: {
    DATA: "data",
    HISTORY: "history",
    ANALYTICS: "analytics",
    VERSION: "version",
    METADATA: "metadata",
    RUNTIME: "runtime",
    FLAGS: "flags",
    STATISTICS: "statistics",
    METRICS: "metrics",
    CREATED_AT: "createdAt",
    STARTED_AT: "startedAt",
    FINISHED_AT: "finishedAt",
    DURATION_MS: "durationMs",
    INITIALIZED: "initialized",
    VALID: "valid",
    HISTORY_COUNT: "historyCount",
  },
};

/**
 * Read history count without copying history.
 * @param {object} history
 * @returns {number}
 */
function readHistoryCount(history) {
  const count = history.count;

  if (Number.isInteger(count) && count >= 0) {
    return count;
  }

  return 0;
}

/**
 * Create analytics metadata structure.
 * @returns {{createdAt:string}}
 */
function createAnalyticsMetadata() {
  return {
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create analytics runtime structure.
 * @returns {{startedAt:string|null, finishedAt:string|null, durationMs:number}}
 */
function createAnalyticsRuntime() {
  // Extension point reserved for future runtime instrumentation.
  return {
    startedAt: null,
    finishedAt: null,
    durationMs: 0,
  };
}

/**
 * Create analytics flags structure.
 * @returns {{initialized:boolean, valid:boolean}}
 */
function createAnalyticsFlags() {
  return {
    initialized: true,
    valid: true,
  };
}

/**
 * Create analytics technical statistics.
 * @param {number} historyCount
 * @returns {{historyCount:number}}
 */
function createAnalyticsStatistics(historyCount) {
  return {
    historyCount,
  };
}

/**
 * Create analytics metrics container.
 * @returns {object}
 */
function createAnalyticsMetrics() {
  // Extension point reserved for future analytics metrics enrichment.
  return {};
}

/**
 * Build analytics registry with stable property order.
 * @param {object} history
 * @param {number} historyCount
 * @returns {{version:number, metadata:object, runtime:object, flags:object, statistics:object, metrics:object, history:object}}
 */
function createAnalyticsRegistry(history, historyCount) {
  return {
    version: INTERNALS.ANALYTICS_VERSION,
    metadata: createAnalyticsMetadata(),
    runtime: createAnalyticsRuntime(),
    flags: createAnalyticsFlags(),
    statistics: createAnalyticsStatistics(historyCount),
    metrics: createAnalyticsMetrics(),
    history,
  };
}

/**
 * Build a new immutable context enriched with analytics registry.
 * @param {object} context
 * @returns {object}
 */
function analyticsCsvEngineStage(context) {
  assertContext(context);
  assertContextData(context[INTERNALS.KEYS.DATA]);

  const data = context[INTERNALS.KEYS.DATA];
  const history = data[INTERNALS.KEYS.HISTORY];

  assertHistory(history);
  const historyCount = readHistoryCount(history);

  const nextData = {
    ...data,
    [INTERNALS.KEYS.ANALYTICS]: createAnalyticsRegistry(history, historyCount),
  };

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  analyticsCsvEngineStage,
};
