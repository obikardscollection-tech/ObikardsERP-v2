const {
  resolveInventoryCsvProviderDiagnostics,
} = require("./inventoryCsvProviderResolver");
const {
  INVENTORY_CSV_PROVIDERS,
  resolveInventoryCsvProviderSchema,
} = require("./inventoryCsvProviderRegistry");

const INTERNALS = {
  TYPES: {
    STRING: "string",
    INTEGER: "integer",
    FLOAT: "float",
    BOOLEAN: "boolean",
    DATE: "date",
  },
  EMPTY_VALUE: "",
  EU_DATE_PATTERN: /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/,
  BOOLEAN_TRUE: ["true", "yes", "1", "y", "oui", "vrai"],
  BOOLEAN_FALSE: ["false", "no", "0", "n", "non", "faux"],
};

const PROVIDER_ALIAS_LOOKUP_CACHE = new Map();
const TRUE_BOOLEAN_SET = new Set(INTERNALS.BOOLEAN_TRUE);
const FALSE_BOOLEAN_SET = new Set(INTERNALS.BOOLEAN_FALSE);

/**
 * Normalize a CSV column name for alias matching.
 * @param {unknown} input
 * @returns {string}
 */
function normalizeAlias(input) {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Convert empty-like values to null.
 * @param {unknown} value
 * @returns {unknown}
 */
function normalizeNullableValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && value.trim() === INTERNALS.EMPTY_VALUE) {
    return null;
  }

  return value;
}

/**
 * Normalize numeric string for US/EU decimal formats.
 * @param {string} value
 * @returns {string}
 */
function normalizeNumericString(value) {
  const compact = value.trim().replace(/\s+/g, "");
  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");

  if (hasComma && hasDot) {
    const lastComma = compact.lastIndexOf(",");
    const lastDot = compact.lastIndexOf(".");

    if (lastComma > lastDot) {
      return compact.replace(/\./g, "").replace(/,/g, ".");
    }

    return compact.replace(/,/g, "");
  }

  if (hasComma) {
    return compact.replace(/,/g, ".");
  }

  return compact;
}

/**
 * Convert value to integer when possible.
 * @param {unknown} value
 * @returns {number|null}
 */
function toInteger(value) {
  const normalized = normalizeNullableValue(value);

  if (normalized === null) {
    return null;
  }

  if (typeof normalized === "number" && Number.isInteger(normalized)) {
    return normalized;
  }

  if (typeof normalized === "string") {
    const numericString = normalizeNumericString(normalized);

    if (!/^-?\d+$/.test(numericString)) {
      return null;
    }

    const parsed = Number(numericString);

    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
}

/**
 * Convert value to float when possible.
 * @param {unknown} value
 * @returns {number|null}
 */
function toFloat(value) {
  const normalized = normalizeNullableValue(value);

  if (normalized === null) {
    return null;
  }

  if (typeof normalized === "number") {
    return Number.isFinite(normalized) ? normalized : null;
  }

  if (typeof normalized === "string") {
    const parsed = Number(normalizeNumericString(normalized));

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

/**
 * Convert value to boolean when possible.
 * @param {unknown} value
 * @returns {boolean|null}
 */
function toBoolean(value) {
  const normalized = normalizeNullableValue(value);

  if (normalized === null) {
    return null;
  }

  if (typeof normalized === "boolean") {
    return normalized;
  }

  if (typeof normalized === "number") {
    if (normalized === 1) {
      return true;
    }

    if (normalized === 0) {
      return false;
    }

    return null;
  }

  if (typeof normalized === "string") {
    const lower = normalized.trim().toLowerCase();

    if (TRUE_BOOLEAN_SET.has(lower)) {
      return true;
    }

    if (FALSE_BOOLEAN_SET.has(lower)) {
      return false;
    }
  }

  return null;
}

/**
 * Parse DD/MM/YYYY, DD-MM-YYYY and DD.MM.YYYY strings.
 * @param {string} value
 * @returns {Date|null}
 */
function parseEuropeanDate(value) {
  const match = value.trim().match(INTERNALS.EU_DATE_PATTERN);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

/**
 * Convert value to Date when possible.
 * @param {unknown} value
 * @returns {Date|null}
 */
function toDate(value) {
  const normalized = normalizeNullableValue(value);

  if (normalized === null) {
    return null;
  }

  if (normalized instanceof Date) {
    return Number.isNaN(normalized.getTime()) ? null : normalized;
  }

  if (typeof normalized === "string") {
    const europeanDate = parseEuropeanDate(normalized);

    if (europeanDate) {
      return europeanDate;
    }

    const parsed = new Date(normalized);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof normalized === "number") {
    const parsed = new Date(normalized);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Convert one source value according to mapping type.
 * @param {unknown} value
 * @param {string} type
 * @returns {unknown}
 */
function convertValueByType(value, type) {
  if (type === INTERNALS.TYPES.INTEGER) {
    return toInteger(value);
  }

  if (type === INTERNALS.TYPES.FLOAT) {
    return toFloat(value);
  }

  if (type === INTERNALS.TYPES.BOOLEAN) {
    return toBoolean(value);
  }

  if (type === INTERNALS.TYPES.DATE) {
    return toDate(value);
  }

  return normalizeNullableValue(value);
}

/**
 * Build alias lookup index for one provider schema.
 * @param {Record<string, {type:string, aliases:string[]}>} schema
 * @returns {Record<string, {field:string, type:string}>}
 */
function createAliasLookup(schema) {
  const lookup = {};

  for (const [field, fieldConfig] of Object.entries(schema)) {
    const aliases = new Set([field, ...(fieldConfig.aliases || [])]);

    for (const alias of aliases) {
      const normalizedAlias = normalizeAlias(alias);

      if (!normalizedAlias) {
        continue;
      }

      lookup[normalizedAlias] = {
        field,
        type: fieldConfig.type,
      };
    }
  }

  return lookup;
}

/**
 * Resolve a provider alias lookup from cache.
 * @param {string|undefined} provider
 * @returns {Record<string, {field:string, type:string}>}
 */
function resolveProviderAliasLookup(provider) {
  const schemaProvider =
    typeof provider === "string" && provider.trim() !== ""
      ? provider.trim()
      : INVENTORY_CSV_PROVIDERS.CUSTOM_CSV;

  if (PROVIDER_ALIAS_LOOKUP_CACHE.has(schemaProvider)) {
    return PROVIDER_ALIAS_LOOKUP_CACHE.get(schemaProvider);
  }

  const schema = resolveInventoryCsvProviderSchema(
    schemaProvider,
    INVENTORY_CSV_PROVIDERS.CUSTOM_CSV
  );
  const aliasLookup = createAliasLookup(schema);

  PROVIDER_ALIAS_LOOKUP_CACHE.set(schemaProvider, aliasLookup);

  return aliasLookup;
}

/**
 * Resolve effective provider for row mapping.
 * @param {Record<string, unknown>} row
 * @param {{provider?:string,headers?:string[]}} options
 * @returns {{provider:string,confidence:number,score:number,maxScore:number,matchedHeaders:string[],recognizedHeaders:string[],ignoredHeaders:string[]}}
 */
function resolveEffectiveProvider(row, options) {
  const requestedProvider = typeof options.provider === "string" ? options.provider.trim() : "";

  if (requestedProvider && requestedProvider !== INVENTORY_CSV_PROVIDERS.CUSTOM_CSV) {
    // Forced-provider mode: automatic detection is intentionally skipped.
    // Diagnostics are marked with confidence=1 because the provider is imposed
    // by caller intent, not inferred from headers.
    return {
      provider: requestedProvider,
      confidence: 1,
      score: 0,
      maxScore: 0,
      matchedHeaders: [],
      recognizedHeaders: [],
      ignoredHeaders: [],
    };
  }

  return resolveInventoryCsvProviderDiagnostics({
    headers: options.headers,
    row,
    fallbackProvider: INVENTORY_CSV_PROVIDERS.CUSTOM_CSV,
  });
}

/**
 * Map one CSV matched row to an Inventory DTO.
 * Unknown columns are ignored by design.
 *
 * Future extension points:
 * - provider-specific field schema overrides
 * - ignored column collection for diagnostics
 * - provider confidence score on mapping quality
 *
 * @param {Record<string, unknown>} row
 * @param {{provider?:string, onIgnoredColumn?:(column:string, value:unknown)=>void}} [options]
 * @returns {Record<string, unknown>}
 */
function mapCsvRowToInventoryDto(row, options = {}) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return {};
  }

  const providerDiagnostics = resolveEffectiveProvider(row, options);
  const aliasLookup = resolveProviderAliasLookup(providerDiagnostics.provider);
  const dto = {};

  for (const [column, value] of Object.entries(row)) {
    const aliasKey = normalizeAlias(column);
    const mappedField = aliasLookup[aliasKey];

    if (!mappedField) {
      if (typeof options.onIgnoredColumn === "function") {
        options.onIgnoredColumn(column, value);
      }

      continue;
    }

    dto[mappedField.field] = convertValueByType(value, mappedField.type);
  }

  return dto;
}

module.exports = {
  mapCsvRowToInventoryDto,
  INVENTORY_CSV_PROVIDERS,
};