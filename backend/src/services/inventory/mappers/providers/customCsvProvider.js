const { INVENTORY_CSV_BASE_SCHEMA } = require("./shared/inventoryCsvBaseSchema");

module.exports = {
  id: "custom-csv",
  name: "Custom CSV",
  version: "1.0.0",
  mapping: {
    schema: INVENTORY_CSV_BASE_SCHEMA,
    requiredFields: [],
    // Extension points:
    // - provider-specific required field validation
    // - provider-specific field transforms
    fieldTransforms: {},
  },
  detection: {
    signatures: {},
    // Extension points:
    // - requiredSignatures for strict provider detection
    // - optionalSignatures for soft matching
    requiredSignatures: [],
    optionalSignatures: [],
  },
};
