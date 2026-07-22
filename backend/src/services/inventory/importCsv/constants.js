const { INVENTORY_CSV_PROVIDERS } = require("../mappers/inventoryCsvMapper");

const INTERNALS = {
  TEMP_PREFIX: "obikards-inventory-import-",
  ALLOWED_MIME_TYPES: [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
  ],
  REPORT: {
    SUCCESS: true,
    TOTAL_ROWS: 0,
    CREATED: 0,
    UPDATED: 0,
    FAILED: 0,
    SKIPPED: 0,
    DUPLICATES: 0,
    WARNINGS: [],
  },
  ERRORS: {
    CSV_REQUIRED: "Le fichier CSV est requis.",
    CSV_INVALID_EXTENSION: "Le fichier uploadé doit avoir l'extension .csv.",
    CSV_INVALID_MIMETYPE: "Le type MIME du fichier doit correspondre à un CSV.",
    MATCHED_ROWS_NOT_FOUND: "Les lignes matchees du CSV sont introuvables.",
    EMPTY_ROW: "Ligne CSV vide ou invalide.",
    CONFLICTING_MATCHES: "Plusieurs correspondances detectees, validation manuelle requise.",
    NO_MATCH: "Aucune correspondance detectee.",
    DUPLICATE_ROW: "Ligne en doublon detectee dans le fichier.",
  },
  WARNINGS: {
    PROVIDER_FALLBACK: "Aucun provider specifique detecte: fallback CUSTOM_CSV applique.",
    MISSING_CRITICAL_COLUMNS:
      "Colonnes critiques manquantes detectees dans le CSV.",
  },
  DATA_KEYS: {
    MATCHED_ROWS: "matchedRows",
  },
  METADATA_KEYS: {
    HEADERS: "headers",
  },
  PROVIDERS: {
    DEFAULT: INVENTORY_CSV_PROVIDERS.CUSTOM_CSV,
  },
  PREVIEW: {
    SAMPLE_SIZE: 20,
  },
  MATCHING: {
    STATUS: {
      SINGLE: "SINGLE_MATCH",
      MULTIPLE: "MULTIPLE_MATCHES",
      NONE: "NO_MATCH",
      UNKNOWN: "UNKNOWN",
    },
  },
  REQUIRED_COLUMN_GROUPS: [
    {
      key: "player",
      aliases: ["player", "joueur", "athlete", "name", "nom"],
    },
    {
      key: "set",
      aliases: ["set", "series", "serie", "collection"],
    },
    {
      key: "cardNumber",
      aliases: ["cardnumber", "number", "numero", "no", "#"],
    },
  ],
};

module.exports = {
  INTERNALS,
};
