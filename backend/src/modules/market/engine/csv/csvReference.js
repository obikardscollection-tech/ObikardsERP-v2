const INTERNALS = {
  REGISTRY_VERSION: 1,
  KEYS: {
    VERSION: "version",
    COUNT: "count",
    METADATA: "metadata",
    INDEXES: "indexes",
    FLAGS: "flags",
    CACHE: "cache",
    REFERENCES: "references",
    ID: "id",
    PAYLOAD: "payload",
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt",
    SOURCE: "source",
    OPTIONS: "options",
    ALIASES: "aliases",
    CANONICAL: "canonical",
    CHECKSUM: "checksum",
    INITIALIZED: "initialized",
    VALIDATED: "validated",
    SEALED: "sealed",
  },
};

/**
 * Ensure a value is a non-empty string.
 * @param {unknown} value
 * @param {string} fieldName
 */
function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} doit etre une chaine non vide.`);
  }
}

/**
 * Ensure a value is a plain object.
 * @param {unknown} value
 * @param {string} fieldName
 */
function assertObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fieldName} doit etre un objet.`);
  }
}

/**
 * Deep clone value with runtime-native strategy when available.
 * @template T
 * @param {T} value
 * @returns {T}
 */
function deepClone(value) {
  if (
    value === undefined ||
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint" ||
    typeof value === "symbol"
  ) {
    return value;
  }

  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

/**
 * Create fixed metadata object shape.
 * @returns {{createdAt:string|null, updatedAt:string|null, source:string|null, options:object}}
 */
function createRegistryMetadata() {
  const options = {};

  return {
    createdAt: null,
    updatedAt: null,
    source: null,
    options,
  };
}

/**
 * Create fixed indexes object shape.
 * @returns {{aliases:object, canonical:object, checksum:object}}
 */
function createRegistryIndexes() {
  const aliases = {};
  const canonical = {};
  const checksum = {};

  return {
    aliases,
    canonical,
    checksum,
  };
}

/**
 * Create fixed flags object shape.
 * @returns {{initialized:boolean, validated:boolean, sealed:boolean}}
 */
function createRegistryFlags() {
  return {
    initialized: false,
    validated: false,
    sealed: false,
  };
}

/**
 * Create fixed cache object shape.
 * @returns {object}
 */
function createRegistryCache() {
  return {};
}

const DEFAULT_METADATA = createRegistryMetadata();
const DEFAULT_INDEXES = createRegistryIndexes();
const DEFAULT_FLAGS = createRegistryFlags();

/**
 * Build a registry with a stable object shape and property order.
 * @param {object} input
 * @returns {object}
 */
function buildRegistry(input) {
  return {
    version: input.version,
    count: input.count,
    metadata: input.metadata,
    indexes: input.indexes,
    flags: input.flags,
    cache: input.cache,
    references: input.references,
  };
}

/**
 * Lightweight registry validation for fast-path operations.
 * @param {unknown} registry
 * @returns {boolean}
 */
function validateReferenceRegistryLight(registry) {
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    return false;
  }

  if (registry[INTERNALS.KEYS.VERSION] !== INTERNALS.REGISTRY_VERSION) {
    return false;
  }

  if (!Number.isInteger(registry[INTERNALS.KEYS.COUNT]) || registry[INTERNALS.KEYS.COUNT] < 0) {
    return false;
  }

  const metadata = registry[INTERNALS.KEYS.METADATA];

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }

  if (!(INTERNALS.KEYS.CREATED_AT in metadata) || !(INTERNALS.KEYS.UPDATED_AT in metadata)) {
    return false;
  }

  if (!(INTERNALS.KEYS.SOURCE in metadata) || !(INTERNALS.KEYS.OPTIONS in metadata)) {
    return false;
  }

  if (metadata[INTERNALS.KEYS.CREATED_AT] !== null && typeof metadata[INTERNALS.KEYS.CREATED_AT] !== "string") {
    return false;
  }

  if (metadata[INTERNALS.KEYS.UPDATED_AT] !== null && typeof metadata[INTERNALS.KEYS.UPDATED_AT] !== "string") {
    return false;
  }

  if (metadata[INTERNALS.KEYS.SOURCE] !== null && typeof metadata[INTERNALS.KEYS.SOURCE] !== "string") {
    return false;
  }

  if (!metadata[INTERNALS.KEYS.OPTIONS] || typeof metadata[INTERNALS.KEYS.OPTIONS] !== "object" || Array.isArray(metadata[INTERNALS.KEYS.OPTIONS])) {
    return false;
  }

  const indexes = registry[INTERNALS.KEYS.INDEXES];

  if (!indexes || typeof indexes !== "object" || Array.isArray(indexes)) {
    return false;
  }

  if (!(INTERNALS.KEYS.ALIASES in indexes) || !(INTERNALS.KEYS.CANONICAL in indexes) || !(INTERNALS.KEYS.CHECKSUM in indexes)) {
    return false;
  }

  if (!indexes[INTERNALS.KEYS.ALIASES] || typeof indexes[INTERNALS.KEYS.ALIASES] !== "object" || Array.isArray(indexes[INTERNALS.KEYS.ALIASES])) {
    return false;
  }

  if (!indexes[INTERNALS.KEYS.CANONICAL] || typeof indexes[INTERNALS.KEYS.CANONICAL] !== "object" || Array.isArray(indexes[INTERNALS.KEYS.CANONICAL])) {
    return false;
  }

  if (!indexes[INTERNALS.KEYS.CHECKSUM] || typeof indexes[INTERNALS.KEYS.CHECKSUM] !== "object" || Array.isArray(indexes[INTERNALS.KEYS.CHECKSUM])) {
    return false;
  }

  const flags = registry[INTERNALS.KEYS.FLAGS];

  if (!flags || typeof flags !== "object" || Array.isArray(flags)) {
    return false;
  }

  if (typeof flags[INTERNALS.KEYS.INITIALIZED] !== "boolean") {
    return false;
  }

  if (typeof flags[INTERNALS.KEYS.VALIDATED] !== "boolean") {
    return false;
  }

  if (typeof flags[INTERNALS.KEYS.SEALED] !== "boolean") {
    return false;
  }

  const cache = registry[INTERNALS.KEYS.CACHE];

  if (!cache || typeof cache !== "object" || Array.isArray(cache)) {
    return false;
  }

  const references = registry[INTERNALS.KEYS.REFERENCES];

  if (!references || typeof references !== "object" || Array.isArray(references)) {
    return false;
  }

  return true;
}

/**
 * Build one reference registry entry.
 * @param {{id:string, payload:object, createdAt?:string, updatedAt?:string, now?:string}} params
 * @returns {{id:string, payload:object, createdAt:string, updatedAt:string}}
 */
function buildReferenceEntry(params) {
  const now = params.now || new Date().toISOString();

  return {
    id: params.id,
    payload: deepClone(params.payload),
    createdAt: params.createdAt || now,
    updatedAt: params.updatedAt || now,
  };
}

/**
 * Create a new empty generic reference registry.
 * @returns {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}}
 */
function createReferenceRegistry() {
  return buildRegistry({
    version: INTERNALS.REGISTRY_VERSION,
    count: 0,
    metadata: DEFAULT_METADATA,
    indexes: DEFAULT_INDEXES,
    flags: DEFAULT_FLAGS,
    cache: createRegistryCache(),
    references: {},
  });
}

/**
 * Validate internal registry structure.
 * @param {unknown} registry
 * @returns {boolean}
 */
function validateReferenceRegistry(registry) {
  if (!validateReferenceRegistryLight(registry)) {
    return false;
  }

  const references = registry[INTERNALS.KEYS.REFERENCES];

  let total = 0;

  for (const key in references) {
    if (!Object.prototype.hasOwnProperty.call(references, key)) {
      continue;
    }

    total += 1;

    const entry = references[key];

    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return false;
    }

    if (typeof entry[INTERNALS.KEYS.ID] !== "string" || entry[INTERNALS.KEYS.ID].trim() === "") {
      return false;
    }

    if (
      !entry[INTERNALS.KEYS.PAYLOAD] ||
      typeof entry[INTERNALS.KEYS.PAYLOAD] !== "object" ||
      Array.isArray(entry[INTERNALS.KEYS.PAYLOAD])
    ) {
      return false;
    }

    if (typeof entry[INTERNALS.KEYS.CREATED_AT] !== "string") {
      return false;
    }

    if (typeof entry[INTERNALS.KEYS.UPDATED_AT] !== "string") {
      return false;
    }
  }

  if (total !== registry[INTERNALS.KEYS.COUNT]) {
    return false;
  }

  return true;
}

/**
 * Clone the registry deeply enough to preserve immutability.
 * @param {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}} registry
 * @returns {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}}
 */
function cloneReferenceRegistry(registry) {
  if (!validateReferenceRegistryLight(registry)) {
    throw new Error("Le registre de references est invalide.");
  }

  const references = registry[INTERNALS.KEYS.REFERENCES];

  return buildRegistry({
    version: registry[INTERNALS.KEYS.VERSION],
    count: registry[INTERNALS.KEYS.COUNT],
    metadata: registry[INTERNALS.KEYS.METADATA],
    indexes: registry[INTERNALS.KEYS.INDEXES],
    flags: registry[INTERNALS.KEYS.FLAGS],
    cache: registry[INTERNALS.KEYS.CACHE],
    references: {
      ...references,
    },
  });
}

/**
 * Register or update a generic reference in an immutable way.
 * @param {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}} registry
 * @param {string} referenceId
 * @param {object} payload
 * @returns {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}}
 */
function registerReference(registry, referenceId, payload = {}) {
  assertNonEmptyString(referenceId, "referenceId");
  assertObject(payload, "payload");

  if (!validateReferenceRegistryLight(registry)) {
    throw new Error("Le registre de references est invalide.");
  }

  const references = registry[INTERNALS.KEYS.REFERENCES];
  const nextReferences = {
    ...references,
  };
  const existing = references[referenceId];
  const now = new Date().toISOString();

  nextReferences[referenceId] = buildReferenceEntry({
    id: referenceId,
    payload,
    now,
    createdAt: existing ? existing.createdAt : undefined,
    updatedAt: now,
  });

  return buildRegistry({
    version: registry[INTERNALS.KEYS.VERSION],
    count: existing ? registry[INTERNALS.KEYS.COUNT] : registry[INTERNALS.KEYS.COUNT] + 1,
    metadata: registry[INTERNALS.KEYS.METADATA],
    indexes: registry[INTERNALS.KEYS.INDEXES],
    flags: registry[INTERNALS.KEYS.FLAGS],
    cache: registry[INTERNALS.KEYS.CACHE],
    references: nextReferences,
  });
}

/**
 * Get a reference by id.
 * @param {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}} registry
 * @param {string} referenceId
 * @returns {{id:string, payload:object, createdAt:string, updatedAt:string} | null}
 */
function getReference(registry, referenceId) {
  assertNonEmptyString(referenceId, "referenceId");

  if (!validateReferenceRegistryLight(registry)) {
    throw new Error("Le registre de references est invalide.");
  }

  const references = registry[INTERNALS.KEYS.REFERENCES];
  const entry = references[referenceId];

  if (!entry) {
    return null;
  }

  return {
    id: entry[INTERNALS.KEYS.ID],
    payload: deepClone(entry[INTERNALS.KEYS.PAYLOAD]),
    createdAt: entry[INTERNALS.KEYS.CREATED_AT],
    updatedAt: entry[INTERNALS.KEYS.UPDATED_AT],
  };
}

/**
 * Check whether a reference exists.
 * @param {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}} registry
 * @param {string} referenceId
 * @returns {boolean}
 */
function hasReference(registry, referenceId) {
  assertNonEmptyString(referenceId, "referenceId");

  if (!validateReferenceRegistryLight(registry)) {
    throw new Error("Le registre de references est invalide.");
  }

  const references = registry[INTERNALS.KEYS.REFERENCES];

  return Object.prototype.hasOwnProperty.call(references, referenceId);
}

/**
 * Delete a reference in an immutable way.
 * @param {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}} registry
 * @param {string} referenceId
 * @returns {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}}
 */
function deleteReference(registry, referenceId) {
  assertNonEmptyString(referenceId, "referenceId");

  if (!validateReferenceRegistryLight(registry)) {
    throw new Error("Le registre de references est invalide.");
  }

  const references = registry[INTERNALS.KEYS.REFERENCES];

  if (!Object.prototype.hasOwnProperty.call(references, referenceId)) {
    return buildRegistry({
      version: registry[INTERNALS.KEYS.VERSION],
      count: registry[INTERNALS.KEYS.COUNT],
      metadata: registry[INTERNALS.KEYS.METADATA],
      indexes: registry[INTERNALS.KEYS.INDEXES],
      flags: registry[INTERNALS.KEYS.FLAGS],
      cache: registry[INTERNALS.KEYS.CACHE],
      references: {
        ...references,
      },
    });
  }

  const nextReferences = {
    ...references,
  };

  delete nextReferences[referenceId];

  return buildRegistry({
    version: registry[INTERNALS.KEYS.VERSION],
    count: registry[INTERNALS.KEYS.COUNT] - 1,
    metadata: registry[INTERNALS.KEYS.METADATA],
    indexes: registry[INTERNALS.KEYS.INDEXES],
    flags: registry[INTERNALS.KEYS.FLAGS],
    cache: registry[INTERNALS.KEYS.CACHE],
    references: nextReferences,
  });
}

/**
 * Return all references.
 * @param {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}} registry
 * @returns {Array<{id:string, payload:object, createdAt:string, updatedAt:string}>}
 */
function listReferences(registry) {
  if (!validateReferenceRegistryLight(registry)) {
    throw new Error("Le registre de references est invalide.");
  }

  const references = registry[INTERNALS.KEYS.REFERENCES];
  const result = new Array(registry[INTERNALS.KEYS.COUNT]);
  let index = 0;

  for (const key in references) {
    if (!Object.prototype.hasOwnProperty.call(references, key)) {
      continue;
    }

    const entry = references[key];

    result[index] = {
      id: entry[INTERNALS.KEYS.ID],
      payload: deepClone(entry[INTERNALS.KEYS.PAYLOAD]),
      createdAt: entry[INTERNALS.KEYS.CREATED_AT],
      updatedAt: entry[INTERNALS.KEYS.UPDATED_AT],
    };

    index += 1;
  }

  return result;
}

/**
 * Return simple registry statistics.
 * @param {{version:number, references: Record<string, {id:string, payload:object, createdAt:string, updatedAt:string}>}} registry
 * @returns {{version:number, total:number}}
 */
function getReferenceStats(registry) {
  if (!validateReferenceRegistryLight(registry)) {
    throw new Error("Le registre de references est invalide.");
  }

  return {
    version: registry[INTERNALS.KEYS.VERSION],
    total: registry[INTERNALS.KEYS.COUNT],
  };
}

/**
 * Create a new immutable context enriched with a generic reference registry.
 * @param {object} context
 * @returns {object}
 */
function referenceCsvEngineStage(context) {
  assertObject(context, "context");

  const referenceRegistry = createReferenceRegistry();

  if (!validateReferenceRegistryLight(referenceRegistry)) {
    throw new Error("Impossible d'initialiser le registre de references.");
  }

  const nextData = {
    ...(context.data || {}),
    referenceRegistry,
  };

  return {
    ...context,
    data: nextData,
  };
}

module.exports = {
  createReferenceRegistry,
  registerReference,
  getReference,
  hasReference,
  deleteReference,
  listReferences,
  cloneReferenceRegistry,
  getReferenceStats,
  validateReferenceRegistry,
  referenceCsvEngineStage,
};
