const prisma = require("../../lib/prisma");

async function updateProvider(id, data) {
  const provider = await prisma.marketProvider.findUnique({
    where: {
      id,
    },
  });

  if (!provider) {
    throw new Error("Provider introuvable.");
  }

  const updatedProvider = await prisma.marketProvider.update({
    where: {
      id,
    },
    data: {
      code: data.code,
      name: data.name,
      type: data.type,

      priority: data.priority,
      enabled: data.enabled,

      supportsCsv: data.supportsCsv,
      supportsApi: data.supportsApi,

      apiDailyLimit: data.apiDailyLimit,
      apiCallsToday: data.apiCallsToday,

      lastCsvSync: data.lastCsvSync,
      lastApiSync: data.lastApiSync,
    },
  });

  return updatedProvider;
}

module.exports = {
  updateProvider,
};