function createDefaults() {
  return {
    data: {
      rawRows: [],
      normalizedRows: [],
    },
    errors: [],
    warnings: [],
  };
}

module.exports = {
  createDefaults,
};
