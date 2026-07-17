/**
 * Ensure stage context is present.
 * @param {unknown} context
 */
function assertContext(context) {
  if (!context) {
    throw new Error("Le contexte CSV est introuvable.");
  }
}

/**
 * Ensure stage data container is present.
 * @param {unknown} data
 */
function assertContextData(data) {
  if (!data) {
    throw new Error("Les donnees du contexte CSV sont introuvables.");
  }
}

/**
 * Ensure import payload is present.
 * @param {unknown} importPayload
 */
function assertImport(importPayload) {
  if (!importPayload) {
    throw new Error("L'import du contexte CSV est introuvable.");
  }
}

/**
 * Ensure snapshot payload is present.
 * @param {unknown} snapshot
 */
function assertSnapshot(snapshot) {
  if (!snapshot) {
    throw new Error("Le snapshot du contexte CSV est introuvable.");
  }
}

/**
 * Ensure history registry is present.
 * @param {unknown} history
 */
function assertHistory(history) {
  if (!history) {
    throw new Error("L'historique du contexte CSV est introuvable.");
  }
}

/**
 * Ensure reference registry is present.
 * @param {unknown} referenceRegistry
 */
function assertReferenceRegistry(referenceRegistry) {
  if (!referenceRegistry) {
    throw new Error("Le registre de references du contexte CSV est introuvable.");
  }
}

/**
 * Ensure analytics registry is present.
 * @param {unknown} analytics
 */
function assertAnalytics(analytics) {
  if (!analytics) {
    throw new Error("Le registre analytics du contexte CSV est introuvable.");
  }
}

/**
 * Ensure import job document is present.
 * @param {unknown} importJob
 */
function assertImportJob(importJob) {
  if (!importJob) {
    throw new Error("Le document import job du contexte CSV est introuvable.");
  }
}

module.exports = {
  assertContext,
  assertContextData,
  assertImport,
  assertSnapshot,
  assertHistory,
  assertReferenceRegistry,
  assertAnalytics,
  assertImportJob,
};