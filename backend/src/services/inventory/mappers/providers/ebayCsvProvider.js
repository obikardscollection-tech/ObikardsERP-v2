const { INVENTORY_CSV_BASE_SCHEMA } = require("./shared/inventoryCsvBaseSchema");

module.exports = {
  id: "ebay-csv",
  name: "eBay CSV",
  version: "1.0.0",
  mapping: {
    schema: INVENTORY_CSV_BASE_SCHEMA,
    requiredFields: [],
    fieldTransforms: {},
  },
  detection: {
    signatures: {
      "item title": 6,
      "final value fee": 1,
      "buyer username": 6,
      "sale date": 1,
    },
    requiredSignatures: [],
    optionalSignatures: [],
  },
};
