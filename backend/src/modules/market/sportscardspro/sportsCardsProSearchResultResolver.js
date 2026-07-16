const INTERNALS = {
  SEARCH_RESPONSE_KEYS: {
    RESULTS: "results",
    PRODUCTS: "products",
    DATA: "data",
  },
};

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
  resolveFirstSportsCardsProSearchEntry,
};
