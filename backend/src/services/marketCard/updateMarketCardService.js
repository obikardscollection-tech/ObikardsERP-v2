const prisma = require("../../lib/prisma");

async function updateMarketCard(id, data) {
  const card = await prisma.marketCard.findUnique({
    where: {
      id,
    },
  });

  if (!card) {
    throw new Error("MarketCard introuvable.");
  }

  const updatedCard = await prisma.marketCard.update({
    where: {
      id,
    },
    data: {
      sport: data.sport,
      league: data.league,

      player: data.player,
      team: data.team,

      brand: data.brand,
      set: data.set,
      subset: data.subset,

      year: data.year,

      productName: data.productName,

      cardNumber: data.cardNumber,

      parallel: data.parallel,
      variation: data.variation,

      rookie: data.rookie,
      autograph: data.autograph,
      memorabilia: data.memorabilia,
      serialNumbered: data.serialNumbered,

      printRun: data.printRun,

      language: data.language,
      country: data.country,

      releaseDate: data.releaseDate,

      slug: data.slug,
      fingerprint: data.fingerprint,
      searchText: data.searchText,

      active: data.active,
    },
  });

  return updatedCard;
}

module.exports = {
  updateMarketCard,
};