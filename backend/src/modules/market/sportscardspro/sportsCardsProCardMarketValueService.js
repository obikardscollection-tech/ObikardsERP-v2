const { getSportsCardsProCardDetails } = require("./sportsCardsProCardDetailsService");

const GRADES = {
  RAW: "RAW",
  PSA_8: "PSA 8",
  PSA_9: "PSA 9",
  PSA_10: "PSA 10",
  BGS_95: "BGS 9.5",
  BGS_10: "BGS 10",
  SGC_10: "SGC 10",
  CGC_10: "CGC 10",
};

const PRICE_KEYS = {
  RAW: "loose-price",
  GRADED: "graded-price",
  BGS_10: "bgs-10-price",
  PSA_10: "condition-18-price",
  PSA_9: "condition-17-price",
  NEW: "new-price",
  MANUAL_ONLY: "manual-only-price",
};

const GRADE_TO_PRICE_KEY = {
  [GRADES.RAW]: PRICE_KEYS.RAW,
  [GRADES.PSA_8]: PRICE_KEYS.GRADED,
  [GRADES.PSA_9]: PRICE_KEYS.PSA_9,
  [GRADES.PSA_10]: PRICE_KEYS.PSA_10,
  [GRADES.BGS_95]: PRICE_KEYS.GRADED,
  [GRADES.BGS_10]: PRICE_KEYS.BGS_10,
  [GRADES.SGC_10]: PRICE_KEYS.GRADED,
  [GRADES.CGC_10]: PRICE_KEYS.GRADED,
};

const SUPPORTED_GRADES = {
  [GRADES.RAW]: true,
  [GRADES.PSA_8]: true,
  [GRADES.PSA_9]: true,
  [GRADES.PSA_10]: true,
  [GRADES.BGS_95]: true,
  [GRADES.BGS_10]: true,
  [GRADES.SGC_10]: true,
  [GRADES.CGC_10]: true,
};

const INTERNALS = {
  VALUES: {
    SOURCE: "SportsCardsPro",
    CURRENCY: "USD",
  },
  GRADES,
  SUPPORTED_GRADES,
  PRICE_KEYS,
  GRADE_TO_PRICE_KEY,
};

/**
 * Ensure input payload is a plain object.
 * @param {unknown} card
 */
function assertCard(card) {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw new Error("Les parametres de valeur de marche SportsCardsPro sont invalides.");
  }
}

/**
 * Ensure SportsCardsPro identifier is present.
 * @param {unknown} sportsCardsProId
 */
function assertSportsCardsProId(sportsCardsProId) {
  if (typeof sportsCardsProId !== "string" || sportsCardsProId.trim() === "") {
    throw new Error("L'identifiant SportsCardsPro est invalide.");
  }
}

/**
 * Ensure grade is present.
 * @param {unknown} grade
 */
function normalizeGrade(grade) {
  if (typeof grade !== "string" || grade.trim() === "") {
    return GRADES.RAW;
  }

  return grade.trim();
}

function assertGrade(grade) {
  const normalizedGrade = normalizeGrade(grade);

  if (!isSupportedGrade(normalizedGrade)) {
    throw new Error("Le grade SportsCardsPro n'est pas supporte.");
  }
}

/**
 * Check whether a grade is officially supported.
 * @param {string} grade
 * @returns {boolean}
 */
function isSupportedGrade(grade) {
  return Object.prototype.hasOwnProperty.call(INTERNALS.SUPPORTED_GRADES, grade);
}

/**
 * Determine whether a raw price value is available.
 * @param {unknown} value
 * @returns {boolean}
 */
function hasPriceValue(value) {
  return value !== undefined && value !== null && value !== "";
}

/**
 * Resolve primary price key from grade.
 * @param {string} grade
 * @returns {string}
 */
function resolvePrimaryPriceKey(grade) {
  const mappedKey = INTERNALS.GRADE_TO_PRICE_KEY[grade];

  if (mappedKey) {
    return mappedKey;
  }

  return INTERNALS.PRICE_KEYS.GRADED;
}

/**
 * Resolve market price from SportsCardsPro raw payload and requested grade.
 * @param {object} raw
 * @param {string} grade
 * @returns {unknown}
 */
function normalizeSportsCardsProUsdPrice(value) {
  if (!hasPriceValue(value)) {
    return value;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return numericValue / 100;
}

function resolveMarketPrice(raw, grade) {
  const primaryKey = resolvePrimaryPriceKey(grade);
  const primaryPrice = raw[primaryKey];

  if (hasPriceValue(primaryPrice)) {
    return normalizeSportsCardsProUsdPrice(primaryPrice);
  }

  const gradedFallback = raw[INTERNALS.PRICE_KEYS.GRADED];

  if (hasPriceValue(gradedFallback)) {
    return normalizeSportsCardsProUsdPrice(gradedFallback);
  }

  const rawFallback = raw[INTERNALS.PRICE_KEYS.RAW];

  if (hasPriceValue(rawFallback)) {
    return normalizeSportsCardsProUsdPrice(rawFallback);
  }

  const newFallback = raw[INTERNALS.PRICE_KEYS.NEW];

  if (hasPriceValue(newFallback)) {
    return normalizeSportsCardsProUsdPrice(newFallback);
  }

  const manualOnlyFallback = raw[INTERNALS.PRICE_KEYS.MANUAL_ONLY];

  if (hasPriceValue(manualOnlyFallback)) {
    return normalizeSportsCardsProUsdPrice(manualOnlyFallback);
  }

  return null;
}

/**
 * Create normalized market value payload.
 * @param {string} sportsCardsProId
 * @param {string} grade
 * @param {unknown} marketValue
 * @param {object} raw
 * @returns {{source:string, sportsCardsProId:string, grade:string, currency:string, marketValue:unknown, retrievedAt:string, raw:object}}
 */
function createMarketValuePayload(sportsCardsProId, grade, marketValue, raw) {
  return {
    source: INTERNALS.VALUES.SOURCE,
    sportsCardsProId,
    grade,
    currency: INTERNALS.VALUES.CURRENCY,
    marketValue,
    retrievedAt: new Date().toISOString(),
    raw,
  };
}

/**
 * Retrieve and normalize SportsCardsPro card market value.
 * @param {{sportsCardsProId:string, grade:string}} card
 * @returns {Promise<{source:string, sportsCardsProId:string, grade:string, currency:string, marketValue:unknown, retrievedAt:string, raw:object}>}
 */
async function getSportsCardsProCardMarketValue(card) {
  assertCard(card);
  assertSportsCardsProId(card.sportsCardsProId);

  const normalizedGrade = normalizeGrade(card.grade);
  assertGrade(normalizedGrade);

  const raw = await getSportsCardsProCardDetails(card.sportsCardsProId);
  const marketValue = resolveMarketPrice(raw, normalizedGrade);

  return createMarketValuePayload(card.sportsCardsProId, normalizedGrade, marketValue, raw);
}

module.exports = {
  getSportsCardsProCardMarketValue,
};
