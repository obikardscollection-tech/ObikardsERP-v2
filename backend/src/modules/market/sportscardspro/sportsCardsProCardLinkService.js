const { searchSportsCardsPro } = require("./sportsCardsProSearchService");
const { buildConnectorSearchQuery } = require("../../reference/services/referenceSearchQueryService");

const KEYS = {
  SPORT: "sport",
  PLAYER: "player",
  YEAR: "year",
  BRAND: "brand",
  SET: "set",
  SUBSET: "subset",
  CARD_NUMBER: "cardNumber",
  PARALLEL: "parallel",
  VARIATION: "variation",
  GRADE: "grade",
};

const INTERNALS = {
  KEYS,
  SEARCH_ORDER: [
    KEYS.PLAYER,
    KEYS.YEAR,
    KEYS.SPORT,
    KEYS.BRAND,
    KEYS.SET,
    KEYS.SUBSET,
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
 * Build SportsCardsPro search query from ERP card fields.
 * @param {object} card
 * @returns {string}
 */
function createSearchQuery(card) {
  return buildConnectorSearchQuery(card, {
    order: INTERNALS.SEARCH_ORDER,
    numberField: INTERNALS.KEYS.CARD_NUMBER,
    numberKeys: [INTERNALS.KEYS.CARD_NUMBER],
    numberPrefix: "#",
    strict: false,
  });
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
