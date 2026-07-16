const { getSportsCardsProProduct } = require("./sportsCardsProProductService");

/**
 * Ensure SportsCardsPro identifier is present and non-empty.
 * @param {unknown} sportsCardsProId
 */
function assertSportsCardsProId(sportsCardsProId) {
  if (typeof sportsCardsProId !== "string" || sportsCardsProId.trim() === "") {
    throw new Error("L'identifiant SportsCardsPro est invalide.");
  }
}

/**
 * Retrieve SportsCardsPro card details for a linked card and return raw JSON.
 * @param {string} sportsCardsProId
 * @returns {Promise<unknown>}
 */
async function getSportsCardsProCardDetails(sportsCardsProId) {
  assertSportsCardsProId(sportsCardsProId);

  return getSportsCardsProProduct(sportsCardsProId);
}

module.exports = {
  getSportsCardsProCardDetails,
};
