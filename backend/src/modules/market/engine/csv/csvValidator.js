const { assertContext } = require("../common/contextAssertions");

const INTERNALS = {
  KEYS: {
    DATA: "data",
    METADATA: "metadata",
    STATS: "stats",
    HEADERS: "headers",
    RAW_ROWS: "rawRows",
    ERRORS: "errors",
    VALIDATED_ROWS: "validatedRows",
  },
};

/**
 * Build the next immutable error list.
 * @param {string[]} errors
 * @param {string} message
 * @returns {string[]}
 */
function addError(errors, message) {
  return [...errors, message];
}

/**
 * Build a new immutable context enriched with CSV validation results.
 * @param {object} context
 * @returns {Promise<object>}
 */
async function validateCsvEngineStage(context) {
  assertContext(context);

  const metadata = context[INTERNALS.KEYS.METADATA];
  const data = context[INTERNALS.KEYS.DATA];
  const stats = context[INTERNALS.KEYS.STATS];

  if (!metadata) {
    throw new Error("Les metadonnees du contexte CSV sont introuvables.");
  }

  if (!data || !Array.isArray(data[INTERNALS.KEYS.RAW_ROWS])) {
    throw new Error("Les donnees du contexte CSV sont introuvables.");
  }

  if (!Array.isArray(metadata[INTERNALS.KEYS.HEADERS])) {
    throw new Error("Les en-tetes du contexte CSV sont introuvables.");
  }

  if (!stats) {
    throw new Error("Les statistiques du contexte CSV sont introuvables.");
  }

  let errors = Array.isArray(context[INTERNALS.KEYS.ERRORS])
    ? [...context[INTERNALS.KEYS.ERRORS]]
    : [];

  const rawRows = data[INTERNALS.KEYS.RAW_ROWS];
  const headers = metadata[INTERNALS.KEYS.HEADERS];

  if (headers.length === 0) {
    errors = addError(errors, "Impossible de detecter l'en-tete du fichier CSV.");
  }

  if (rawRows.length === 0) {
    errors = addError(errors, "Aucune ligne CSV n'a ete trouvee.");
  }

  const nextStats =
    errors.length === 0
      ? {
          ...stats,
          [INTERNALS.KEYS.VALIDATED_ROWS]: rawRows.length,
        }
      : stats;

  return {
    ...context,
    [INTERNALS.KEYS.ERRORS]: errors,
    [INTERNALS.KEYS.STATS]: nextStats,
  };
}

module.exports = {
  validateCsvEngineStage,
};
