/**
 * SportsCardsPro Search Result Mapper
 *
 * This component is the single transformation boundary between
 * SportsCardsPro raw payloads and the internal ERP normalized model.
 *
 * All business services must consume only this normalized model.
 * No business service should read SportsCardsPro raw keys directly.
 */
const INTERNALS = {
  FIELDS: {
    ID: "id",
    PRODUCT_ID: "product-id",
    PRODUCT_NAME: "product-name",
    CONSOLE_NAME: "console-name",
    RELEASE_DATE: "release-date",
    SALES_VOLUME: "sales-volume",
  },
  PRICE_FIELDS: {
    RAW_PRICE: "loose-price",
    GRADED_PRICE: "graded-price",
    BGS10_PRICE: "bgs-10-price",
    // Technical field names currently exposed by SportsCardsPro.
    // They are kept as-is until their exact business meaning is finalized.
    CONDITION_17_PRICE: "condition-17-price",
    // Technical field names currently exposed by SportsCardsPro.
    // They are kept as-is until their exact business meaning is finalized.
    CONDITION_18_PRICE: "condition-18-price",
  },
  RETAIL_FIELDS: {
    NEW_BUY: ["retail-new-buy", "retail-new-buy-price"],
    NEW_SELL: ["retail-new-sell", "retail-new-sell-price"],
    LOOSE_BUY: ["retail-loose-buy", "retail-loose-buy-price"],
    LOOSE_SELL: ["retail-loose-sell", "retail-loose-sell-price"],
    CIB_BUY: ["retail-cib-buy", "retail-cib-buy-price"],
    CIB_SELL: ["retail-cib-sell", "retail-cib-sell-price"],
  },
};

/**
 * Ensure SportsCardsPro search result is a plain object.
 * @param {unknown} searchResult
 */
function assertSearchResult(searchResult) {
  if (!searchResult || typeof searchResult !== "object" || Array.isArray(searchResult)) {
    throw new Error("Le resultat de recherche SportsCardsPro est invalide.");
  }
}

/**
 * @typedef {Object} SportsCardsProSearchResultModel
 *
 * @property {string|null} sportsCardsProId
 * @property {string|null} productName
 * @property {string|null} consoleName
 * @property {string|null} releaseDate
 *
 * @property {{
 *   raw: string|number|null,
 *   graded: string|number|null,
 *   bgs10: string|number|null,
 *   condition17: string|number|null,
 *   condition18: string|number|null
 * }} prices
 *
 * @property {{
 *   newBuy: string|number|null,
 *   newSell: string|number|null,
 *   looseBuy: string|number|null,
 *   looseSell: string|number|null,
 *   cibBuy: string|number|null,
 *   cibSell: string|number|null
 * }} retail
 *
 * @property {string|null} salesVolume
 *
 * @property {object} raw
 */

/**
 * Resolve value using key priority order.
 * @param {object} source
 * @param {string[]} keys
 * @returns {string|number|null}
 */
function resolveFirstValue(source, keys) {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }

  return null;
}

/**
 * Resolve SportsCardsPro identifier from search result.
 * @param {object} searchResult
 * @returns {string|null}
 */
function resolveSportsCardsProId(searchResult) {
  return resolveFirstValue(searchResult, [INTERNALS.FIELDS.ID, INTERNALS.FIELDS.PRODUCT_ID]);
}

/**
 * Map price fields from SportsCardsPro raw result.
 * @param {object} searchResult
 * @returns {{raw: string|number|null, graded: string|number|null, bgs10: string|number|null, condition17: string|number|null, condition18: string|number|null}}
 */
function mapPrices(searchResult) {
  return {
    raw: searchResult[INTERNALS.PRICE_FIELDS.RAW_PRICE] ?? null,
    graded: searchResult[INTERNALS.PRICE_FIELDS.GRADED_PRICE] ?? null,
    bgs10: searchResult[INTERNALS.PRICE_FIELDS.BGS10_PRICE] ?? null,
    condition17: searchResult[INTERNALS.PRICE_FIELDS.CONDITION_17_PRICE] ?? null,
    condition18: searchResult[INTERNALS.PRICE_FIELDS.CONDITION_18_PRICE] ?? null,
  };
}

/**
 * Map retail fields from SportsCardsPro raw result.
 * @param {object} searchResult
 * @returns {{newBuy: string|number|null, newSell: string|number|null, looseBuy: string|number|null, looseSell: string|number|null, cibBuy: string|number|null, cibSell: string|number|null}}
 */
function mapRetail(searchResult) {
  return {
    newBuy: resolveFirstValue(searchResult, INTERNALS.RETAIL_FIELDS.NEW_BUY),
    newSell: resolveFirstValue(searchResult, INTERNALS.RETAIL_FIELDS.NEW_SELL),
    looseBuy: resolveFirstValue(searchResult, INTERNALS.RETAIL_FIELDS.LOOSE_BUY),
    looseSell: resolveFirstValue(searchResult, INTERNALS.RETAIL_FIELDS.LOOSE_SELL),
    cibBuy: resolveFirstValue(searchResult, INTERNALS.RETAIL_FIELDS.CIB_BUY),
    cibSell: resolveFirstValue(searchResult, INTERNALS.RETAIL_FIELDS.CIB_SELL),
  };
}

/**
 * Map one SportsCardsPro /api/products raw entry to the internal stable ERP model.
 * @param {object} searchResult
 * @returns {SportsCardsProSearchResultModel}
 */
function mapSportsCardsProSearchResult(searchResult) {
  assertSearchResult(searchResult);

  return {
    sportsCardsProId: resolveSportsCardsProId(searchResult),
    productName: searchResult[INTERNALS.FIELDS.PRODUCT_NAME] ?? null,
    consoleName: searchResult[INTERNALS.FIELDS.CONSOLE_NAME] ?? null,
    releaseDate: searchResult[INTERNALS.FIELDS.RELEASE_DATE] ?? null,
    prices: mapPrices(searchResult),
    retail: mapRetail(searchResult),
    // SportsCardsPro currently exposes sales-volume as a string.
    // Keep it unchanged; numeric conversion belongs to downstream business services.
    salesVolume: searchResult[INTERNALS.FIELDS.SALES_VOLUME] ?? null,
    raw: searchResult,
  };
}

module.exports = {
  mapSportsCardsProSearchResult,
};
