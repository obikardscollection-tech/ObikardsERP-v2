const { assertContext, assertContextData } = require("../common/contextAssertions");

const INTERNALS = {
  KEYS: {
    DATA: "data",
    NORMALIZED_ROWS: "normalizedRows",
    MATCHED_ROWS: "matchedRows",
  },
};

/**
 * Clone one row for immutable matching payload construction.
 * @param {Record<string, unknown>} row
 * @returns {Record<string, unknown>}
 */
function cloneRow(row) {
  if (typeof structuredClone === "function") {
    return structuredClone(row);
  }

  return JSON.parse(JSON.stringify(row));
}

/**
 * Build a new immutable context enriched with matched rows.
 * @param {object} context
 * @returns {Promise<object>}
 */
async function matchCsvEngineStage(context) {
  assertContext(context);
  assertContextData(context[INTERNALS.KEYS.DATA]);

  const data = context[INTERNALS.KEYS.DATA];
  const normalizedRows = data[INTERNALS.KEYS.NORMALIZED_ROWS];
  const matchedRows = data[INTERNALS.KEYS.MATCHED_ROWS];

  if (!Array.isArray(normalizedRows)) {
    throw new Error("Les lignes normalisees du contexte CSV sont introuvables.");
  }

  if (!Array.isArray(matchedRows)) {
    throw new Error("Les lignes matchees du contexte CSV sont introuvables.");
  }

  const nextData = {
    ...data,
    [INTERNALS.KEYS.MATCHED_ROWS]: normalizedRows.map((row) => cloneRow(row)),
  };

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  matchCsvEngineStage,
};
