const { createRuntime } = require("./runtime");
const { createMetadata } = require("./metadata");
const { createStats } = require("./stats");
const { createDefaults } = require("./defaults");

function createMarketEngineContext(input = {}) {
  const defaults = createDefaults();
  const filePath = input.filePath;

  return {
    provider: input.provider,
    filePath,
    metadata: createMetadata(filePath),
    runtime: createRuntime(),
    stats: createStats(),
    data: defaults.data,
    errors: defaults.errors,
    warnings: defaults.warnings,
  };
}

module.exports = {
  createMarketEngineContext,
};
