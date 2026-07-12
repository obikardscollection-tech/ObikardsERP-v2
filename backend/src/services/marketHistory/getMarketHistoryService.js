const prisma = require("../../lib/prisma");

async function getMarketHistory() {
  const history = await prisma.marketHistory.findMany({
    orderBy: {
      synchronizedAt: "desc",
    },
  });

  return history;
}

module.exports = {
  getMarketHistory,
};
