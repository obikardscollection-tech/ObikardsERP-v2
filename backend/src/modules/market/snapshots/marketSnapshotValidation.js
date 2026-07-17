const INTERNALS = {
  FIELDS: {
    INVENTORY_ID: "inventoryId",
    REFRESH_RESULT: "refreshResult",
  },
};

/**
 * Ensure inventory identifier is present and non-empty.
 * @param {unknown} inventoryId
 */
function assertInventoryId(inventoryId) {
  if (typeof inventoryId !== "string" || inventoryId.trim() === "") {
    throw new Error("L'identifiant inventory du snapshot est invalide.");
  }
}

/**
 * Ensure refresh result is a plain object.
 * @param {unknown} refreshResult
 */
function assertRefreshResult(refreshResult) {
  if (!refreshResult || typeof refreshResult !== "object" || Array.isArray(refreshResult)) {
    throw new Error("Le resultat de refresh du snapshot est invalide.");
  }
}

/**
 * Ensure provider is present.
 * @param {unknown} provider
 */
function assertProvider(provider) {
  if (typeof provider !== "string" || provider.trim() === "") {
    throw new Error("Le provider du snapshot est invalide.");
  }
}

/**
 * Ensure currency is present.
 * @param {unknown} currency
 */
function assertCurrency(currency) {
  if (typeof currency !== "string" || currency.trim() === "") {
    throw new Error("La devise du snapshot est invalide.");
  }
}

/**
 * Validate snapshot creation input.
 * @param {{inventoryId:unknown, refreshResult:unknown}} input
 */
function validateMarketSnapshotInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Les parametres du snapshot marche sont invalides.");
  }

  assertInventoryId(input[INTERNALS.FIELDS.INVENTORY_ID]);
  assertRefreshResult(input[INTERNALS.FIELDS.REFRESH_RESULT]);

  const provider = input.refreshResult && input.refreshResult.marketValue
    ? input.refreshResult.marketValue.source
    : null;
  const currency = input.refreshResult && input.refreshResult.marketValue
    ? input.refreshResult.marketValue.currency
    : null;

  assertProvider(provider);
  assertCurrency(currency);
}

module.exports = {
  validateMarketSnapshotInput,
};
