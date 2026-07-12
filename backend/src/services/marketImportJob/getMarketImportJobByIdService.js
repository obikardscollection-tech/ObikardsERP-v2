const prisma = require("../../lib/prisma");

async function getMarketImportJobById(id) {
  const importJob = await prisma.marketImportJob.findUnique({
    where: {
      id,
    },
  });

  if (!importJob) {
    throw new Error("MarketImportJob introuvable.");
  }

  return importJob;
}

module.exports = {
  getMarketImportJobById,
};
