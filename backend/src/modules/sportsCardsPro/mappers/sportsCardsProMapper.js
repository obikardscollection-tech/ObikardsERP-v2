const INTERNALS = {
  SOURCE: "SPORTSCARDSPRO",
  ROOT_ARRAY_KEYS: ["results", "items", "data"],
  FIELDS: {
    ID: "id",
    PRODUCT_ID: "product-id",
    PRODUCT_NAME: "product-name",
    CONSOLE_NAME: "console-name",
    RELEASE_DATE: "release-date",
    SALES_VOLUME: "sales-volume",
  },
  PRICE_FIELDS: {
    RAW: "loose-price",
    GRADED: "graded-price",
    BGS_10: "bgs-10-price",
    CONDITION_17: "condition-17-price",
    CONDITION_18: "condition-18-price",
    NEW: "new-price",
    MANUAL_ONLY: "manual-only-price",
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

function assertRawResponse(rawResponse) {
  if (rawResponse === undefined) {
    throw new Error("La reponse brute SportsCardsPro est requise.");
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toNullableString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized === "" ? null : normalized;
}

function resolveFirstDefined(source, keys) {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }

  return null;
}

function resolveEntries(rawResponse) {
  if (Array.isArray(rawResponse)) {
    return rawResponse;
  }

  if (!isPlainObject(rawResponse)) {
    return [];
  }

  for (const key of INTERNALS.ROOT_ARRAY_KEYS) {
    if (Array.isArray(rawResponse[key])) {
      return rawResponse[key];
    }
  }

  return [rawResponse];
}

function mapPrices(entry) {
  return {
    raw: entry[INTERNALS.PRICE_FIELDS.RAW] ?? null,
    graded: entry[INTERNALS.PRICE_FIELDS.GRADED] ?? null,
    bgs10: entry[INTERNALS.PRICE_FIELDS.BGS_10] ?? null,
    condition17: entry[INTERNALS.PRICE_FIELDS.CONDITION_17] ?? null,
    condition18: entry[INTERNALS.PRICE_FIELDS.CONDITION_18] ?? null,
    modernUnsealed: entry[INTERNALS.PRICE_FIELDS.NEW] ?? null,
    manualOnly: entry[INTERNALS.PRICE_FIELDS.MANUAL_ONLY] ?? null,
  };
}

function mapRetail(entry) {
  return {
    newBuy: resolveFirstDefined(entry, INTERNALS.RETAIL_FIELDS.NEW_BUY),
    newSell: resolveFirstDefined(entry, INTERNALS.RETAIL_FIELDS.NEW_SELL),
    looseBuy: resolveFirstDefined(entry, INTERNALS.RETAIL_FIELDS.LOOSE_BUY),
    looseSell: resolveFirstDefined(entry, INTERNALS.RETAIL_FIELDS.LOOSE_SELL),
    cibBuy: resolveFirstDefined(entry, INTERNALS.RETAIL_FIELDS.CIB_BUY),
    cibSell: resolveFirstDefined(entry, INTERNALS.RETAIL_FIELDS.CIB_SELL),
  };
}

function mapEntry(entry) {
  if (!isPlainObject(entry)) {
    return {
      externalId: null,
      productName: null,
      consoleName: null,
      releaseDate: null,
      salesVolume: null,
      prices: {
        raw: null,
        graded: null,
        bgs10: null,
        condition17: null,
        condition18: null,
        modernUnsealed: null,
        manualOnly: null,
      },
      retail: {
        newBuy: null,
        newSell: null,
        looseBuy: null,
        looseSell: null,
        cibBuy: null,
        cibSell: null,
      },
      raw: entry,
    };
  }

  return {
    externalId: toNullableString(
      resolveFirstDefined(entry, [INTERNALS.FIELDS.ID, INTERNALS.FIELDS.PRODUCT_ID])
    ),
    productName: toNullableString(entry[INTERNALS.FIELDS.PRODUCT_NAME]),
    consoleName: toNullableString(entry[INTERNALS.FIELDS.CONSOLE_NAME]),
    releaseDate: toNullableString(entry[INTERNALS.FIELDS.RELEASE_DATE]),
    salesVolume: entry[INTERNALS.FIELDS.SALES_VOLUME] ?? null,
    prices: mapPrices(entry),
    retail: mapRetail(entry),
    raw: entry,
  };
}

/**
 * Map one SportsCardsPro raw payload to a neutral internal model.
 * @param {unknown} rawResponse
 * @returns {{source:string, total:number, entries:object[], raw:unknown}}
 */
function mapSportsCardsProResponse(rawResponse) {
  assertRawResponse(rawResponse);

  const entries = resolveEntries(rawResponse).map(mapEntry);

  return {
    source: INTERNALS.SOURCE,
    total: entries.length,
    entries,
    raw: rawResponse,
  };
}

module.exports = {
  mapSportsCardsProResponse,
};
