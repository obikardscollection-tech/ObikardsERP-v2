const REFERENCE_FIELDS = [
  "sport",
  "league",
  "year",
  "manufacturer",
  "brand",
  "set",
  "subset",
  "cardNumber",
  "player",
  "playerDisplayName",
  "team",
  "parallel",
  "variation",
  "rookie",
  "autograph",
  "memorabilia",
  "insert",
  "printRun",
  "language",
  "referenceFingerprint",
  "sportsCardsProId",
  "tcdbId",
  "beckettId",
  "psaPopulationId",
  "cardUuid",
];

const STRING_FIELDS = new Set([
  "sport",
  "league",
  "manufacturer",
  "brand",
  "set",
  "subset",
  "cardNumber",
  "player",
  "playerDisplayName",
  "team",
  "parallel",
  "variation",
  "language",
  "referenceFingerprint",
  "sportsCardsProId",
  "tcdbId",
  "beckettId",
  "psaPopulationId",
  "cardUuid",
]);

const BOOLEAN_FIELDS = new Set([
  "rookie",
  "autograph",
  "memorabilia",
  "insert",
]);

const INTEGER_FIELDS = new Set([
  "year",
  "printRun",
]);

function normalizeNullableString(value) {
  if (typeof value !== "string") {
    return value === null || value === undefined ? null : value;
  }

  const normalized = value.trim();

  return normalized === "" ? null : normalized;
}

/**
 * Normalize one CardReference field value according to its declared type.
 * @param {string} field
 * @param {unknown} value
 */
function normalizeFieldValue(field, value) {
  if (STRING_FIELDS.has(field)) {
    return normalizeNullableString(value);
  }

  if (BOOLEAN_FIELDS.has(field)) {
    if (typeof value === "boolean") {
      return value;
    }

    return value === null || value === undefined ? null : value;
  }

  if (INTEGER_FIELDS.has(field)) {
    if (typeof value === "number") {
      return value;
    }

    return value === null || value === undefined ? null : value;
  }

  return value === null || value === undefined ? null : value;
}

/**
 * Map any input object to a CardReference persistence payload.
 * @param {object} input
 */
function toPersistence(input) {
  const payload = {};

  for (const field of REFERENCE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(input || {}, field)) {
      continue;
    }

    const value = input[field];

    payload[field] = normalizeFieldValue(field, value);
  }

  return payload;
}

module.exports = {
  toPersistence,
  REFERENCE_FIELDS,
};
