const cardReferenceService = require("../services/cardReferenceService");

/**
 * Foundation controller entrypoint. Intentionally minimal for this sprint.
 */
async function getFoundationMetadata(req, res) {
  try {
    const metadata = cardReferenceService.getFoundationMetadata();

    return res.status(200).json(metadata);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  getFoundationMetadata,
};
