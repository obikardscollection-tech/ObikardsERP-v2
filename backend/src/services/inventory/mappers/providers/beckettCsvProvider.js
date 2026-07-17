const { INVENTORY_CSV_BASE_SCHEMA } = require("./shared/inventoryCsvBaseSchema");

module.exports = {
  id: "beckett-csv",
  name: "Beckett CSV",
  version: "1.0.0",
  mapping: {
    schema: INVENTORY_CSV_BASE_SCHEMA,
    requiredFields: [],
    fieldTransforms: {},
  },
  detection: {
    signatures: {
      "beckett id": 8,
      "set name": 1,
      "card number": 5,
      "high value": 1,
    },
    requiredSignatures: [],
    optionalSignatures: [],
  },
};
