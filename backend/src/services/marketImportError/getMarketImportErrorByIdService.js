const prisma = require("../../lib/prisma");

async function getMarketImportErrorById(id) {
  const importError = await prisma.marketImportError.findUnique({
    where: {
      id,
    },
  });

  if (!importError) {
    throw new Error("MarketImportError introuvable.");
  }

  return importError;
}

module.exports = {
  getMarketImportErrorById,
};
