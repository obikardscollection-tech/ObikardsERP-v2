const cardReferenceMapper = require("../mappers/cardReferenceMapper");
const cardReferenceRepository = require("../repositories/cardReferenceRepository");
const {
  buildReferenceFingerprint,
} = require("./referenceFingerprintService");

const EXTERNAL_IDENTIFIER_FIELDS = new Set([
  "sportsCardsProId",
  "tcdbId",
  "beckettId",
  "psaPopulationId",
  "cardUuid",
]);

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

function isBlankIdentifier(value) {
  return value == null || String(value).trim() === "";
}

/**
 * Persist one CardReference definition.
 * This primitive is intentionally simple and can be reused by future workflows.
 * @param {object} input
 */
async function createCardReferenceDefinition(input) {
  const source = buildSource(input);
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
  const source = buildSource(input);
  const referenceFingerprint = buildReferenceFingerprint(source);

  return cardReferenceRepository.findByReferenceFingerprint(referenceFingerprint);
}

/**
 * Find an existing CardReference definition from logical identity
 * or create it if it does not exist.
 * @param {object} input
 */
async function findOrCreateCardReference(input) {
  const existingCardReference = await findCardReferenceByFingerprint(input);

  if (existingCardReference) {
    return existingCardReference;
  }

  return createCardReferenceDefinition(input);
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

  if (!EXTERNAL_IDENTIFIER_FIELDS.has(field)) {
    throw new Error("Unsupported external identifier field.");
  }

  if (isBlankIdentifier(value)) {
    throw new Error("External identifier value is required.");
  }

  return cardReferenceRepository.updateExternalIdentifier(
    cardReferenceId,
    field,
    value
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

  if (!isBlankIdentifier(cardReference[field])) {
    return cardReference;
  }

  return attachExternalIdentifier(cardReference.id, field, value);
}

module.exports = {
  getFoundationMetadata,
  createCardReferenceDefinition,
  findCardReferenceByFingerprint,
  findOrCreateCardReference,
  findCardReferenceBySportsCardsProId,
  findCardReferenceByTcdbId,
  attachExternalIdentifier,
  syncExternalIdentifier,
};
