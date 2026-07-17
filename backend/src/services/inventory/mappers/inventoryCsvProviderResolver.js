const {
  INVENTORY_CSV_PROVIDERS,
  getInventoryCsvProviders,
  getInventoryCsvProvider,
} = require("./inventoryCsvProviderRegistry");

const INTERNALS = {
  DEFAULT_WEIGHT: 1,
};

// Cache extension points:
// - bounded size limits
// - LRU eviction policy
// - periodic cleanup scheduler
const PROVIDER_SIGNATURE_CACHE = new Map();
const PROVIDER_MAX_SCORE_CACHE = new Map();
const RESOLUTION_CACHE = new Map();

/**
 * Normalize one header alias for signature lookup.
 * @param {unknown} input
 * @returns {string}
 */
function normalizeHeaderAlias(input) {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Normalize one signature weight map with defaults.
 * @param {unknown} rawSignatures
 * @returns {Record<string, number>}
 */
function normalizeSignatureWeightMap(rawSignatures) {
  if (!rawSignatures || typeof rawSignatures !== "object" || Array.isArray(rawSignatures)) {
    return {};
  }

  return rawSignatures;
}

/**
 * Resolve one signature weight from config.
 * @param {string} signature
 * @param {unknown} explicitWeight
 * @returns {number}
 */
function resolveSignatureWeight(signature, explicitWeight) {
  if (typeof explicitWeight === "number" && Number.isFinite(explicitWeight) && explicitWeight > 0) {
    return explicitWeight;
  }

  return INTERNALS.DEFAULT_WEIGHT;
}

/**
 * Build cached normalized signatures for one provider.
 * @param {string} provider
 * @returns {Map<string, {alias:string, weight:number}>}
 */
function getProviderSignatures(provider) {
  if (PROVIDER_SIGNATURE_CACHE.has(provider)) {
    return PROVIDER_SIGNATURE_CACHE.get(provider);
  }

  const providerDefinition = getInventoryCsvProvider(provider);
  const rawSignatures = normalizeSignatureWeightMap(
    providerDefinition && providerDefinition.detection ? providerDefinition.detection.signatures : {}
  );
  const normalizedSignatures = new Map();

  for (const [signature, explicitWeight] of Object.entries(rawSignatures)) {
    const normalized = normalizeHeaderAlias(signature);

    if (normalized) {
      normalizedSignatures.set(normalized, {
        alias: signature,
        weight: resolveSignatureWeight(signature, explicitWeight),
      });
    }
  }

  PROVIDER_SIGNATURE_CACHE.set(provider, normalizedSignatures);

  return normalizedSignatures;
}

/**
 * Resolve maximum theoretical score for one provider.
 * @param {string} provider
 * @returns {number}
 */
function getProviderMaxScore(provider) {
  if (PROVIDER_MAX_SCORE_CACHE.has(provider)) {
    return PROVIDER_MAX_SCORE_CACHE.get(provider);
  }

  let maxScore = 0;

  for (const signature of getProviderSignatures(provider).values()) {
    maxScore += signature.weight;
  }

  PROVIDER_MAX_SCORE_CACHE.set(provider, maxScore);

  return maxScore;
}

/**
 * Build normalized header set from explicit headers or row keys.
 * @param {{headers?:unknown,row?:unknown}} input
 * @returns {Set<string>}
 */
function createNormalizedHeaderSet(input) {
  const headerSet = new Set();
  const headers = Array.isArray(input.headers)
    ? input.headers
    : input.row && typeof input.row === "object" && !Array.isArray(input.row)
      ? Object.keys(input.row)
      : [];

  for (const header of headers) {
    const normalized = normalizeHeaderAlias(header);

    if (normalized) {
      headerSet.add(normalized);
    }
  }

  return headerSet;
}

/**
 * Score one provider against available CSV headers.
 * @param {Set<string>} headerSet
 * @param {string} provider
 * @returns {{score:number,maxScore:number,matchedHeaders:string[]}}
 */
function scoreProvider(headerSet, provider) {
  const signatures = getProviderSignatures(provider);
  let score = 0;
  const matchedHeaders = [];

  for (const [normalizedSignature, signatureInfo] of signatures.entries()) {
    if (headerSet.has(normalizedSignature)) {
      score += signatureInfo.weight;
      matchedHeaders.push(signatureInfo.alias);
    }
  }

  return {
    score,
    maxScore: getProviderMaxScore(provider),
    matchedHeaders,
  };
}

/**
 * Build a stable cache key from normalized headers + fallback.
 * @param {Set<string>} headerSet
 * @param {string} fallbackProvider
 * @returns {string}
 */
function createResolutionCacheKey(headerSet, fallbackProvider) {
  const orderedHeaders = Array.from(headerSet).sort();

  return `${fallbackProvider}::${orderedHeaders.join("|")}`;
}

/**
 * Build stable diagnostics object.
 * @param {{provider:string,version:string|null,confidence:number,score:number,maxScore:number,matchedHeaders:string[],recognizedHeaders:string[],ignoredHeaders:string[]}} input
 * @returns {{provider:string,version:string|null,confidence:number,score:number,maxScore:number,matchedHeaders:string[],recognizedHeaders:string[],ignoredHeaders:string[]}}
 */
function createProviderDiagnostics(input) {
  return {
    provider: input.provider,
    version: input.version,
    confidence: input.confidence,
    score: input.score,
    maxScore: input.maxScore,
    matchedHeaders: [...input.matchedHeaders],
    recognizedHeaders: [...input.recognizedHeaders],
    ignoredHeaders: [...input.ignoredHeaders],
  };
}

/**
 * Build recognized/ignored header diagnostics for the selected provider.
 * @param {Set<string>} headerSet
 * @param {string} provider
 * @returns {{recognizedHeaders:string[], ignoredHeaders:string[]}}
 */
function resolveHeaderDiagnostics(headerSet, provider) {
  const providerSignatures = getProviderSignatures(provider);
  const recognizedHeaders = [];
  const ignoredHeaders = [];

  for (const normalizedHeader of headerSet) {
    if (providerSignatures.has(normalizedHeader)) {
      recognizedHeaders.push(providerSignatures.get(normalizedHeader).alias);
      continue;
    }

    ignoredHeaders.push(normalizedHeader);
  }

  return {
    recognizedHeaders,
    ignoredHeaders,
  };
}

/**
 * Resolve inventory CSV provider diagnostics from headers.
 * Unknown format falls back to custom CSV.
 *
 * Future extension points:
 * - provider-specific tie breakers
 * - persisted provider decision diagnostics
 * - threshold-based provider auto-detection policies
 *
 * @param {{headers?:string[],row?:Record<string,unknown>,fallbackProvider?:string}} [input]
 * @returns {{provider:string,version:string|null,confidence:number,score:number,maxScore:number,matchedHeaders:string[],recognizedHeaders:string[],ignoredHeaders:string[]}}
 */
function resolveInventoryCsvProviderDiagnostics(input = {}) {
  const fallbackProvider =
    typeof input.fallbackProvider === "string" && input.fallbackProvider.trim() !== ""
      ? input.fallbackProvider.trim()
      : INVENTORY_CSV_PROVIDERS.CUSTOM_CSV;

  const headerSet = createNormalizedHeaderSet(input);
  const cacheKey = createResolutionCacheKey(headerSet, fallbackProvider);

  if (RESOLUTION_CACHE.has(cacheKey)) {
    return createProviderDiagnostics(RESOLUTION_CACHE.get(cacheKey));
  }

  if (headerSet.size === 0) {
    const emptyDiagnostics = createProviderDiagnostics({
      provider: fallbackProvider,
      version: null,
      confidence: 0,
      score: 0,
      maxScore: 0,
      matchedHeaders: [],
      recognizedHeaders: [],
      ignoredHeaders: [],
    });

    RESOLUTION_CACHE.set(cacheKey, emptyDiagnostics);

    return createProviderDiagnostics(emptyDiagnostics);
  }

  let bestProvider = null;
  let bestScore = 0;
  let bestMaxScore = 0;
  let bestMatchedHeaders = [];
  let hasTie = false;

  for (const provider of getInventoryCsvProviders()) {
    const providerScore = scoreProvider(headerSet, provider.id);

    if (providerScore.score > bestScore) {
      bestScore = providerScore.score;
      bestMaxScore = providerScore.maxScore;
      bestMatchedHeaders = providerScore.matchedHeaders;
      bestProvider = provider.id;
      hasTie = false;
      continue;
    }

    if (providerScore.score > 0 && providerScore.score === bestScore) {
      hasTie = true;
    }
  }

  if (!bestProvider || bestScore === 0 || hasTie) {
    // Tie policy (intentional): fallback to CUSTOM_CSV until a dedicated tie-breaker is introduced.
    const fallbackHeaderDiagnostics = resolveHeaderDiagnostics(headerSet, fallbackProvider);
    const fallbackProviderDefinition = getInventoryCsvProvider(fallbackProvider);
    const fallbackDiagnostics = createProviderDiagnostics({
      provider: fallbackProvider,
      version: fallbackProviderDefinition ? fallbackProviderDefinition.version : null,
      confidence: 0,
      score: 0,
      maxScore: 0,
      matchedHeaders: [],
      recognizedHeaders: fallbackHeaderDiagnostics.recognizedHeaders,
      ignoredHeaders: fallbackHeaderDiagnostics.ignoredHeaders,
    });

    RESOLUTION_CACHE.set(cacheKey, fallbackDiagnostics);

    return createProviderDiagnostics(fallbackDiagnostics);
  }

  const confidence =
    bestMaxScore > 0 ? Math.max(0, Math.min(1, bestScore / bestMaxScore)) : 0;
  const headerDiagnostics = resolveHeaderDiagnostics(headerSet, bestProvider);
  const bestProviderDefinition = getInventoryCsvProvider(bestProvider);
  const diagnostics = createProviderDiagnostics({
    provider: bestProvider,
    version: bestProviderDefinition ? bestProviderDefinition.version : null,
    confidence,
    score: bestScore,
    maxScore: bestMaxScore,
    matchedHeaders: bestMatchedHeaders,
    recognizedHeaders: headerDiagnostics.recognizedHeaders,
    ignoredHeaders: headerDiagnostics.ignoredHeaders,
  });

  RESOLUTION_CACHE.set(cacheKey, diagnostics);

  return createProviderDiagnostics(diagnostics);
}

/**
 * Resolve provider name only (legacy compatibility wrapper).
 * @param {{headers?:string[],row?:Record<string,unknown>,fallbackProvider?:string}} [input]
 * @returns {string}
 */
function resolveInventoryCsvProvider(input = {}) {
  return resolveInventoryCsvProviderDiagnostics(input).provider;
}

module.exports = {
  resolveInventoryCsvProviderDiagnostics,
  resolveInventoryCsvProvider,
};