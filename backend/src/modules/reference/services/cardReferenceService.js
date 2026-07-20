const cardReferenceMapper = require("../mappers/cardReferenceMapper");
const cardReferenceRepository = require("../repositories/cardReferenceRepository");
const {
  buildReferenceFingerprint,
} = require("./referenceFingerprintService");

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
  return input && typeof input === "object"
    ? { ...input }
    : {};
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

module.exports = {
  getFoundationMetadata,
  createCardReferenceDefinition,
  findCardReferenceByFingerprint,
};
