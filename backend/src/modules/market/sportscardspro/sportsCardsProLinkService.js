const { searchSportsCardsPro } = require("./sportsCardsProSearchService");

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
 * Link SportsCardsPro from a user search and return raw search JSON.
 * @param {string} searchQuery
 * @returns {Promise<unknown>}
 */
async function linkSportsCardsPro(searchQuery) {
  assertSearchQuery(searchQuery);

  return searchSportsCardsPro(searchQuery);
}

module.exports = {
  linkSportsCardsPro,
};
