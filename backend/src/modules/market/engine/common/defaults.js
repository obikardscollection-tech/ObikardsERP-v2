function createDefaults() {
  return {
    data: {
      rawRows: [],
      normalizedRows: [],
      matchedRows: [],
    },
    errors: [],
    warnings: [],
  };
}

module.exports = {
  createDefaults,
};
