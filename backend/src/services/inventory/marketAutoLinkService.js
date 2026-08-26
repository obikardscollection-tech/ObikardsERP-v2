const { findSportsCardsProMatches } = require("../../modules/market/sportscardspro/sportsCardsProCardLinkService");
const { mapSportsCardsProSearchResult } = require("../../modules/market/sportscardspro/sportsCardsProSearchResultMapper");
const { refreshSportsCardsProCard } = require("../../modules/market/sportscardspro/sportsCardsProRefreshService");
const { resolveSportsCardsProSearchEntries } = require("../../modules/market/sportscardspro/sportsCardsProSearchMatchesResolver");
const { evaluateSearchEntry } = require("../../modules/market/sportscardspro/sportsCardsProSearchResultResolver");

const INTERNALS = {
  STATUSES: {
    NOT_FOUND: "NOT_FOUND",
    LINKED: "LINKED",
    MULTIPLE_MATCHES: "MULTIPLE_MATCHES",
  },
};

/**
 * Create integration result payload.
 * @param {object} patch
 * @param {object|null} refreshResult
 * @returns {{patch:object, refreshResult:object|null}}
 */
function createIntegrationResult(patch, refreshResult) {
  return {
    patch,
    refreshResult,
  };
}

/**
 * @typedef {Object} InventoryMarketInput
 * @property {unknown} player
 * @property {unknown} year
 * @property {unknown} set
 * @property {unknown} series
 * @property {unknown} subset
 * @property {unknown} cardNumber
 * @property {unknown} parallel
 * @property {unknown} variation
 * @property {unknown} grade
 * @property {unknown} purchasePrice
 * @property {unknown} fees
 * @property {unknown} exchangeRate
 */

/**
 * Ensure inventory market input is a plain object.
 * @param {unknown} card
 */
function assertCard(card) {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw new Error("Les donnees inventory pour le lien marche sont invalides.");
  }
}

/**
 * Normalize nullable numeric value.
 * @param {unknown} value
 * @returns {number|null}
 */
function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const numeric = Number(value);

    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
}

/**
 * Resolve card set value from inventory payload.
 * @param {InventoryMarketInput} card
 * @returns {unknown}
 */
function resolveCardSet(card) {
  return card.set || card.series;
}

/**
 * Create refresh timestamp for linked market snapshots.
 * @returns {Date}
 */
function createRefreshTimestamp() {
  return new Date();
}

/**
 * Create base inventory market patch.
 * @returns {object}
 */
function createBaseMarketPatch() {
  return {
    sportsCardsProId: null,
    marketLinkStatus: INTERNALS.STATUSES.NOT_FOUND,
    marketMatches: null,
    marketLastRefreshAt: null,
    marketValueUsd: null,
    marketValueEur: null,
    marketSource: null,
    marketCurrency: null,
    profit: null,
    margin: null,
    roi: null,
  };
}

/**
 * Create CardLink payload from inventory data.
 * @param {InventoryMarketInput} card
 * @returns {{player?:unknown, year?:unknown, set?:unknown, cardNumber?:unknown, parallel?:unknown, variation?:unknown, grade?:unknown}}
 */
function createCardLinkPayload(card) {
  return {
    sport: card.sport,
    player: card.player,
    year: card.year,
    brand: card.brand,
    set: resolveCardSet(card),
    subset: card.subset,
    cardNumber: card.cardNumber,
    parallel: card.parallel,
    variation: card.variation,
    grade: card.grade,
  };
}

/**
 * Create refresh payload from inventory data.
 * @param {InventoryMarketInput} card
 * @returns {{player?:unknown, year?:unknown, set?:unknown, cardNumber?:unknown, parallel?:unknown, variation?:unknown, grade?:unknown, purchasePrice?:unknown, fees?:unknown, exchangeRate?:unknown}}
 */
function createRefreshPayload(card) {
  return {
    sport: card.sport,
    player: card.player,
    year: card.year,
    brand: card.brand,
    set: resolveCardSet(card),
    subset: card.subset,
    cardNumber: card.cardNumber,
    parallel: card.parallel,
    variation: card.variation,
    grade: card.grade,
    purchasePrice: card.purchasePrice,
    fees: card.fees,
    exchangeRate: card.exchangeRate,
  };
}

/**
 * Check whether payload contains enough non-empty values to attempt market search.
 * @param {{player?:unknown, year?:unknown, set?:unknown, cardNumber?:unknown, parallel?:unknown, variation?:unknown, grade?:unknown}} payload
 * @returns {boolean}
 */
function canSearchMarket(payload) {
  const values = [
    payload.player,
    payload.year,
    payload.set,
    payload.subset,
    payload.cardNumber,
    payload.parallel,
    payload.variation,
    payload.grade,
  ];

  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return true;
    }

    if (typeof value === "string" && value.trim() !== "") {
      return true;
    }
  }

  return false;
}

/**
 * Build inventory patch for NOT_FOUND status.
 * @returns {object}
 */
function createNotFoundPatch() {
  return {
    ...createBaseMarketPatch(),
    marketLinkStatus: INTERNALS.STATUSES.NOT_FOUND,
  };
}

/**
 * Build inventory patch for MULTIPLE_MATCHES status.
 * @param {object[]} mappedMatches
 * @returns {object}
 */
function createMultipleMatchesPatch(mappedMatches) {
  return {
    ...createBaseMarketPatch(),
    marketLinkStatus: INTERNALS.STATUSES.MULTIPLE_MATCHES,
    marketMatches: mappedMatches,
  };
}

/**
 * Build inventory patch for LINKED status from refresh result.
 * @param {object} refresh
 * @returns {object}
 */
function createLinkedPatch(refresh) {
  return {
    ...createBaseMarketPatch(),
    sportsCardsProId: refresh.sportsCardsProId,
    marketLinkStatus: INTERNALS.STATUSES.LINKED,
    marketLastRefreshAt: createRefreshTimestamp(),
    marketValueUsd: toNullableNumber(refresh.marketValue && refresh.marketValue.value),
    marketValueEur: toNullableNumber(refresh.conversion && refresh.conversion.convertedAmount),
    marketSource: refresh.marketValue && refresh.marketValue.source ? refresh.marketValue.source : null,
    marketCurrency: refresh.marketValue && refresh.marketValue.currency ? refresh.marketValue.currency : null,
    profit: toNullableNumber(refresh.financial && refresh.financial.profit),
    margin: toNullableNumber(refresh.financial && refresh.financial.margin),
    roi: toNullableNumber(refresh.financial && refresh.financial.roi),
  };
}

/**
 * Resolve automatic market link and refresh patch for one inventory card.
 * @param {InventoryMarketInput} card
 * @returns {Promise<object>}
 */
async function resolveInventoryMarketPatch(card) {
  const integration = await resolveInventoryMarketIntegration(card);

  return integration.patch;
}

/**
 * Resolve automatic market integration outcome for one inventory card.
 * @param {InventoryMarketInput} card
 * @returns {Promise<{patch:object, refreshResult:object|null}>}
 */
async function resolveInventoryMarketIntegration(card) {
  assertCard(card);

  if (card.sportsCardsProId && typeof card.sportsCardsProId === "string" && card.sportsCardsProId.trim() !== "") {
    const refreshCard = {
      ...createRefreshPayload(card),
      sportsCardsProId: card.sportsCardsProId,
    };

    const refresh = await refreshSportsCardsProCard(refreshCard);

    return createIntegrationResult(createLinkedPatch(refresh), refresh);
  }

  const cardLinkPayload = createCardLinkPayload(card);

  if (!canSearchMarket(cardLinkPayload)) {
    return createIntegrationResult(createNotFoundPatch(), null);
  }

  const searchResponse = await findSportsCardsProMatches(cardLinkPayload);
  const searchEntries = resolveSportsCardsProSearchEntries(searchResponse);

  if (searchEntries.length === 0) {
    return createIntegrationResult(createNotFoundPatch(), null);
  }

  const rankedEntries = searchEntries
    .map((entry) => ({
      entry,
      score: evaluateSearchEntry(entry, card).score,
    }))
    .sort((left, right) => right.score - left.score);

  const bestScore = rankedEntries[0]?.score ?? 0;
  const relevantEntries = rankedEntries.filter(({ score }) => score >= Math.max(90, bestScore - 35));

  if (relevantEntries.length === 0) {
    return createIntegrationResult(createNotFoundPatch(), null);
  }

  const mappedMatches = relevantEntries.map(({ entry }) => mapSportsCardsProSearchResult(entry));

  if (relevantEntries.length === 1) {
    const singleEntry = relevantEntries[0].entry;
    const refresh = await refreshSportsCardsProCard({
      ...createRefreshPayload(card),
      sportsCardsProId: mapSportsCardsProSearchResult(singleEntry).sportsCardsProId,
    });

    return createIntegrationResult(createLinkedPatch(refresh), refresh);
  }

  return createIntegrationResult(createMultipleMatchesPatch(mappedMatches), null);
}

module.exports = {
  resolveInventoryMarketIntegration,
  resolveInventoryMarketPatch,
};
