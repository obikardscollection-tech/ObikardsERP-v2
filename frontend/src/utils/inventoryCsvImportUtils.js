export function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      if (entry && typeof entry === "object") {
        const row = Number.isFinite(entry.row) ? `Ligne ${entry.row}: ` : "";
        const message = typeof entry.message === "string" ? entry.message : JSON.stringify(entry);

        return `${row}${message}`;
      }

      return String(entry);
    })
    .filter(Boolean);
}

export function formatPercentage(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0%";
  }

  if (numberValue > 1) {
    return `${numberValue.toFixed(0)}%`;
  }

  return `${(numberValue * 100).toFixed(0)}%`;
}

export function formatDuration(durationMs) {
  const value = Number(durationMs);

  if (!Number.isFinite(value) || value <= 0) {
    return "-";
  }

  return `${value} ms`;
}

export function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function stringifyValue(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return value.trim() === "" ? "-" : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "-";
    }

    return value
      .map((entry) => stringifyValue(entry))
      .filter((entry) => entry !== "-")
      .join(", ");
  }

  if (isPlainObject(value)) {
    try {
      return JSON.stringify(value);
    } catch (_error) {
      return "[objet]";
    }
  }

  return String(value);
}

export function normalizeRowMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message) => stringifyValue(message))
    .filter((message) => message !== "-");
}

export function toJsonBlock(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (_error) {
    return String(value);
  }
}

export function resolveMatchingPresentation(row, fallbackMissingCriticalColumns = []) {
  const matching = isPlainObject(row?.matching) ? row.matching : null;
  const bestCandidate = isPlainObject(matching?.bestCandidate) ? matching.bestCandidate : matching?.bestCandidate || null;
  const scoringDetails =
    matching?.scoringDetails ||
    matching?.scoreDetails ||
    matching?.scoring ||
    matching?.bestMatch?.scoring ||
    bestCandidate?.scoring ||
    null;
  const candidates = Array.isArray(matching?.candidates) ? matching.candidates : [];
  const conflicts = normalizeRowMessages(row?.conflicts || matching?.conflicts);
  const warnings = normalizeRowMessages(row?.warnings || matching?.warnings);
  const errors = normalizeRowMessages(row?.errors || matching?.errors);
  const refusalReasons = normalizeRowMessages(
    row?.refusalReasons ||
      row?.rejectionReasons ||
      matching?.refusalReasons ||
      matching?.reasons ||
      []
  );
  const missingCriticalColumns = Array.isArray(row?.missingCriticalColumns)
    ? row.missingCriticalColumns
    : Array.isArray(matching?.missingCriticalColumns)
      ? matching.missingCriticalColumns
      : Array.isArray(fallbackMissingCriticalColumns)
        ? fallbackMissingCriticalColumns
        : [];

  return {
    status: matching?.status || row?.status || "UNKNOWN",
    score: matching?.score,
    confidence: matching?.confidence,
    provider: matching?.provider || row?.provider || row?.matchingProvider || null,
    bestCandidate,
    candidateCount:
      matching?.candidateCount ??
      matching?.candidatesCount ??
      (candidates.length > 0 ? candidates.length : null),
    scoringDetails,
    conflicts,
    warnings,
    errors,
    fingerprint:
      row?.fingerprint ||
      matching?.fingerprint ||
      bestCandidate?.referenceFingerprint ||
      bestCandidate?.fingerprint ||
      null,
    foundReference:
      row?.foundReference ||
      matching?.foundReference ||
      bestCandidate?.reference ||
      bestCandidate?.cardReference ||
      null,
    missingReference: row?.missingReference || matching?.missingReference || null,
    missingCriticalColumns,
    refusalReasons,
    rawMatching: matching,
    rawRow: row,
  };
}
