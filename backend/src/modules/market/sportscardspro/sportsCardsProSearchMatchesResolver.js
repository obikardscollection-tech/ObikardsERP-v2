const INTERNALS = {
  SEARCH_RESPONSE_KEYS: {
    RESULTS: "results",
    PRODUCTS: "products",
    DATA: "data",
  },
};

/**
 * Resolve all search entries from raw SportsCardsPro search payload.
 * @param {unknown} searchResponse
 * @returns {object[]}
 */
function resolveSportsCardsProSearchEntries(searchResponse) {
  if (Array.isArray(searchResponse)) {
    return searchResponse;
  }

  if (!searchResponse || typeof searchResponse !== "object") {
    return [];
  }

  if (Array.isArray(searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.RESULTS])) {
    return searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.RESULTS];
  }

  if (Array.isArray(searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.PRODUCTS])) {
    return searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.PRODUCTS];
  }

  if (Array.isArray(searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.DATA])) {
    return searchResponse[INTERNALS.SEARCH_RESPONSE_KEYS.DATA];
  }

  return [];
}

module.exports = {
  resolveSportsCardsProSearchEntries,
};
