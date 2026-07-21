const { searchCards } = require("../../sportsCardsPro");

const INTERNALS = {
  PROVIDER_ID: "sportscardspro",
};

function toNullableString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized === "" ? null : normalized;
}

function toNullableInteger(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (normalized === "") {
      return null;
    }

    const asInteger = Number.parseInt(normalized, 10);

    if (!Number.isNaN(asInteger)) {
      return asInteger;
    }
  }

  return null;
}

function mapEntry(entry) {
  const cardReference =
    entry && entry.cardReference && typeof entry.cardReference === "object" && !Array.isArray(entry.cardReference)
      ? entry.cardReference
      : {};

  return {
    provider: INTERNALS.PROVIDER_ID,
    providerCardId: toNullableString(entry.externalId),
    title: toNullableString(entry.productName),
    player: toNullableString(cardReference.player),
    year: toNullableInteger(cardReference.year),
    set: toNullableString(cardReference.set),
    cardNumber: toNullableString(cardReference.cardNumber),
    brand: toNullableString(cardReference.brand),
    season: toNullableString(cardReference.season),
    parallel: toNullableString(cardReference.parallel),
    variation: toNullableString(cardReference.variation),
    grade: null,
    raw: entry,
  };
}

function filterProviderCriteria(criteria) {
  const accepted = ["player", "year", "set", "number", "cardNumber", "brand", "season"];
  const payload = {};

  for (const key of accepted) {
    if (criteria[key] !== undefined && criteria[key] !== null) {
      payload[key] = criteria[key];
    }
  }

  return payload;
}

async function searchProviderCards(criteria) {
  const payload = filterProviderCriteria(criteria);
  const response = await searchCards(payload);

  if (!response || !Array.isArray(response.entries)) {
    return {
      provider: INTERNALS.PROVIDER_ID,
      candidates: [],
      raw: response,
    };
  }

  return {
    provider: INTERNALS.PROVIDER_ID,
    candidates: response.entries.map(mapEntry),
    raw: response,
  };
}

module.exports = {
  id: INTERNALS.PROVIDER_ID,
  searchCards: searchProviderCards,
};
