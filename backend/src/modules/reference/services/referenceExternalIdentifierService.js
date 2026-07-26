const EXTERNAL_IDENTIFIER_FIELDS = new Set([
  "sportsCardsProId",
  "tcdbId",
  "beckettId",
  "psaPopulationId",
  "cardUuid",
]);

const PROVIDER_EXTERNAL_IDENTIFIER_MAP = {
  sportscardspro: "sportsCardsProId",
  tcdb: "tcdbId",
  beckett: "beckettId",
  psa: "psaPopulationId",
  carduuid: "cardUuid",
};

function normalizeProviderKey(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
}

function normalizeExternalIdentifierValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function isSupportedExternalIdentifierField(field) {
  return EXTERNAL_IDENTIFIER_FIELDS.has(field);
}

function resolveExternalIdentifierField(fieldOrProvider) {
  if (typeof fieldOrProvider !== "string") {
    return null;
  }

  const normalizedValue = fieldOrProvider.trim();

  if (normalizedValue === "") {
    return null;
  }

  if (EXTERNAL_IDENTIFIER_FIELDS.has(normalizedValue)) {
    return normalizedValue;
  }

  const providerKey = normalizeProviderKey(normalizedValue);

  return PROVIDER_EXTERNAL_IDENTIFIER_MAP[providerKey] || null;
}

module.exports = {
  EXTERNAL_IDENTIFIER_FIELDS,
  isSupportedExternalIdentifierField,
  resolveExternalIdentifierField,
  normalizeExternalIdentifierValue,
};
