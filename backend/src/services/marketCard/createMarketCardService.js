const prisma = require("../../lib/prisma");

async function createMarketCard(data) {
  const card = await prisma.marketCard.create({
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

      rookie: data.rookie ?? false,
      autograph: data.autograph ?? false,
      memorabilia: data.memorabilia ?? false,
      serialNumbered: data.serialNumbered ?? false,

      printRun: data.printRun,

      language: data.language ?? "EN",
      country: data.country,

      releaseDate: data.releaseDate,

      slug: data.slug,
      fingerprint: data.fingerprint,
      searchText: data.searchText,

      active: data.active ?? true,
    },
  });

  return card;
}

module.exports = {
  createMarketCard,
};