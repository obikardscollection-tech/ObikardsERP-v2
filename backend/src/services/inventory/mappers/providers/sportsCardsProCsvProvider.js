const { INVENTORY_CSV_BASE_SCHEMA } = require("./shared/inventoryCsvBaseSchema");

module.exports = {
  id: "sportscardspro-csv",
  name: "SportsCardsPro CSV",
  version: "1.0.0",
  mapping: {
    // Compatibility strategy: currently reuse generic inventory mapping schema.
    schema: INVENTORY_CSV_BASE_SCHEMA,
    requiredFields: [],
    fieldTransforms: {},
  },
  detection: {
    signatures: {
      player: 1,
      "card #": 5,
      set: 2,
      grade: 4,
      sport: 1,
    },
    requiredSignatures: [],
    optionalSignatures: [],
  },
};
