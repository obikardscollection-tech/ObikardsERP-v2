const cardReferenceMapper = require("../mappers/cardReferenceMapper");
const cardReferenceRepository = require("../repositories/cardReferenceRepository");
const {
  buildReferenceFingerprint,
} = require("./referenceFingerprintService");
const {
  EXTERNAL_IDENTIFIER_FIELDS,
  isSupportedExternalIdentifierField,
  resolveExternalIdentifierField,
  normalizeExternalIdentifierValue,
} = require("./referenceExternalIdentifierService");

const ENRICHABLE_STRING_FIELDS = [
  "league",
  "manufacturer",
  "brand",
  "set",
  "subset",
  "cardNumber",
  "playerDisplayName",
  "team",
  "parallel",
  "variation",
  "language",
];

const ENRICHABLE_INTEGER_FIELDS = [
  "printRun",
];

const ENRICHABLE_BOOLEAN_FIELDS = [
  "rookie",
  "autograph",
  "memorabilia",
  "insert",
];

/**
 * Return module-level metadata for the Card Reference foundation.
 */
function getFoundationMetadata() {
  return {
    module: "card-reference",
    scope: "definition-only",
    persistenceModel: "CardReference",
  };
}

function buildSource(input) {
  return input && typeof input === "object" ? { ...input } : {};
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isBlankIdentifier(value) {
  return value == null || String(value).trim() === "";
}

function isBlankValue(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function isUniqueConstraintError(error) {
  return Boolean(error) && error.code === "P2002";
}

function toNullableInteger(value) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (normalized === "") {
      return null;
    }

    const asInteger = Number.parseInt(normalized, 10);

    return Number.isNaN(asInteger) ? null : asInteger;
  }

  return null;
}

function normalizeCardReferenceInput(input) {
  const source = buildSource(input);
  const payload = cardReferenceMapper.toPersistence(source);

  payload.year = toNullableInteger(payload.year);

  if (payload.printRun !== undefined) {
    payload.printRun = toNullableInteger(payload.printRun);
  }

  return payload;
}

/**
 * Merge mapped and explicit CardReference input.
 * Explicit fields override mapped values.
 * @param {object} input
 * @param {object} entry
 */
function resolveCardReferenceInput(input, entry) {
  const mappedCardReference = isPlainObject(entry && entry.cardReference)
    ? entry.cardReference
    : {};
  const explicitCardReference = isPlainObject(input && input.cardReference)
    ? input.cardReference
    : {};

  return {
    ...mappedCardReference,
    ...explicitCardReference,
  };
}

function hasRequiredCardReferenceFields(cardReference) {
  return !(
    isBlankIdentifier(cardReference.sport)
    || isBlankIdentifier(cardReference.player)
    || !Number.isInteger(cardReference.year)
  );
}

/**
 * Prepare a CardReference from mapped entry data and explicit input overrides.
 * Returns null when required fields are missing.
 * @param {object} input
 * @param {object} entry
 */
async function prepareCardReference(input, entry) {
  const cardReferenceInput = normalizeCardReferenceInput(
    resolveCardReferenceInput(input, entry)
  );

  if (!hasRequiredCardReferenceFields(cardReferenceInput)) {
    return null;
  }

  return findOrCreateCardReference(cardReferenceInput);
}

/**
 * Prepare a CardReference and sync one external identifier onto it when present.
 * @param {object} input
 * @param {object} entry
 * @param {string} externalIdentifierField
 */
async function prepareCardReferenceEntry(
  input,
  entry,
  externalIdentifierField
) {
  const resolvedExternalIdentifierField = resolveExternalIdentifierField(
    externalIdentifierField
  );

  if (!resolvedExternalIdentifierField) {
    throw new Error("Unsupported external identifier field.");
  }

  const cardReference = await prepareCardReference(input, entry);

  if (!cardReference) {
    return {
      ...entry,
      cardReference: null,
    };
  }

  if (isBlankIdentifier(entry && entry.externalId)) {
    return {
      ...entry,
      cardReference,
    };
  }

  const syncedCardReference = await syncExternalIdentifier(
    cardReference,
    resolvedExternalIdentifierField,
    entry.externalId
  );

  return {
    ...entry,
    cardReference: syncedCardReference,
  };
}

/**
 * Persist one CardReference definition.
 * This primitive is intentionally simple and can be reused by future workflows.
 * @param {object} input
 */
async function createCardReferenceDefinition(input) {
  const source = normalizeCardReferenceInput(input);
  const referenceFingerprint = buildReferenceFingerprint(source);

  source.referenceFingerprint = referenceFingerprint;

  const data = cardReferenceMapper.toPersistence(source);

  return cardReferenceRepository.create(data);
}

/**
 * Read one CardReference definition from its logical identity.
 * @param {object} input
 */
async function findCardReferenceByFingerprint(input) {
  const source = normalizeCardReferenceInput(input);
  const referenceFingerprint = buildReferenceFingerprint(source);

  return cardReferenceRepository.findByReferenceFingerprint(referenceFingerprint);
}

async function findCardReferenceByExternalIdentifier(field, value) {
  if (!isSupportedExternalIdentifierField(field)) {
    throw new Error("Unsupported external identifier field.");
  }

  const normalizedValue = normalizeExternalIdentifierValue(value);

  if (normalizedValue === "") {
    return null;
  }

  return cardReferenceRepository.findByExternalIdentifier(field, normalizedValue);
}

function buildCardReferenceEnrichmentPatch(existingCardReference, incomingCardReference) {
  const patch = {};

  for (const field of ENRICHABLE_STRING_FIELDS) {
    if (isBlankValue(existingCardReference[field]) && !isBlankValue(incomingCardReference[field])) {
      patch[field] = incomingCardReference[field];
    }
  }

  for (const field of ENRICHABLE_INTEGER_FIELDS) {
    if (
      (existingCardReference[field] === null || existingCardReference[field] === undefined)
      && Number.isInteger(incomingCardReference[field])
    ) {
      patch[field] = incomingCardReference[field];
    }
  }

  for (const field of ENRICHABLE_BOOLEAN_FIELDS) {
    if (existingCardReference[field] === false && incomingCardReference[field] === true) {
      patch[field] = true;
    }
  }

  return patch;
}

async function enrichCardReference(existingCardReference, input) {
  const incomingCardReference = normalizeCardReferenceInput(input);
  const patch = buildCardReferenceEnrichmentPatch(
    existingCardReference,
    incomingCardReference
  );

  if (Object.keys(patch).length === 0) {
    return existingCardReference;
  }

  return cardReferenceRepository.updateById(existingCardReference.id, patch);
}

async function synchronizeKnownExternalIdentifiers(cardReference, input) {
  let currentCardReference = cardReference;

  for (const field of EXTERNAL_IDENTIFIER_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(input || {}, field)) {
      continue;
    }

    currentCardReference = await syncExternalIdentifier(
      currentCardReference,
      field,
      input[field]
    );
  }

  return currentCardReference;
}

/**
 * Find an existing CardReference definition from logical identity
 * or create it if it does not exist.
 * @param {object} input
 */
async function findOrCreateCardReference(input) {
  const normalizedInput = normalizeCardReferenceInput(input);
  const existingCardReference = await findCardReferenceByFingerprint(normalizedInput);

  if (existingCardReference) {
    const enrichedCardReference = await enrichCardReference(
      existingCardReference,
      normalizedInput
    );

    return synchronizeKnownExternalIdentifiers(enrichedCardReference, normalizedInput);
  }

  try {
    const createdCardReference = await createCardReferenceDefinition(normalizedInput);

    return synchronizeKnownExternalIdentifiers(createdCardReference, normalizedInput);
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const cardReferenceAfterRace = await findCardReferenceByFingerprint(normalizedInput);

    if (!cardReferenceAfterRace) {
      throw error;
    }

    const enrichedCardReference = await enrichCardReference(
      cardReferenceAfterRace,
      normalizedInput
    );

    return synchronizeKnownExternalIdentifiers(enrichedCardReference, normalizedInput);
  }
}

/**
 * Read one CardReference definition from SportsCardsPro external identity.
 * @param {string|number} sportsCardsProId
 */
async function findCardReferenceBySportsCardsProId(sportsCardsProId) {
  if (isBlankIdentifier(sportsCardsProId)) {
    return null;
  }

  return cardReferenceRepository.findBySportsCardsProId(sportsCardsProId);
}

/**
 * Read one CardReference definition from TCDB external identity.
 * @param {string|number} tcdbId
 */
async function findCardReferenceByTcdbId(tcdbId) {
  if (isBlankIdentifier(tcdbId)) {
    return null;
  }

  return cardReferenceRepository.findByTcdbId(tcdbId);
}

/**
 * Attach one external identifier to an existing CardReference.
 * @param {string} cardReferenceId
 * @param {string} field
 * @param {string} value
 */
async function attachExternalIdentifier(cardReferenceId, field, value) {
  if (isBlankIdentifier(cardReferenceId)) {
    throw new Error("Card reference id is required.");
  }

  if (!isSupportedExternalIdentifierField(field)) {
    throw new Error("Unsupported external identifier field.");
  }

  const normalizedValue = normalizeExternalIdentifierValue(value);

  if (normalizedValue === "") {
    throw new Error("External identifier value is required.");
  }

  const alreadyLinkedCardReference = await findCardReferenceByExternalIdentifier(
    field,
    normalizedValue
  );

  if (alreadyLinkedCardReference && alreadyLinkedCardReference.id !== cardReferenceId) {
    throw new Error(`External identifier conflict on field ${field}.`);
  }

  return cardReferenceRepository.updateExternalIdentifier(
    cardReferenceId,
    field,
    normalizedValue
  );
}

/**
 * Attach one external identifier only when it is currently missing.
 * @param {object} cardReference
 * @param {string} field
 * @param {string} value
 */
async function syncExternalIdentifier(cardReference, field, value) {
  if (!cardReference || typeof cardReference !== "object") {
    throw new Error("Card reference is required.");
  }

  if (isBlankIdentifier(cardReference.id)) {
    throw new Error("Card reference id is required.");
  }

  if (!isSupportedExternalIdentifierField(field)) {
    throw new Error("Unsupported external identifier field.");
  }

  const normalizedValue = normalizeExternalIdentifierValue(value);

  if (normalizedValue === "") {
    return cardReference;
  }

  const currentValue = normalizeExternalIdentifierValue(cardReference[field]);

  if (currentValue !== "") {
    if (currentValue === normalizedValue) {
      return cardReference;
    }

    throw new Error(`CardReference already bound to a different ${field}.`);
  }

  return attachExternalIdentifier(cardReference.id, field, normalizedValue);
}

module.exports = {
  getFoundationMetadata,
  prepareCardReference,
  prepareCardReferenceEntry,
  findCardReferenceBySportsCardsProId,
  findCardReferenceByTcdbId,
  findCardReferenceByExternalIdentifier,
  findOrCreateCardReference,
  syncExternalIdentifier,
};
