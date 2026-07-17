const INTERNALS = {
  PROVIDERS: {
    SPORTSCARDSPRO: "SPORTSCARDSPRO",
  },
  CURRENCIES: {
    USD: "USD",
    EUR: "EUR",
  },
};

/**
 * Normalize optional numeric value.
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
 * Resolve MarketProvider enum value from normalized refresh payload.
 * @param {object} refreshResult
 * @returns {string}
 */
function resolveProvider(refreshResult) {
  // Single provider currently supported. Extend this resolver when new providers are added.
  return INTERNALS.PROVIDERS.SPORTSCARDSPRO;
}

/**
 * Resolve CurrencyCode enum value from normalized refresh payload.
 * @param {object} refreshResult
 * @returns {string}
 */
function resolveCurrency(refreshResult) {
  const currency = refreshResult && refreshResult.marketValue
    ? refreshResult.marketValue.currency
    : null;

  if (currency === INTERNALS.CURRENCIES.EUR) {
    return INTERNALS.CURRENCIES.EUR;
  }

  if (currency === INTERNALS.CURRENCIES.USD) {
    return INTERNALS.CURRENCIES.USD;
  }

  throw new Error("Devise de snapshot non supportee.");
}

/**
 * Map normalized refresh result to InventoryMarketSnapshot Prisma create payload.
 * @param {string} inventoryId
 * @param {object} refreshResult
 * @returns {object}
 */
function mapMarketSnapshotToCreateInput(inventoryId, refreshResult) {
  return {
    inventoryId,
    provider: resolveProvider(refreshResult),
    providerCardId: refreshResult.sportsCardsProId || null,
    currency: resolveCurrency(refreshResult),
    valueUsd: toNullableNumber(refreshResult.marketValue.value),
    valueEur: toNullableNumber(refreshResult.conversion && refreshResult.conversion.convertedAmount),
    exchangeRate: toNullableNumber(refreshResult.conversion && refreshResult.conversion.exchangeRate),
    profit: toNullableNumber(refreshResult.financial && refreshResult.financial.profit),
    margin: toNullableNumber(refreshResult.financial && refreshResult.financial.margin),
    roi: toNullableNumber(refreshResult.financial && refreshResult.financial.roi),
  };
}

module.exports = {
  mapMarketSnapshotToCreateInput,
};
