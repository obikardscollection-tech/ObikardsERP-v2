const { KEY_ALIASES, ERROR_CODES } = require("./sportsCardsProConstants");
const {
  SyncError,
  indexRow,
  readAliasedValue,
  toNullableString,
  toNullableInteger,
  toNullableDecimal,
  toNullableDate,
  toBoolean,
  compactSearchParts,
  buildSlug,
  buildFingerprint,
} = require("./sportsCardsProHelpers");

function readMarketValue(indexedRow, key) {
  return toNullableDecimal(readAliasedValue(indexedRow, KEY_ALIASES[key]));
}

function mapRowToSyncPayload(row, synchronizedAt) {
  const indexed = indexRow(row);

  const providerCardId = toNullableString(
    readAliasedValue(indexed, KEY_ALIASES.providerCardId)
  );

  if (!providerCardId) {
    throw new SyncError("providerCardId introuvable.", ERROR_CODES.INVALID_ROW);
  }

  const sport = toNullableString(readAliasedValue(indexed, KEY_ALIASES.sport)) || "UNKNOWN";
  const player = toNullableString(readAliasedValue(indexed, KEY_ALIASES.player)) || "UNKNOWN";
  const brand = toNullableString(readAliasedValue(indexed, KEY_ALIASES.brand)) || "UNKNOWN";
  const set = toNullableString(readAliasedValue(indexed, KEY_ALIASES.set)) || "UNKNOWN";
  const year = toNullableInteger(readAliasedValue(indexed, KEY_ALIASES.year)) || 0;
  const cardNumber = toNullableString(readAliasedValue(indexed, KEY_ALIASES.cardNumber));

  const productName =
    toNullableString(readAliasedValue(indexed, KEY_ALIASES.productName)) ||
    compactSearchParts([year, player, brand, set, cardNumber]).join(" ") ||
    providerCardId;

  const fingerprint = buildFingerprint([
    sport,
    player,
    year,
    brand,
    set,
    cardNumber,
    toNullableString(readAliasedValue(indexed, KEY_ALIASES.parallel)),
    toNullableString(readAliasedValue(indexed, KEY_ALIASES.variation)),
  ]);

  const slug =
    buildSlug([sport, player, year, brand, set, cardNumber]) ||
    `sportscardspro-${providerCardId.toLowerCase()}`;

  const searchText = compactSearchParts([
    sport,
    player,
    year,
    brand,
    set,
    cardNumber,
    productName,
  ]).join(" ");

  return {
    providerCardId,
    providerUrl: toNullableString(readAliasedValue(indexed, KEY_ALIASES.providerUrl)),
    providerChecksum: toNullableString(JSON.stringify(row)),
    marketCard: {
      sport,
      league: toNullableString(readAliasedValue(indexed, KEY_ALIASES.league)),
      player,
      team: toNullableString(readAliasedValue(indexed, KEY_ALIASES.team)),
      brand,
      set,
      subset: toNullableString(readAliasedValue(indexed, KEY_ALIASES.subset)),
      year,
      productName,
      cardNumber,
      parallel: toNullableString(readAliasedValue(indexed, KEY_ALIASES.parallel)),
      variation: toNullableString(readAliasedValue(indexed, KEY_ALIASES.variation)),
      rookie: toBoolean(row.rookie),
      autograph: toBoolean(row.autograph),
      memorabilia: toBoolean(row.memorabilia),
      serialNumbered: toBoolean(row.serialnumbered),
      printRun: toNullableInteger(row.printRun),
      language: toNullableString(readAliasedValue(indexed, KEY_ALIASES.language)) || "EN",
      country: toNullableString(readAliasedValue(indexed, KEY_ALIASES.country)),
      releaseDate: toNullableDate(readAliasedValue(indexed, KEY_ALIASES.year)),
      slug,
      fingerprint,
      searchText,
      active: true,
    },
    snapshot: {
      currency: "USD",
      rawPrice: readMarketValue(indexed, "rawPrice"),
      psa8Price: readMarketValue(indexed, "psa8Price"),
      psa9Price: readMarketValue(indexed, "psa9Price"),
      psa10Price: readMarketValue(indexed, "psa10Price"),
      bgs10Price: readMarketValue(indexed, "bgs10Price"),
      cgc10Price: readMarketValue(indexed, "cgc10Price"),
      sgc10Price: readMarketValue(indexed, "sgc10Price"),
      retailBuy: readMarketValue(indexed, "retailBuy"),
      retailSell: readMarketValue(indexed, "retailSell"),
      salesVolume: toNullableInteger(readAliasedValue(indexed, KEY_ALIASES.salesVolume)),
      lastSalePrice: readMarketValue(indexed, "lastSalePrice"),
      lastSaleDate: toNullableDate(readAliasedValue(indexed, KEY_ALIASES.lastSaleDate)),
      population: toNullableInteger(readAliasedValue(indexed, KEY_ALIASES.population)),
      providerUpdatedAt: toNullableDate(
        readAliasedValue(indexed, KEY_ALIASES.providerUpdatedAt)
      ),
      synchronizedAt,
    },
  };
}

module.exports = {
  mapRowToSyncPayload,
};
