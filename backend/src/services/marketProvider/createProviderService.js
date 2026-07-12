const prisma = require("../../lib/prisma");

async function createProvider(data) {
  const provider = await prisma.marketProvider.create({
    data: {
      code: data.code,
      name: data.name,
      type: data.type,

      priority: data.priority ?? 0,
      enabled: data.enabled ?? true,

      supportsCsv: data.supportsCsv ?? false,
      supportsApi: data.supportsApi ?? false,

      apiDailyLimit: data.apiDailyLimit ?? null,
      apiCallsToday: data.apiCallsToday ?? 0,

      lastCsvSync: data.lastCsvSync ?? null,
      lastApiSync: data.lastApiSync ?? null,
    },
  });

  return provider;
}

module.exports = {
  createProvider,
};