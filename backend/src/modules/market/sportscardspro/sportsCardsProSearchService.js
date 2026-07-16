const { requestSportsCardsPro } = require("./sportsCardsProApiClient");

const INTERNALS = {
  ENDPOINTS: {
    PRODUCTS: "/api/products",
  },
  QUERY: {
    SEARCH: "q",
  },
};

/**
 * Ensure search query is present and non-empty.
 * @param {unknown} searchQuery
 */
function assertSearchQuery(searchQuery) {
  if (typeof searchQuery !== "string" || searchQuery.trim() === "") {
    throw new Error("La recherche SportsCardsPro est invalide.");
  }
}

/**
 * Create request parameters for SportsCardsPro product search.
 * @param {string} searchQuery
 * @returns {{query: {q: string}}}
 */
function createSearchParameters(searchQuery) {
  return {
    query: {
      q: searchQuery,
    },
  };
}

/**
 * Search SportsCardsPro products and return raw API JSON.
 * @param {string} searchQuery
 * @returns {Promise<unknown>}
 */
async function searchSportsCardsPro(searchQuery) {
  assertSearchQuery(searchQuery);

  const parameters = createSearchParameters(searchQuery);

  return requestSportsCardsPro(INTERNALS.ENDPOINTS.PRODUCTS, parameters);
}

module.exports = {
  searchSportsCardsPro,
};
