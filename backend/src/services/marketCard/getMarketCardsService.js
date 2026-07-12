const prisma = require("../../lib/prisma");

async function getMarketCards() {
  const cards = await prisma.marketCard.findMany({
    orderBy: [
      {
        player: "asc",
      },
      {
        year: "desc",
      },
      {
        brand: "asc",
      },
    ],
  });

  return cards;
}

module.exports = {
  getMarketCards,
};