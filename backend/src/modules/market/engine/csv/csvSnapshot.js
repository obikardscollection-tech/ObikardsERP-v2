const INTERNALS = {
  KEYS: {
    DATA: "data",
    IMPORT: "import",
    SNAPSHOT: "snapshot",
    SOURCE: "source",
    RUNTIME: "runtime",
    METADATA: "metadata",
    FLAGS: "flags",
    STATISTICS: "statistics",
    CREATED_AT: "createdAt",
    STARTED_AT: "startedAt",
    FINISHED_AT: "finishedAt",
    DURATION_MS: "durationMs",
    READY_FOR_HISTORY: "readyForHistory",
    READY_FOR_ANALYTICS: "readyForAnalytics",
    VALID: "valid",
    IMPORT_REFERENCED: "importReferenced",
  },
  VALUES: {
    UNKNOWN_SOURCE: "unknown",
  },
};

/**
 * Ensure snapshot stage context is present.
 * @param {unknown} context
 */
function assertContext(context) {
  if (!context) {
    throw new Error("Le contexte CSV est introuvable.");
  }
}

/**
 * Ensure snapshot stage data container is present.
 * @param {unknown} data
 */
function assertContextData(data) {
  if (!data) {
    throw new Error("Les donnees du contexte CSV sont introuvables.");
  }
}

/**
 * Ensure import payload is present.
 * @param {unknown} importPayload
 */
function assertImport(importPayload) {
  if (!importPayload) {
    throw new Error("L'import du contexte CSV est introuvable.");
  }
}

/**
 * Resolve snapshot source from existing import payload.
 * @param {object} importPayload
 * @returns {string}
 */
function resolveSnapshotSource(importPayload) {
  const source = importPayload[INTERNALS.KEYS.SOURCE];

  if (typeof source === "string" && source.trim() !== "") {
    return source;
  }

  return INTERNALS.VALUES.UNKNOWN_SOURCE;
}

/**
 * Create snapshot runtime structure.
 * @returns {{startedAt:string|null, finishedAt:string|null, durationMs:number}}
 */
function createSnapshotRuntime() {
  return {
    startedAt: null,
    finishedAt: null,
    durationMs: 0,
  };
}

/**
 * Create snapshot metadata structure.
 * @returns {{createdAt:string}}
 */
function createSnapshotMetadata() {
  return {
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create snapshot flags structure.
 * @returns {{readyForHistory:boolean, readyForAnalytics:boolean, valid:boolean}}
 */
function createSnapshotFlags() {
  return {
    readyForHistory: true,
    readyForAnalytics: true,
    valid: true,
  };
}

/**
 * Create snapshot statistics structure.
 * @returns {{importReferenced:boolean}}
 */
function createSnapshotStatistics() {
  return {
    importReferenced: true,
  };
}

/**
 * Create generic snapshot payload by referencing an existing import payload.
 * @param {object} importPayload
 * @returns {{source:string, runtime:object, metadata:object, flags:object, statistics:object, import:object}}
 */
function createSnapshot(importPayload) {
  return {
    source: resolveSnapshotSource(importPayload),
    runtime: createSnapshotRuntime(),
    metadata: createSnapshotMetadata(),
    flags: createSnapshotFlags(),
    statistics: createSnapshotStatistics(),
    import: importPayload,
  };
}

/**
 * Build a new immutable context enriched with generic snapshot data.
 * @param {object} context
 * @returns {object}
 */
function snapshotCsvEngineStage(context) {
  assertContext(context);
  assertContextData(context[INTERNALS.KEYS.DATA]);

  const data = context[INTERNALS.KEYS.DATA];
  const importPayload = data[INTERNALS.KEYS.IMPORT];

  assertImport(importPayload);

  const nextData = {
    ...data,
    [INTERNALS.KEYS.SNAPSHOT]: createSnapshot(importPayload),
  };

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  snapshotCsvEngineStage,
};
