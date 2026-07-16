const { searchSportsCardsPro } = require("./sportsCardsProSearchService");
const { getSportsCardsProProduct } = require("./sportsCardsProProductService");

const INTERNALS = {
  KEYS: {
    ID: "id",
    PRODUCT_ID: "product-id",
    PRODUCT_NAME: "product-name",
    CONSOLE_NAME: "console-name",
  },
  REPORT: {
    SEARCH_JSON_TITLE: "========== SEARCH JSON ==========" ,
    PRODUCT_TITLE: "========== PRODUCT ==========",
    MARKET_TITLE: "========== MARKET FIELDS ==========",
    PRODUCT_JSON_TITLE: "========== PRODUCT JSON ==========" ,
  },
  MARKET_KEYWORDS: ["price", "retail", "sales", "volume"],
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
 * Return the first search result entry from SportsCardsPro raw response.
 * @param {unknown} searchResponse
 * @returns {object}
 */
function getFirstSearchResult(searchResponse) {
  if (Array.isArray(searchResponse) && searchResponse.length > 0) {
    return searchResponse[0];
  }

  if (!searchResponse || typeof searchResponse !== "object") {
    throw new Error("La recherche SportsCardsPro ne contient aucun resultat exploitable.");
  }

  if (Array.isArray(searchResponse.results) && searchResponse.results.length > 0) {
    return searchResponse.results[0];
  }

  if (Array.isArray(searchResponse.products) && searchResponse.products.length > 0) {
    return searchResponse.products[0];
  }

  if (Array.isArray(searchResponse.data) && searchResponse.data.length > 0) {
    return searchResponse.data[0];
  }

  throw new Error("La recherche SportsCardsPro ne retourne aucun resultat.");
}

/**
 * Resolve a product identifier from a SportsCardsPro search entry.
 * @param {object} entry
 * @returns {string}
 */
function getProductId(entry) {
  const id = entry[INTERNALS.KEYS.ID] || entry[INTERNALS.KEYS.PRODUCT_ID];

  if (typeof id === "string" && id.trim() !== "") {
    return id;
  }

  if (typeof id === "number" && Number.isFinite(id)) {
    return String(id);
  }

  throw new Error("Impossible de recuperer un identifiant produit SportsCardsPro depuis la recherche.");
}

/**
 * Print market-related fields from a SportsCardsPro product detail response.
 * @param {object} productDetails
 */
function printMarketFields(productDetails) {
  const keys = Object.keys(productDetails);

  for (const key of keys) {
    const normalizedKey = key.toLowerCase();
    let isMarketField = false;

    for (const keyword of INTERNALS.MARKET_KEYWORDS) {
      if (normalizedKey.includes(keyword)) {
        isMarketField = true;
        break;
      }
    }

    if (isMarketField) {
      console.log(`${key} :`, productDetails[key]);
    }
  }
}

/**
 * Print the complete validation report.
 * @param {unknown} searchResponse
 * @param {string} productId
 * @param {object} productDetails
 */
function printValidationReport(searchResponse, productId, productDetails) {
  const productName = productDetails[INTERNALS.KEYS.PRODUCT_NAME];
  const consoleName = productDetails[INTERNALS.KEYS.CONSOLE_NAME];

  console.log(INTERNALS.REPORT.SEARCH_JSON_TITLE);
  console.log(searchResponse);
  console.log("");
  console.log(INTERNALS.REPORT.PRODUCT_TITLE);
  console.log("Product ID:", productId);
  console.log("Product Name:", productName);
  console.log("Console Name:", consoleName);
  console.log("");
  console.log(INTERNALS.REPORT.MARKET_TITLE);
  printMarketFields(productDetails);
  console.log("");
  console.log(INTERNALS.REPORT.PRODUCT_JSON_TITLE);
  console.log(productDetails);
}

/**
 * Validate real SportsCardsPro API behavior with a search + product detail flow.
 * @param {string} searchQuery
 * @returns {Promise<{searchResponse: unknown, productId: string, productDetails: unknown}>}
 */
async function validateSportsCardsProApi(searchQuery) {
  assertSearchQuery(searchQuery);

  const searchResponse = await searchSportsCardsPro(searchQuery);
  const firstEntry = getFirstSearchResult(searchResponse);
  const productId = getProductId(firstEntry);
  const productDetails = await getSportsCardsProProduct(productId);

  if (!productDetails || typeof productDetails !== "object" || Array.isArray(productDetails)) {
    throw new Error("Le detail produit SportsCardsPro est invalide.");
  }

  printValidationReport(searchResponse, productId, productDetails);

  return {
    searchResponse,
    productId,
    productDetails,
  };
}

module.exports = {
  validateSportsCardsProApi,
};
