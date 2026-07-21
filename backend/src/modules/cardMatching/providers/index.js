const { createProviderRegistry } = require("./providerRegistry");
const sportsCardsProProvider = require("./sportsCardsProProvider");

function createDefaultProviderRegistry() {
  return createProviderRegistry([sportsCardsProProvider], {
    defaultProviderId: sportsCardsProProvider.id,
  });
}

module.exports = {
  createProviderRegistry,
  createDefaultProviderRegistry,
};
