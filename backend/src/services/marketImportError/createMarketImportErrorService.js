const prisma = require("../../lib/prisma");

async function createMarketImportError(data) {
  const importError = await prisma.marketImportError.create({
    data: {
      marketImportJobId: data.marketImportJobId,

      lineNumber: data.lineNumber ?? null,

      providerCardId: data.providerCardId ?? null,

      field: data.field ?? null,

      errorCode: data.errorCode ?? null,

      message: data.message,

      rawData: data.rawData ?? null,

      resolved: data.resolved ?? false,
    },
  });

  return importError;
}

module.exports = {
  createMarketImportError,
};
