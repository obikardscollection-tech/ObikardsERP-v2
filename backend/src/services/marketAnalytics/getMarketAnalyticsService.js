const prisma = require("../../lib/prisma");

async function getMarketAnalytics() {
  const analytics = await prisma.marketAnalytics.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return analytics;
}

module.exports = {
  getMarketAnalytics,
};
