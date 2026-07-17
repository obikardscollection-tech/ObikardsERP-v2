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

/**
 * Persist one CardReference definition.
 * This primitive is intentionally simple and can be reused by future workflows.
 * @param {object} input
 */
async function createCardReferenceDefinition(input) {
  const source =
    input && typeof input === "object"
      ? { ...input }
      : {};
  const referenceFingerprint = buildReferenceFingerprint(source);

  source.referenceFingerprint = referenceFingerprint;

  const data = cardReferenceMapper.toPersistence(source);

  return cardReferenceRepository.create(data);
}

module.exports = {
  getFoundationMetadata,
  createCardReferenceDefinition,
};
