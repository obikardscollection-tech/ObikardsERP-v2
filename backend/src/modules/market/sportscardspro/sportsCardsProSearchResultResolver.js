const INTERNALS = {
  SEARCH_RESPONSE_KEYS: {
    RESULTS: "results",
    PRODUCTS: "products",
    DATA: "data",
  },
  FIELD_ALIASES: {
    ID: ["id", "product-id"],
    PLAYER: ["player", "name", "title"],
    SPORT: ["sport", "league", "category"],
    BRAND: ["brand", "manufacturer"],
    SET: ["set", "series", "subset"],
    SERIES: ["series", "set"],
    SUBSET: ["subset", "sub-set"],
    CARD_NUMBER: ["card-number", "cardNumber", "number"],
    PARALLEL: ["parallel", "subset", "variation"],
    VARIATION: ["variation", "parallel", "subset"],
    PRODUCT_NAME: ["product-name", "productName"],
    CONSOLE_NAME: ["console-name", "consoleName"],
    YEAR: ["year", "release-year"],
  },
};

function normalizeString(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumericString(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = String(value).replace(/[^0-9]/g, "");

  return numericValue === "" ? null : numericValue;
}

function normalizeComparableCardNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).trim();

  if (normalized === "") {
    return null;
  }

  return normalized.replace(/^#/, "").replace(/\s+/g, "").toLowerCase();
}

function areCardNumbersComparable(referenceValue, candidateValue) {
  const left = normalizeComparableCardNumber(referenceValue);
  const right = normalizeComparableCardNumber(candidateValue);

  if (!left || !right) {
    return false;
  }

  if (left === right) {
    return true;
  }

  const leftHasDigits = /\d/.test(left);
  const rightHasDigits = /\d/.test(right);

  if (!leftHasDigits || !rightHasDigits) {
    return false;
  }

  return true;
}

function findExactValue(source, keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }

  const normalizedMap = Object.entries(source);

  for (const [sourceKey, sourceValue] of normalizedMap) {
    const normalizedKey = normalizeString(sourceKey);

    for (const key of keys) {
      if (normalizeString(key) === normalizedKey) {
        return sourceValue;
      }
    }
  }

  return null;
}

function getEntryField(entry, keys) {
  const value = findExactValue(entry, keys);

  if (value === undefined || value === null || value === "") {
    return null;
  }

  return value;
}

function inferPlayerFromProductName(productName) {
  if (typeof productName !== "string") {
    return null;
  }

  const match = productName.match(/^(.+?)\s*\[/);

  if (match && match[1] && match[1].trim() !== "") {
    return match[1].trim();
  }

  return null;
}

function inferParallelFromProductName(productName) {
  if (typeof productName !== "string") {
    return null;
  }

  const match = productName.match(/\[([^\]]+)\]/);

  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}

function extractSearchEntryFields(entry) {
  const productName = getEntryField(entry, INTERNALS.FIELD_ALIASES.PRODUCT_NAME) || "";
  const consoleName = getEntryField(entry, INTERNALS.FIELD_ALIASES.CONSOLE_NAME) || "";

  return {
    id: getEntryField(entry, INTERNALS.FIELD_ALIASES.ID),
    player: getEntryField(entry, INTERNALS.FIELD_ALIASES.PLAYER) || inferPlayerFromProductName(productName),
    sport: getEntryField(entry, INTERNALS.FIELD_ALIASES.SPORT),
    brand: getEntryField(entry, INTERNALS.FIELD_ALIASES.BRAND),
    set: getEntryField(entry, INTERNALS.FIELD_ALIASES.SET) || getEntryField(entry, INTERNALS.FIELD_ALIASES.SERIES),
    series: getEntryField(entry, INTERNALS.FIELD_ALIASES.SERIES) || getEntryField(entry, INTERNALS.FIELD_ALIASES.SET),
    subset: getEntryField(entry, INTERNALS.FIELD_ALIASES.SUBSET),
    cardNumber: toNumericString(getEntryField(entry, INTERNALS.FIELD_ALIASES.CARD_NUMBER)),
    parallel: getEntryField(entry, INTERNALS.FIELD_ALIASES.PARALLEL) || inferParallelFromProductName(productName),
    variation: getEntryField(entry, INTERNALS.FIELD_ALIASES.VARIATION) || getEntryField(entry, INTERNALS.FIELD_ALIASES.PARALLEL) || inferParallelFromProductName(productName),
    year: getEntryField(entry, INTERNALS.FIELD_ALIASES.YEAR),
    productName,
    consoleName,
  };
}

function isExactNormalizedMatch(a, b) {
  const left = normalizeString(a);
  const right = normalizeString(b);

  return left !== "" && left === right;
}

function isTokenMatch(a, b) {
  const left = normalizeString(a);
  const right = normalizeString(b);

  if (left === "" || right === "") {
    return false;
  }

  return left.includes(right) || right.includes(left);
}

function isParallelEquivalent(referenceValue, candidateValue) {
  const ref = normalizeString(referenceValue);
  const candidate = normalizeString(candidateValue);

  if (ref === "" || candidate === "") {
    return false;
  }

  if (ref === candidate) {
    return true;
  }

  return candidate.includes(ref) || ref.includes(candidate);
}

function scoreParallelMatch(referenceValue, candidateValue) {
  const ref = normalizeString(referenceValue);
  const candidate = normalizeString(candidateValue);

  if (ref === "" || candidate === "") {
    return 0;
  }

  if (ref === candidate) {
    return 80;
  }

  if (candidate.includes(ref) || ref.includes(candidate)) {
    return 20;
  }

  return -80;
}

function evaluateSearchEntry(entry, referenceCard) {
  const fields = extractSearchEntryFields(entry);
  const refPlayer = referenceCard && referenceCard.player ? String(referenceCard.player) : null;
  const refYear = referenceCard && referenceCard.year !== undefined && referenceCard.year !== null ? String(referenceCard.year) : null;
  const refBrand = referenceCard && referenceCard.brand ? String(referenceCard.brand) : null;
  const refSet = referenceCard && (referenceCard.set || referenceCard.series) ? String(referenceCard.set || referenceCard.series) : null;
  const refSubset = referenceCard && referenceCard.subset ? String(referenceCard.subset) : null;
  const refCardNumber = referenceCard && referenceCard.cardNumber !== undefined && referenceCard.cardNumber !== null ? String(referenceCard.cardNumber) : null;
  const refParallel = referenceCard && referenceCard.parallel ? String(referenceCard.parallel) : null;
  const refVariation = referenceCard && referenceCard.variation ? String(referenceCard.variation) : null;
  const refSport = referenceCard && referenceCard.sport ? String(referenceCard.sport) : null;

  let score = 0;

  if (isExactNormalizedMatch(refPlayer, fields.player)) score += 80;
  if (refYear && isExactNormalizedMatch(refYear, fields.year)) score += 40;
  if (refSport && isExactNormalizedMatch(refSport, fields.sport)) score += 15;
  if (refBrand && isExactNormalizedMatch(refBrand, fields.brand)) score += 25;
  if (refSet && (isExactNormalizedMatch(refSet, fields.set) || isExactNormalizedMatch(refSet, fields.series) || isTokenMatch(refSet, fields.consoleName))) score += 60;
  if (refSubset) {
    if (isExactNormalizedMatch(refSubset, fields.subset)) {
      score += 70;
    } else if (isTokenMatch(refSubset, fields.subset)) {
      score += 25;
    }
  }
  if (refParallel) {
    score += Math.max(
      scoreParallelMatch(refParallel, fields.parallel),
      scoreParallelMatch(refParallel, fields.variation),
      scoreParallelMatch(refParallel, inferParallelFromProductName(fields.productName))
    );
  }

  if (refVariation) {
    score += Math.max(
      scoreParallelMatch(refVariation, fields.parallel),
      scoreParallelMatch(refVariation, fields.variation),
      scoreParallelMatch(refVariation, inferParallelFromProductName(fields.productName))
    ) * 0.5;
  }

  if (refCardNumber && fields.cardNumber) {
    const normalizedRefNumber = normalizeComparableCardNumber(refCardNumber);
    const normalizedCandidateNumber = normalizeComparableCardNumber(fields.cardNumber);

    if (normalizedRefNumber && normalizedCandidateNumber) {
      if (normalizedRefNumber === normalizedCandidateNumber) {
        score += 100;
      } else if (areCardNumbersComparable(refCardNumber, fields.cardNumber)) {
        score += 15;
      } else {
        score -= 10;
      }
    }
  }

  const productName = normalizeString(fields.productName);
  const consoleName = normalizeString(fields.consoleName);

  if (productName && refPlayer && productName.includes(normalizeString(refPlayer))) score += 20;
  if (productName && refCardNumber && normalizeComparableCardNumber(refCardNumber) && productName.includes(normalizeComparableCardNumber(refCardNumber))) score += 20;
  if (productName && refSubset && normalizeString(refSubset) !== "" && productName.toLowerCase().includes(normalizeString(refSubset))) score += 15;
  if (productName && refParallel) {
    const normalizedParallel = normalizeString(refParallel);
    const bracketValue = normalizeString(inferParallelFromProductName(productName));
    if (bracketValue === normalizedParallel) {
      score += 35;
    } else if (productName.includes(normalizedParallel)) {
      score += 10;
    } else {
      score -= 90;
    }
  }
  if (consoleName && refSet && (consoleName.includes(normalizeString(refSet)) || isTokenMatch(refSet, consoleName))) score += 20;

  return {
    entry,
    score,
  };
}

function resolveBestSportsCardsProSearchEntry(searchResponse, referenceCard) {
  if (!searchResponse) {
    return null;
  }

  let entries = [];

  if (Array.isArray(searchResponse)) {
    entries = searchResponse;
  } else if (typeof searchResponse === "object") {
    entries = [];

    for (const key of [INTERNALS.SEARCH_RESPONSE_KEYS.RESULTS, INTERNALS.SEARCH_RESPONSE_KEYS.PRODUCTS, INTERNALS.SEARCH_RESPONSE_KEYS.DATA]) {
      if (Array.isArray(searchResponse[key])) {
        entries = searchResponse[key];
        break;
      }
    }
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  if (entries.length !== 1) {
    return null;
  }

  return entries[0];
}

/**
 * Resolve first search entry from raw SportsCardsPro search payload.
 * @param {unknown} searchResponse
 * @returns {object}
 */
function resolveFirstSportsCardsProSearchEntry(searchResponse) {
  if (Array.isArray(searchResponse) && searchResponse.length > 0) {
    return searchResponse[0];
  }

  if (!searchResponse || typeof searchResponse !== "object") {
    throw new Error("La recherche SportsCardsPro ne contient aucun resultat exploitable.");
  }

  if (
    Array.isArray(searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.RESULTS]) &&
    searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.RESULTS].length > 0
  ) {
    return searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.RESULTS][0];
  }

  if (
    Array.isArray(searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.PRODUCTS]) &&
    searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.PRODUCTS].length > 0
  ) {
    return searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.PRODUCTS][0];
  }

  if (
    Array.isArray(searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.DATA]) &&
    searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.DATA].length > 0
  ) {
    return searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.DATA][0];
  }

  throw new Error("La recherche SportsCardsPro ne retourne aucun resultat.");
}

module.exports = {
  evaluateSearchEntry,
  resolveBestSportsCardsProSearchEntry,
  resolveFirstSportsCardsProSearchEntry,
};
