const cardReferenceMapper = require("../mappers/cardReferenceMapper");
const cardReferenceRepository = require("../repositories/cardReferenceRepository");

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
  const data = cardReferenceMapper.toPersistence(input);

  return cardReferenceRepository.create(data);
}

module.exports = {
  getFoundationMetadata,
  createCardReferenceDefinition,
};
