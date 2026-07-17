const { assertContext, assertContextData } = require("../common/contextAssertions");

const INTERNALS = {
  KEYS: {
    DATA: "data",
  },
};

/**
 * Build a new immutable context for fingerprint stage.
 * Fingerprint enrichment remains a no-op extension point for now.
 * @param {object} context
 * @returns {Promise<object>}
 */
async function fingerprintCsvEngineStage(context) {
  assertContext(context);
  assertContextData(context[INTERNALS.KEYS.DATA]);

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: {
      ...context[INTERNALS.KEYS.DATA],
    },
  };
}

module.exports = {
  fingerprintCsvEngineStage,
};
