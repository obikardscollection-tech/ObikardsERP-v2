const FINGERPRINT_FIELDS = [
  "sport",
  "year",
  "manufacturer",
  "brand",
  "set",
  "subset",
  "cardNumber",
  "player",
  "parallel",
  "variation",
  "language",
];

/**
 * Normalize one fingerprint segment.
 * @param {unknown} value
 * @returns {string}
 */
function normalizeFingerprintPart(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  return String(value).trim();
}

/**
 * Build a deterministic card reference fingerprint.
 * @param {object} cardReference
 * @returns {string}
 */
function buildReferenceFingerprint(cardReference) {
  const source = cardReference && typeof cardReference === "object"
    ? cardReference
    : {};

  return FINGERPRINT_FIELDS
    .map((field) => normalizeFingerprintPart(source[field]))
    .join("|");
}

module.exports = {
  buildReferenceFingerprint,
};
