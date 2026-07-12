const prisma = require("../../lib/prisma");

async function deleteMarketImportError(id) {
  const importError = await prisma.marketImportError.findUnique({
    where: {
      id,
    },
  });

  if (!importError) {
    throw new Error("MarketImportError introuvable.");
  }

  await prisma.marketImportError.delete({
    where: {
      id,
    },
  });

  return {
    message: "MarketImportError supprimé avec succès.",
  };
}

module.exports = {
  deleteMarketImportError,
};
