const { INTERNALS } = require("./constants");
const { normalizeColumnLabel } = require("./validation");

/**
 * Resolve matching payload from a matched row shape.
 * @param {unknown} matchedRow
 * @returns {object|null}
 */
function resolveMatchingPayload(matchedRow) {
  if (!matchedRow || typeof matchedRow !== "object" || Array.isArray(matchedRow)) {
    return null;
  }

  if (matchedRow.matching && typeof matchedRow.matching === "object") {
    return matchedRow.matching;
  }

  if (matchedRow.match && typeof matchedRow.match === "object") {
    return matchedRow.match;
  }

  if (matchedRow.cardMatching && typeof matchedRow.cardMatching === "object") {
    return matchedRow.cardMatching;
  }

  return null;
}

/**
 * Normalize matching status for reporting.
 * @param {object|null} matching
 * @returns {{status:string,bestCandidate:object|null,candidateCount:number,confidence:number|null,score:number|null}}
 */
function summarizeMatching(matching) {
  if (!matching || typeof matching !== "object") {
    return {
      status: INTERNALS.MATCHING.STATUS.UNKNOWN,
      bestCandidate: null,
      candidateCount: 0,
      confidence: null,
      score: null,
    };
  }

  const rawStatus = typeof matching.status === "string" ? matching.status.toUpperCase() : "";
  const candidates = Array.isArray(matching.candidates) ? matching.candidates : [];
  const bestMatch = matching.bestMatch && typeof matching.bestMatch === "object"
    ? matching.bestMatch
    : null;

  if (
    rawStatus.includes("MULTIPLE") ||
    rawStatus.includes("AMBIGUOUS") ||
    candidates.length > 1
  ) {
    return {
      status: INTERNALS.MATCHING.STATUS.MULTIPLE,
      bestCandidate: bestMatch ? bestMatch.card || null : null,
      candidateCount: candidates.length,
      confidence: bestMatch && typeof bestMatch.confidence === "number" ? bestMatch.confidence : null,
      score: bestMatch && typeof bestMatch.score === "number" ? bestMatch.score : null,
    };
  }

  if (
    rawStatus.includes("NO_MATCH") ||
    rawStatus.includes("NOT_FOUND") ||
    (candidates.length === 0 && !bestMatch)
  ) {
    return {
      status: INTERNALS.MATCHING.STATUS.NONE,
      bestCandidate: null,
      candidateCount: 0,
      confidence: null,
      score: null,
    };
  }

  if (bestMatch || candidates.length === 1 || rawStatus.includes("MATCH")) {
    const candidate = bestMatch
      ? bestMatch.card || null
      : candidates.length === 1 && candidates[0] && typeof candidates[0] === "object"
        ? candidates[0].card || candidates[0]
        : null;

    return {
      status: INTERNALS.MATCHING.STATUS.SINGLE,
      bestCandidate: candidate,
      candidateCount: candidates.length || (candidate ? 1 : 0),
      confidence: bestMatch && typeof bestMatch.confidence === "number" ? bestMatch.confidence : null,
      score: bestMatch && typeof bestMatch.score === "number" ? bestMatch.score : null,
    };
  }

  return {
    status: INTERNALS.MATCHING.STATUS.UNKNOWN,
    bestCandidate: null,
    candidateCount: candidates.length,
    confidence: null,
    score: null,
  };
}

/**
 * Update counters from one matching summary.
 * @param {{single:number,multiple:number,none:number,unknown:number}} counters
 * @param {{status:string}} summary
 */
function bumpMatchingCounters(counters, summary) {
  if (summary.status === INTERNALS.MATCHING.STATUS.SINGLE) {
    counters.single += 1;
    return;
  }

  if (summary.status === INTERNALS.MATCHING.STATUS.MULTIPLE) {
    counters.multiple += 1;
    return;
  }

  if (summary.status === INTERNALS.MATCHING.STATUS.NONE) {
    counters.none += 1;
    return;
  }

  counters.unknown += 1;
}

/**
 * Build deterministic row signature for duplicate detection.
 * @param {object|null} dto
 * @returns {string|null}
 */
function createDuplicateFingerprint(dto) {
  if (!dto || typeof dto !== "object" || Array.isArray(dto)) {
    return null;
  }

  const fields = [
    dto.player,
    dto.year,
    dto.series,
    dto.cardNumber,
    dto.parallel,
    dto.variation,
    dto.grade,
  ].map((value) => (value === undefined || value === null ? "" : String(value).trim().toLowerCase()));

  const key = fields.join("|");

  return key.replace(/\|/g, "").trim() === "" ? null : key;
}

/**
 * Detect missing critical column groups from headers.
 * @param {string[]} headers
 * @returns {string[]}
 */
function detectMissingCriticalColumns(headers) {
  const normalizedHeaders = new Set(headers.map((header) => normalizeColumnLabel(header)));
  const missing = [];

  for (const group of INTERNALS.REQUIRED_COLUMN_GROUPS) {
    const found = group.aliases.some((alias) => normalizedHeaders.has(normalizeColumnLabel(alias)));

    if (!found) {
      missing.push(group.key);
    }
  }

  return missing;
}

/**
 * Resolve if a row is importable based on matching result.
 * @param {{status:string}} matchingSummary
 * @returns {{importable:boolean,message:string|null}}
 */
function validateImportabilityFromMatching(matchingSummary) {
  if (matchingSummary.status === INTERNALS.MATCHING.STATUS.MULTIPLE) {
    return {
      importable: false,
      message: INTERNALS.ERRORS.CONFLICTING_MATCHES,
    };
  }

  if (matchingSummary.status === INTERNALS.MATCHING.STATUS.NONE) {
    return {
      importable: false,
      message: INTERNALS.ERRORS.NO_MATCH,
    };
  }

  return {
    importable: true,
    message: null,
  };
}

module.exports = {
  resolveMatchingPayload,
  summarizeMatching,
  bumpMatchingCounters,
  createDuplicateFingerprint,
  detectMissingCriticalColumns,
  validateImportabilityFromMatching,
};
