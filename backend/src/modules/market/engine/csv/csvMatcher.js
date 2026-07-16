function cloneRow(row) {
  if (typeof structuredClone === "function") {
    return structuredClone(row);
  }

  return JSON.parse(JSON.stringify(row));
}

async function matchCsvEngineStage(context) {
  if (!context) {
    throw new Error("Le contexte CSV est introuvable.");
  }

  if (!context.data) {
    throw new Error("Les donnees du contexte CSV sont introuvables.");
  }

  if (!Array.isArray(context.data.normalizedRows)) {
    throw new Error("Les lignes normalisees du contexte CSV sont introuvables.");
  }

  if (!Array.isArray(context.data.matchedRows)) {
    throw new Error("Les lignes matchees du contexte CSV sont introuvables.");
  }

  context.data.matchedRows = context.data.normalizedRows.map((row) => cloneRow(row));

  return context;
}

module.exports = {
  matchCsvEngineStage,
};
