const { INVENTORY_CSV_BASE_SCHEMA } = require("./shared/inventoryCsvBaseSchema");

module.exports = {
  id: "ludex-csv",
  name: "Ludex CSV",
  version: "1.0.0",
  mapping: {
    schema: INVENTORY_CSV_BASE_SCHEMA,
    requiredFields: [],
    fieldTransforms: {},
  },
  detection: {
    signatures: {
      "ludex id": 8,
      "estimated value": 1,
      collection: 1,
      "card number": 5,
    },
    requiredSignatures: [],
    optionalSignatures: [],
  },
};
