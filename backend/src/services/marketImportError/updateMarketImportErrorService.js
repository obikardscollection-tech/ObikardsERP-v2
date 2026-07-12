const prisma = require("../../lib/prisma");

async function updateMarketImportError(id, data) {
  const importError = await prisma.marketImportError.findUnique({
    where: {
      id,
    },
  });

  if (!importError) {
    throw new Error("MarketImportError introuvable.");
  }

  const updatedImportError = await prisma.marketImportError.update({
    where: {
      id,
    },
    data: {
      marketImportJobId: data.marketImportJobId,

      lineNumber: data.lineNumber,

      providerCardId: data.providerCardId,

      field: data.field,

      errorCode: data.errorCode,

      message: data.message,

      rawData: data.rawData,

      resolved: data.resolved,
    },
  });

  return updatedImportError;
}

module.exports = {
  updateMarketImportError,
};
