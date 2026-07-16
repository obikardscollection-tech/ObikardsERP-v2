function normalizeValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue === "" ? null : trimmedValue;
  }

  return value;
}

function normalizeRow(row) {
  const normalizedRow = {};

  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = String(key).trim();
    normalizedRow[normalizedKey] = normalizeValue(value);
  }

  return normalizedRow;
}

async function normalizeCsvEngineStage(context) {
  if (!context) {
    throw new Error("Le contexte CSV est introuvable.");
  }

  if (!context.data) {
    throw new Error("Les donnees du contexte CSV sont introuvables.");
  }

  if (!Array.isArray(context.data.rawRows)) {
    throw new Error("Les lignes brutes du contexte CSV sont introuvables.");
  }

  if (!Array.isArray(context.data.normalizedRows)) {
    throw new Error("Les lignes normalisees du contexte CSV sont introuvables.");
  }

  const rawRows = context.data.rawRows;

  context.data.normalizedRows = rawRows.map((row) => normalizeRow(row));

  return context;
}

module.exports = {
  normalizeCsvEngineStage,
};
