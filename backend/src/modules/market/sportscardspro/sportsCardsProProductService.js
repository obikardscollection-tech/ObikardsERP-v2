const { requestSportsCardsPro } = require("./sportsCardsProApiClient");

const INTERNALS = {
  ENDPOINTS: {
    PRODUCT: "/api/product",
  },
  QUERY: {
    ID: "id",
  },
};

/**
 * Ensure product identifier is present and non-empty.
 * @param {unknown} productId
 */
function assertProductId(productId) {
  if (typeof productId !== "string" || productId.trim() === "") {
    throw new Error("L'identifiant produit SportsCardsPro est invalide.");
  }
}

/**
 * Create request parameters for SportsCardsPro product retrieval.
 * @param {string} productId
 * @returns {{query: {id: string}}}
 */
function createProductParameters(productId) {
  return {
    query: {
      id: productId,
    },
  };
}

/**
 * Retrieve a SportsCardsPro product and return raw API JSON.
 * @param {string} productId
 * @returns {Promise<unknown>}
 */
async function getSportsCardsProProduct(productId) {
  assertProductId(productId);

  const parameters = createProductParameters(productId);

  return requestSportsCardsPro(INTERNALS.ENDPOINTS.PRODUCT, parameters);
}

module.exports = {
  getSportsCardsProProduct,
};
