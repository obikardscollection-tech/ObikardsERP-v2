function addError(context, message) {
  if (!Array.isArray(context.errors)) {
    context.errors = [];
  }

  context.errors.push(message);
}

async function validateCsvEngineStage(context) {
  if (!context) {
    throw new Error("Le contexte CSV est introuvable.");
  }

  if (!context.metadata) {
    throw new Error("Les metadonnees du contexte CSV sont introuvables.");
  }

  if (!context.data || !Array.isArray(context.data.rawRows)) {
    throw new Error("Les donnees du contexte CSV sont introuvables.");
  }

  if (!Array.isArray(context.metadata.headers)) {
    throw new Error("Les en-tetes du contexte CSV sont introuvables.");
  }

  if (!context.stats) {
    throw new Error("Les statistiques du contexte CSV sont introuvables.");
  }

  if (context.metadata.headers.length === 0) {
    addError(context, "Impossible de detecter l'en-tete du fichier CSV.");
  }

  if (context.data.rawRows.length === 0) {
    addError(context, "Aucune ligne CSV n'a ete trouvee.");
  }

  if (context.errors.length === 0) {
    context.stats.validatedRows = context.data.rawRows.length;
  }

  return context;
}

module.exports = {
  validateCsvEngineStage,
};
