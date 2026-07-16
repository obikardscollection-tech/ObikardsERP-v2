const { searchSportsCardsPro } = require("./sportsCardsProSearchService");

const KEYS = {
  PLAYER: "player",
  YEAR: "year",
  SET: "set",
  CARD_NUMBER: "cardNumber",
  PARALLEL: "parallel",
  VARIATION: "variation",
  GRADE: "grade",
};

const INTERNALS = {
  KEYS,
  FORMATS: {
    CARD_NUMBER_PREFIX: "#",
  },
  SEARCH_ORDER: [
    KEYS.PLAYER,
    KEYS.YEAR,
    KEYS.SET,
    KEYS.CARD_NUMBER,
    KEYS.PARALLEL,
    KEYS.VARIATION,
    KEYS.GRADE,
  ],
};

/**
 * Ensure ERP card payload is a plain object.
 * @param {unknown} card
 */
function assertCard(card) {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw new Error("La carte ERP est invalide.");
  }
}

/**
 * Return a normalized non-empty string value.
 * @param {unknown} value
 * @returns {string}
 */
function toSearchPart(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  const part = String(value).trim();

  if (part === "") {
    return "";
  }

  return part;
}

/**
 * Build card number search token.
 * @param {unknown} cardNumber
 * @returns {string}
 */
function buildCardNumberPart(cardNumber) {
  const value = toSearchPart(cardNumber);

  if (value === "") {
    return "";
  }

  return `${INTERNALS.FORMATS.CARD_NUMBER_PREFIX}${value}`;
}

/**
 * Build SportsCardsPro search query from ERP card fields.
 * @param {object} card
 * @returns {string}
 */
function createSearchQuery(card) {
  const queryParts = [];

  for (const field of INTERNALS.SEARCH_ORDER) {
    let part = toSearchPart(card[field]);

    if (field === INTERNALS.KEYS.CARD_NUMBER) {
      part = buildCardNumberPart(card[field]);
    }

    if (part !== "") {
      queryParts.push(part);
    }
  }

  return queryParts.join(" ");
}

/**
 * Ensure generated search query is non-empty.
 * @param {string} searchQuery
 */
function assertSearchQuery(searchQuery) {
  if (searchQuery === "") {
    throw new Error("Impossible de construire une recherche SportsCardsPro valide.");
  }
}

/**
 * Find SportsCardsPro matches for an ERP card and return raw search JSON.
 * @param {{player?:unknown, year?:unknown, set?:unknown, cardNumber?:unknown, parallel?:unknown, variation?:unknown, grade?:unknown}} card
 * @returns {Promise<unknown>}
 */
async function findSportsCardsProMatches(card) {
  assertCard(card);

  const searchQuery = createSearchQuery(card);

  assertSearchQuery(searchQuery);

  return searchSportsCardsPro(searchQuery);
}

module.exports = {
  findSportsCardsProMatches,
};
