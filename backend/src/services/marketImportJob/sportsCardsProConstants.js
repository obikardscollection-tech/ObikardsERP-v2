const SPORTS_CARDS_PRO_PROVIDER = {
  CODE: "SPORTSCARDSPRO",
  NAME: "SportsCardsPro",
};

const IMPORT_SOURCE = {
  MANUAL: "MANUAL",
  SCHEDULER: "SCHEDULER",
};

const IMPORT_STATUS = {
  RUNNING: "RUNNING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const ENV = {
  DEFAULT_CSV_PATH: "SPORTSCARDSPRO_IMPORT_CSV_PATH",
  STALE_MINUTES: "SPORTSCARDSPRO_SYNC_STALE_MINUTES",
  AUTO_SYNC_ENABLED: "SPORTSCARDSPRO_AUTO_SYNC_ENABLED",
  AUTO_SYNC_INTERVAL_MINUTES: "SPORTSCARDSPRO_AUTO_SYNC_INTERVAL_MINUTES",
};

const DEFAULTS = {
  STALE_MINUTES: 120,
  AUTO_SYNC_ENABLED: false,
  AUTO_SYNC_INTERVAL_MINUTES: 30,
};

const ERROR_CODES = {
  IMPORT_ALREADY_RUNNING: "IMPORT_ALREADY_RUNNING",
  INVALID_CSV_PATH: "INVALID_CSV_PATH",
  INVALID_ROW: "INVALID_ROW",
  JOB_FAILURE: "JOB_FAILURE",
};

const KEY_ALIASES = {
  providerCardId: ["id", "product-id", "provider-card-id", "providercardid"],
  productName: ["product-name", "productname", "title", "name"],
  sport: ["sport", "category"],
  league: ["league"],
  player: ["player", "athlete", "player-name", "name"],
  team: ["team", "team-name"],
  brand: ["brand", "manufacturer", "publisher"],
  set: ["set", "set-name", "series"],
  subset: ["subset", "sub-set"],
  year: ["year", "release-year", "card-year", "release-date"],
  cardNumber: ["card-number", "cardnumber", "number"],
  parallel: ["parallel"],
  variation: ["variation"],
  language: ["language", "lang"],
  country: ["country"],
  providerUrl: ["url", "provider-url", "product-url"],
  providerUpdatedAt: ["updated-at", "provider-updated-at", "last-updated"],
  rawPrice: ["loose-price", "raw-price"],
  psa8Price: ["graded-price", "psa-8-price"],
  psa9Price: ["condition-17-price", "psa-9-price"],
  psa10Price: ["condition-18-price", "psa-10-price"],
  bgs10Price: ["bgs-10-price"],
  cgc10Price: ["cgc-10-price"],
  sgc10Price: ["sgc-10-price"],
  retailBuy: ["retail-new-buy", "retail-new-buy-price"],
  retailSell: ["retail-new-sell", "retail-new-sell-price"],
  salesVolume: ["sales-volume"],
  lastSalePrice: ["last-sale-price"],
  lastSaleDate: ["last-sale-date"],
  population: ["population"],
};

const SNAPSHOT_COMPARE_FIELDS = [
  "currency",
  "rawPrice",
  "psa8Price",
  "psa9Price",
  "psa10Price",
  "bgs10Price",
  "cgc10Price",
  "sgc10Price",
  "retailBuy",
  "retailSell",
  "salesVolume",
  "lastSalePrice",
  "lastSaleDate",
  "population",
  "providerUpdatedAt",
];

const SNAPSHOT_BUSINESS_FIELDS = SNAPSHOT_COMPARE_FIELDS.filter(
  (field) => field !== "providerUpdatedAt"
);

const MARKET_CARD_SYNC_FIELDS = [
  "sport",
  "league",
  "player",
  "team",
  "brand",
  "set",
  "subset",
  "year",
  "productName",
  "cardNumber",
  "parallel",
  "variation",
  "rookie",
  "autograph",
  "memorabilia",
  "serialNumbered",
  "printRun",
  "language",
  "country",
  "releaseDate",
  "slug",
  "searchText",
  "active",
];

const PROVIDER_CARD_SYNC_FIELDS = [
  "marketCardId",
  "providerUrl",
  "providerChecksum",
  "active",
];

module.exports = {
  SPORTS_CARDS_PRO_PROVIDER,
  IMPORT_SOURCE,
  IMPORT_STATUS,
  ENV,
  DEFAULTS,
  ERROR_CODES,
  KEY_ALIASES,
  SNAPSHOT_COMPARE_FIELDS,
  SNAPSHOT_BUSINESS_FIELDS,
  MARKET_CARD_SYNC_FIELDS,
  PROVIDER_CARD_SYNC_FIELDS,
};
