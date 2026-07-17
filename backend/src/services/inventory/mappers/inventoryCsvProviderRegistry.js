const customCsvProvider = require("./providers/customCsvProvider");
const sportsCardsProCsvProvider = require("./providers/sportsCardsProCsvProvider");
const ebayCsvProvider = require("./providers/ebayCsvProvider");
const beckettCsvProvider = require("./providers/beckettCsvProvider");
const ludexCsvProvider = require("./providers/ludexCsvProvider");

const INTERNALS = {
  PROVIDERS: [
    customCsvProvider,
    sportsCardsProCsvProvider,
    ebayCsvProvider,
    beckettCsvProvider,
    ludexCsvProvider,
  ],
  IDS: {
    CUSTOM_CSV: "custom-csv",
    SPORTSCARDSPRO: "sportscardspro-csv",
    EBAY: "ebay-csv",
    BECKETT: "beckett-csv",
    LUDEX: "ludex-csv",
  },
};

const PROVIDER_REGISTRY = new Map();

/**
 * Deep-freeze one object tree to prevent runtime mutations.
 * @template T
 * @param {T} value
 * @returns {T}
 */
function deepFreeze(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  for (const key of Object.getOwnPropertyNames(value)) {
    const nested = value[key];

    if (nested && typeof nested === "object") {
      deepFreeze(nested);
    }
  }

  return Object.freeze(value);
}

/**
 * Validate provider contract before registry insertion.
 * @param {unknown} provider
 */
function assertProviderContract(provider) {
  if (!provider || typeof provider !== "object" || Array.isArray(provider)) {
    throw new Error("Provider CSV invalide: la definition doit etre un objet.");
  }

  if (typeof provider.id !== "string" || provider.id.trim() === "") {
    throw new Error("Provider CSV invalide: 'id' est requis.");
  }

  if (typeof provider.name !== "string" || provider.name.trim() === "") {
    throw new Error(`Provider CSV invalide (${provider.id}): 'name' est requis.`);
  }

  if (typeof provider.version !== "string" || provider.version.trim() === "") {
    throw new Error(`Provider CSV invalide (${provider.id}): 'version' est requis.`);
  }

  if (!provider.mapping || typeof provider.mapping !== "object" || Array.isArray(provider.mapping)) {
    throw new Error(`Provider CSV invalide (${provider.id}): 'mapping' est requis.`);
  }

  if (!provider.mapping.schema || typeof provider.mapping.schema !== "object" || Array.isArray(provider.mapping.schema)) {
    throw new Error(`Provider CSV invalide (${provider.id}): 'mapping.schema' est requis.`);
  }

  if (!provider.detection || typeof provider.detection !== "object" || Array.isArray(provider.detection)) {
    throw new Error(`Provider CSV invalide (${provider.id}): 'detection' est requis.`);
  }

  if (
    !provider.detection.signatures ||
    typeof provider.detection.signatures !== "object" ||
    Array.isArray(provider.detection.signatures)
  ) {
    throw new Error(`Provider CSV invalide (${provider.id}): 'detection.signatures' est requis.`);
  }
}

/**
 * Register one provider with contract validation and duplicate-id protection.
 * @param {object} provider
 */
function registerProvider(provider) {
  assertProviderContract(provider);

  if (PROVIDER_REGISTRY.has(provider.id)) {
    throw new Error(`Provider CSV duplique detecte: '${provider.id}'.`);
  }

  PROVIDER_REGISTRY.set(provider.id, deepFreeze(provider));
}

for (const provider of INTERNALS.PROVIDERS) {
  registerProvider(provider);
}

/**
 * Return provider ids enum for external consumers.
 */
const INVENTORY_CSV_PROVIDERS = {
  CUSTOM_CSV: INTERNALS.IDS.CUSTOM_CSV,
  SPORTSCARDSPRO: INTERNALS.IDS.SPORTSCARDSPRO,
  EBAY: INTERNALS.IDS.EBAY,
  BECKETT: INTERNALS.IDS.BECKETT,
  LUDEX: INTERNALS.IDS.LUDEX,
};
Object.freeze(INVENTORY_CSV_PROVIDERS);

/**
 * List all registered inventory CSV providers.
 * @returns {Array<object>}
 */
function getInventoryCsvProviders() {
  return Array.from(PROVIDER_REGISTRY.values());
}

/**
 * Resolve one provider by id.
 * @param {string|undefined} providerId
 * @returns {object|null}
 */
function getInventoryCsvProvider(providerId) {
  if (typeof providerId !== "string" || providerId.trim() === "") {
    return null;
  }

  return PROVIDER_REGISTRY.get(providerId.trim()) || null;
}

/**
 * Resolve provider schema with fallback support.
 * @param {string|undefined} providerId
 * @param {string} [fallbackProviderId]
 * @returns {Record<string, {type:string, aliases:string[]}>}
 */
function resolveInventoryCsvProviderSchema(
  providerId,
  fallbackProviderId = INVENTORY_CSV_PROVIDERS.CUSTOM_CSV
) {
  const provider = getInventoryCsvProvider(providerId);

  if (provider && provider.mapping && provider.mapping.schema) {
    return provider.mapping.schema;
  }

  const fallbackProvider = getInventoryCsvProvider(fallbackProviderId);

  if (fallbackProvider && fallbackProvider.mapping && fallbackProvider.mapping.schema) {
    return fallbackProvider.mapping.schema;
  }

  return {};
}

module.exports = {
  INVENTORY_CSV_PROVIDERS,
  getInventoryCsvProviders,
  getInventoryCsvProvider,
  resolveInventoryCsvProviderSchema,
};
