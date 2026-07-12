const prisma = require("../../lib/prisma");

async function getMarketImportErrors() {
  const importErrors = await prisma.marketImportError.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return importErrors;
}

module.exports = {
  getMarketImportErrors,
};
