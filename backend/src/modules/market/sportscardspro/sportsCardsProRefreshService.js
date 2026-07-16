const { findSportsCardsProMatches } = require("./sportsCardsProCardLinkService");
const { mapSportsCardsProSearchResult } = require("./sportsCardsProSearchResultMapper");
const { getSportsCardsProCardMarketValue } = require("./sportsCardsProCardMarketValueService");
const { resolveFirstSportsCardsProSearchEntry } = require("./sportsCardsProSearchResultResolver");
const { convertUsdToEur } = require("./currencyConversionService");
const { calculateFinancialMetrics } = require("./financialMetricsService");

/**
 * @typedef {Object} RefreshCardInput
 * @property {unknown} player
 * @property {unknown} year
 * @property {unknown} set
 * @property {unknown} cardNumber
 * @property {unknown} parallel
 * @property {unknown} variation
 * @property {unknown} grade
 * @property {unknown} purchasePrice
 * @property {unknown} fees
 * @property {unknown} exchangeRate
 */

/**
 * @typedef {Object} RefreshMarketValueModel
 * @property {string} source
 * @property {string} currency
 * @property {unknown} value
 */

/**
 * @typedef {Object} RefreshConversionModel
 * @property {string|null} sourceCurrency
 * @property {string|null} targetCurrency
 * @property {number|null} exchangeRate
 * @property {number|null} convertedAmount
 */

/**
 * @typedef {Object} RefreshFinancialModel
 * @property {number|null} purchasePrice
 * @property {number|null} fees
 * @property {number|null} profit
 * @property {number|null} margin
 * @property {number|null} roi
 */

/**
 * @typedef {Object} SportsCardsProRefreshResultModel
 * @property {string|null} sportsCardsProId
 * @property {RefreshMarketValueModel} marketValue
 * @property {RefreshConversionModel} conversion
 * @property {RefreshFinancialModel} financial
 * @property {object} raw
 */

/**
 * Ensure refresh input is a plain object.
 * @param {unknown} card
 */
function assertCard(card) {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw new Error("La carte ERP de refresh est invalide.");
  }
}

/**
 * Build card payload for the CardLink service.
 * @param {RefreshCardInput} card
 * @returns {{player?:unknown, year?:unknown, set?:unknown, cardNumber?:unknown, parallel?:unknown, variation?:unknown, grade?:unknown}}
 */
function createCardLinkPayload(card) {
  return {
    player: card.player,
    year: card.year,
    set: card.set,
    cardNumber: card.cardNumber,
    parallel: card.parallel,
    variation: card.variation,
    grade: card.grade,
  };
}

/**
 * Build market value input payload.
 * @param {string} sportsCardsProId
 * @param {unknown} grade
 * @returns {{sportsCardsProId:string, grade:unknown}}
 */
function createMarketValueInput(sportsCardsProId, grade) {
  return {
    sportsCardsProId,
    grade,
  };
}

/**
 * Build financial metrics input payload.
 * @param {RefreshCardInput} card
 * @param {number|null} convertedAmount
 * @returns {{purchasePrice:unknown, marketValue:number|null, fees:unknown}}
 */
function createFinancialInput(card, convertedAmount) {
  return {
    purchasePrice: card.purchasePrice,
    marketValue: convertedAmount,
    fees: card.fees,
  };
}

/**
 * Build final refresh payload.
 * @param {string|null} sportsCardsProId
 * @param {{source:string, currency:string, marketValue:unknown, raw:object}} marketValuePayload
 * @param {{sourceCurrency:string|null, targetCurrency:string|null, exchangeRate:number|null, convertedAmount:number|null}} conversion
 * @param {{purchasePrice:number|null, fees:number|null, profit:number|null, margin:number|null, roi:number|null}} financial
 * @returns {SportsCardsProRefreshResultModel}
 */
function createRefreshPayload(sportsCardsProId, marketValuePayload, conversion, financial) {
  return {
    sportsCardsProId,
    marketValue: {
      source: marketValuePayload.source,
      currency: marketValuePayload.currency,
      value: marketValuePayload.marketValue,
    },
    conversion: {
      sourceCurrency: conversion.sourceCurrency,
      targetCurrency: conversion.targetCurrency,
      exchangeRate: conversion.exchangeRate,
      convertedAmount: conversion.convertedAmount,
    },
    financial: {
      purchasePrice: financial.purchasePrice,
      fees: financial.fees,
      profit: financial.profit,
      margin: financial.margin,
      roi: financial.roi,
    },
    raw: marketValuePayload.raw,
  };
}

/**
 * Refresh one ERP card market snapshot through the full SportsCardsPro orchestration flow.
 * This service only orchestrates dedicated components and contains no business computation.
 * @param {RefreshCardInput} card
 * @returns {Promise<SportsCardsProRefreshResultModel>}
 */
async function refreshSportsCardsProCard(card) {
  assertCard(card);

  const searchResponse = await findSportsCardsProMatches(createCardLinkPayload(card));
  const firstSearchEntry = resolveFirstSportsCardsProSearchEntry(searchResponse);
  const mappedSearchResult = mapSportsCardsProSearchResult(firstSearchEntry);

  const marketValuePayload = await getSportsCardsProCardMarketValue(
    createMarketValueInput(mappedSearchResult.sportsCardsProId, card.grade)
  );

  const conversion = convertUsdToEur(marketValuePayload.marketValue, card.exchangeRate);
  const financial = calculateFinancialMetrics(createFinancialInput(card, conversion.convertedAmount));

  return createRefreshPayload(mappedSearchResult.sportsCardsProId, marketValuePayload, conversion, financial);
}

module.exports = {
  refreshSportsCardsProCard,
};
