const prisma = require("../../lib/prisma");

async function getMarketSnapshots() {
  const snapshots = await prisma.marketSnapshot.findMany({
    orderBy: {
      synchronizedAt: "desc",
    },
  });

  return snapshots;
}

module.exports = {
  getMarketSnapshots,
};
