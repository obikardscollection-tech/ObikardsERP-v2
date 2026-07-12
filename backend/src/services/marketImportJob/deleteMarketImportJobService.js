const prisma = require("../../lib/prisma");

async function deleteMarketImportJob(id) {
  const importJob = await prisma.marketImportJob.findUnique({
    where: {
      id,
    },
  });

  if (!importJob) {
    throw new Error("MarketImportJob introuvable.");
  }

  await prisma.marketImportJob.delete({
    where: {
      id,
    },
  });

  return {
    message: "MarketImportJob supprimé avec succès.",
  };
}

module.exports = {
  deleteMarketImportJob,
};
