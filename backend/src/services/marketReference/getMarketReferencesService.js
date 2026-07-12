const prisma = require("../../lib/prisma");

async function getMarketReferences() {
  const references = await prisma.marketReference.findMany({
    orderBy: [
      {
        type: "asc",
      },
      {
        value: "asc",
      },
    ],
  });

  return references;
}

module.exports = {
  getMarketReferences,
};
