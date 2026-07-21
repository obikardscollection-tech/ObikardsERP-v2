const { createCardMatchingEngine } = require("./services/cardMatchingEngine");
const { createDefaultProviderRegistry, createProviderRegistry } = require("./providers");

const defaultEngine = createCardMatchingEngine({
  providerRegistry: createDefaultProviderRegistry(),
});

module.exports = {
  matchCard: defaultEngine.matchCard,
  createCardMatchingEngine,
  createDefaultProviderRegistry,
  createProviderRegistry,
};
