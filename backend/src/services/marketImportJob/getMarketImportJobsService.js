const prisma = require("../../lib/prisma");

async function getMarketImportJobs() {
  const importJobs = await prisma.marketImportJob.findMany({
    orderBy: {
      startedAt: "desc",
    },
  });

  return importJobs;
}

module.exports = {
  getMarketImportJobs,
};
