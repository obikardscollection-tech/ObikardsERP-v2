const INTERNALS = {
  DEFAULT_PROVIDER_ID: "sportscardspro",
};

function assertProvider(provider) {
  if (!provider || typeof provider !== "object" || Array.isArray(provider)) {
    throw new Error("Le provider de card matching est invalide.");
  }

  if (typeof provider.id !== "string" || provider.id.trim() === "") {
    throw new Error("Le provider de card matching doit definir un id.");
  }

  if (typeof provider.searchCards !== "function") {
    throw new Error("Le provider de card matching doit exposer searchCards(criteria).");
  }
}

function createProviderRegistry(providers = [], options = {}) {
  if (!Array.isArray(providers)) {
    throw new Error("La liste des providers de card matching est invalide.");
  }

  const providerMap = new Map();

  for (const provider of providers) {
    assertProvider(provider);

    const id = provider.id.trim().toLowerCase();

    if (providerMap.has(id)) {
      throw new Error(`Provider de card matching duplique: ${id}`);
    }

    providerMap.set(id, Object.freeze({ ...provider, id }));
  }

  const defaultProviderIdRaw =
    typeof options.defaultProviderId === "string" && options.defaultProviderId.trim() !== ""
      ? options.defaultProviderId
      : INTERNALS.DEFAULT_PROVIDER_ID;
  const defaultProviderId = defaultProviderIdRaw.trim().toLowerCase();

  if (!providerMap.has(defaultProviderId)) {
    throw new Error(`Provider par defaut introuvable: ${defaultProviderId}`);
  }

  function resolve(providerId) {
    if (providerId === undefined || providerId === null || providerId === "") {
      return providerMap.get(defaultProviderId);
    }

    if (typeof providerId !== "string") {
      throw new Error("L'identifiant provider est invalide.");
    }

    const normalizedId = providerId.trim().toLowerCase();
    const provider = providerMap.get(normalizedId);

    if (!provider) {
      throw new Error(`Provider de card matching inconnu: ${normalizedId}`);
    }

    return provider;
  }

  function list() {
    return Array.from(providerMap.values());
  }

  return Object.freeze({
    resolve,
    list,
    defaultProviderId,
  });
}

module.exports = {
  createProviderRegistry,
};
