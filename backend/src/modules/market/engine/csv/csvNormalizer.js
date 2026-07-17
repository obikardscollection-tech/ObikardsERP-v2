const { assertContext, assertContextData } = require("../common/contextAssertions");

const INTERNALS = {
  KEYS: {
    DATA: "data",
    RAW_ROWS: "rawRows",
    NORMALIZED_ROWS: "normalizedRows",
  },
};

/**
 * Normalize one raw cell value.
 * @param {unknown} value
 * @returns {unknown}
 */
function normalizeValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue === "" ? null : trimmedValue;
  }

  return value;
}

/**
 * Normalize one CSV row.
 * @param {Record<string, unknown>} row
 * @returns {Record<string, unknown>}
 */
function normalizeRow(row) {
  const normalizedRow = {};

  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = String(key).trim();
    normalizedRow[normalizedKey] = normalizeValue(value);
  }

  return normalizedRow;
}

/**
 * Build a new immutable context enriched with normalized rows.
 * @param {object} context
 * @returns {Promise<object>}
 */
async function normalizeCsvEngineStage(context) {
  assertContext(context);
  assertContextData(context[INTERNALS.KEYS.DATA]);

  const data = context[INTERNALS.KEYS.DATA];
  const rawRows = data[INTERNALS.KEYS.RAW_ROWS];
  const normalizedRows = data[INTERNALS.KEYS.NORMALIZED_ROWS];

  if (!Array.isArray(rawRows)) {
    throw new Error("Les lignes brutes du contexte CSV sont introuvables.");
  }

  if (!Array.isArray(normalizedRows)) {
    throw new Error("Les lignes normalisees du contexte CSV sont introuvables.");
  }

  const nextData = {
    ...data,
    [INTERNALS.KEYS.NORMALIZED_ROWS]: rawRows.map((row) => normalizeRow(row)),
  };

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  normalizeCsvEngineStage,
};
