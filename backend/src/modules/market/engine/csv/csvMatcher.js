const { assertContext, assertContextData } = require("../common/contextAssertions");
const { matchCard } = require("../../../cardMatching");

const INTERNALS = {
  KEYS: {
    DATA: "data",
    NORMALIZED_ROWS: "normalizedRows",
    MATCHED_ROWS: "matchedRows",
  },
  MATCH_STATUS: {
    NO_RESULT: "NO_RESULT",
    ONE_RESULT: "ONE_RESULT",
    MULTIPLE_RESULTS: "MULTIPLE_RESULTS",
  },
  CONFIDENCE_LEVELS: {
    NONE: "NONE",
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
  },
  CRITERIA_KEYS: [
    "provider",
    "player",
    "year",
    "set",
    "cardNumber",
    "number",
    "brand",
    "season",
    "parallel",
    "variation",
    "grade",
  ],
  ROW_ALIASES: {
    provider: ["provider", "source", "market", "marketplace"],
    player: ["player", "athlete", "name", "playername"],
    year: ["year", "seasonyear", "releaseyear", "annee"],
    set: ["set", "series", "setname", "collection"],
    cardNumber: ["cardnumber", "number", "cardno", "no", "num"],
    number: ["number", "cardnumber", "cardno", "no", "num"],
    brand: ["brand", "manufacturer", "maker"],
    season: ["season"],
    parallel: ["parallel", "variant", "parallelname"],
    variation: ["variation", "var", "variationname"],
    grade: ["grade", "condition", "state"],
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
 * Normalize one object key for resilient column lookups.
 * @param {string} key
 * @returns {string}
 */
function normalizeKey(key) {
  return String(key)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Build an index from normalized key to value.
 * @param {Record<string, unknown>} row
 * @returns {Map<string, unknown>}
 */
function indexRowValues(row) {
  const indexed = new Map();

  for (const [key, value] of Object.entries(row)) {
    indexed.set(normalizeKey(key), value);
  }

  return indexed;
}

/**
 * Return first non-empty scalar value from candidate aliases.
 * @param {Map<string, unknown>} indexedValues
 * @param {string[]} aliases
 * @returns {string|number|null}
 */
function readAliasedValue(indexedValues, aliases) {
  for (const alias of aliases) {
    if (!indexedValues.has(alias)) {
      continue;
    }

    const value = indexedValues.get(alias);

    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      const normalized = value.trim();

      if (normalized !== "") {
        return normalized;
      }

      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

/**
 * Build normalized card matching criteria from one normalized CSV row.
 * @param {Record<string, unknown>} row
 * @returns {Record<string, unknown>}
 */
function buildMatchingCriteria(row) {
  const indexedValues = indexRowValues(row);
  const criteria = {};

  for (const key of INTERNALS.CRITERIA_KEYS) {
    const aliases = INTERNALS.ROW_ALIASES[key] || [key];
    criteria[key] = readAliasedValue(indexedValues, aliases);
  }

  return criteria;
}

/**
 * Detect whether criteria contains at least one searchable value.
 * @param {Record<string, unknown>} criteria
 * @returns {boolean}
 */
function hasSearchableCriteria(criteria) {
  for (const key of INTERNALS.CRITERIA_KEYS) {
    if (key === "provider") {
      continue;
    }

    if (criteria[key] !== null && criteria[key] !== undefined && criteria[key] !== "") {
      return true;
    }
  }

  return false;
}

/**
 * Convert numeric confidence to a coarse level label.
 * @param {number} confidence
 * @returns {string}
 */
function toConfidenceLevel(confidence) {
  if (!Number.isFinite(confidence) || confidence <= 0) {
    return INTERNALS.CONFIDENCE_LEVELS.NONE;
  }

  if (confidence >= 80) {
    return INTERNALS.CONFIDENCE_LEVELS.HIGH;
  }

  if (confidence >= 50) {
    return INTERNALS.CONFIDENCE_LEVELS.MEDIUM;
  }

  return INTERNALS.CONFIDENCE_LEVELS.LOW;
}

/**
 * Derive import-friendly status from candidate count.
 * @param {number} totalCandidates
 * @returns {string}
 */
function toRowStatus(totalCandidates) {
  if (!Number.isInteger(totalCandidates) || totalCandidates <= 0) {
    return INTERNALS.MATCH_STATUS.NO_RESULT;
  }

  if (totalCandidates === 1) {
    return INTERNALS.MATCH_STATUS.ONE_RESULT;
  }

  return INTERNALS.MATCH_STATUS.MULTIPLE_RESULTS;
}

/**
 * Execute card matching on one CSV row and build a structured line result.
 * @param {Record<string, unknown>} row
 * @returns {Promise<Record<string, unknown>>}
 */
async function matchNormalizedRow(row) {
  const originalLine = cloneRow(row);
  const normalizedCriteria = buildMatchingCriteria(row);

  if (!hasSearchableCriteria(normalizedCriteria)) {
    return {
      originalLine,
      normalizedCriteria,
      matchingResult: null,
      bestCandidate: null,
      score: 0,
      confidence: 0,
      confidenceLevel: INTERNALS.CONFIDENCE_LEVELS.NONE,
      status: INTERNALS.MATCH_STATUS.NO_RESULT,
    };
  }

  const matchingResult = await matchCard(normalizedCriteria);

  const totalCandidates = Number.isInteger(matchingResult.totalCandidates)
    ? matchingResult.totalCandidates
    : Array.isArray(matchingResult.candidates)
      ? matchingResult.candidates.length
      : 0;

  const bestMatch = matchingResult.bestMatch || null;
  const score = bestMatch && Number.isFinite(bestMatch.score) ? bestMatch.score : 0;
  const confidence = bestMatch && Number.isFinite(bestMatch.confidence)
    ? bestMatch.confidence
    : 0;

  return {
    originalLine,
    normalizedCriteria,
    matchingResult,
    bestCandidate: bestMatch ? bestMatch.card : null,
    score,
    confidence,
    confidenceLevel: toConfidenceLevel(confidence),
    status: toRowStatus(totalCandidates),
  };
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

  const matchedRowsPayload = [];

  for (const row of normalizedRows) {
    matchedRowsPayload.push(await matchNormalizedRow(row));
  }

  const nextData = {
    ...data,
    [INTERNALS.KEYS.MATCHED_ROWS]: matchedRowsPayload,
  };

  return {
    ...context,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  matchCsvEngineStage,
};
