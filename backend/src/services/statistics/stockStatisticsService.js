const statisticsRepository = require("./statisticsRepository");
const {
  toNumber,
  ratio,
  normalizeKey,
} = require("./statisticsCore");

function computeAgeInDays(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - created.getTime()) / 86400000));
}

async function getStockStatistics(filters = {}) {
  const olderThanDays = Math.max(1, Number(filters.olderThanDays || 180));
  const lowStockMax = Math.max(0, Number(filters.lowStockMax || 1));
  const highStockMin = Math.max(lowStockMax + 1, Number(filters.highStockMin || 10));

  const olderThanDate = new Date();
  olderThanDate.setDate(olderThanDate.getDate() - olderThanDays);

  const [
    aggregate,
    inStockInventory,
    neverSoldCards,
    cardsSalesOccurrences,
    oldCards,
    cardsWithoutSalePrice,
    cardsWithoutMarketValue,
    lowStockCards,
    highStockCards,
    soldQuantityTotal,
  ] = await Promise.all([
    statisticsRepository.getInStockInventoryAggregate(),
    statisticsRepository.getInStockInventory(),
    statisticsRepository.countNeverSoldCardsInStock(),
    statisticsRepository.getCardsSalesOccurrences(),
    statisticsRepository.countOldCardsInStock(olderThanDate),
    statisticsRepository.countCardsWithoutSalePriceInStock(),
    statisticsRepository.countCardsWithoutMarketValueInStock(),
    statisticsRepository.countLowStockCardsInStock(lowStockMax),
    statisticsRepository.countHighStockCardsInStock(highStockMin),
    statisticsRepository.getSoldQuantityTotal(),
  ]);

  const soldOnceCards = cardsSalesOccurrences.filter(
    (entry) => toNumber(entry?._count?.inventoryId) === 1
  ).length;

  const stockBySportMap = new Map();
  const stockByBrandMap = new Map();

  let valeurAchatStock = 0;
  let valeurVenteStock = 0;
  let valeurMarcheStock = 0;
  let sumAgeDays = 0;
  let minAgeDays = Number.POSITIVE_INFINITY;
  let maxAgeDays = 0;

  for (const item of inStockInventory) {
    const quantity = toNumber(item.quantity);
    const unitCost = toNumber(item.purchasePrice);
    const unitSaleValue = toNumber(item.salePrice);
    const unitMarketValue = toNumber(item.marketValueEur);

    const totalCost = unitCost * quantity;
    const totalSaleValue = unitSaleValue * quantity;
    const totalMarketValue = unitMarketValue * quantity;
    const ageDays = computeAgeInDays(item.createdAt);

    valeurAchatStock += totalCost;
    valeurVenteStock += totalSaleValue;
    valeurMarcheStock += totalMarketValue;
    sumAgeDays += ageDays;
    minAgeDays = Math.min(minAgeDays, ageDays);
    maxAgeDays = Math.max(maxAgeDays, ageDays);

    const sportKey = normalizeKey(item.sport);
    const brandKey = normalizeKey(item.brand);

    if (!stockBySportMap.has(sportKey)) {
      stockBySportMap.set(sportKey, {
        key: sportKey,
        nombreCartes: 0,
        quantite: 0,
        valeurAchat: 0,
        valeurVente: 0,
        valeurMarche: 0,
      });
    }

    if (!stockByBrandMap.has(brandKey)) {
      stockByBrandMap.set(brandKey, {
        key: brandKey,
        nombreCartes: 0,
        quantite: 0,
        valeurAchat: 0,
        valeurVente: 0,
        valeurMarche: 0,
      });
    }

    const sportEntry = stockBySportMap.get(sportKey);
    sportEntry.nombreCartes += 1;
    sportEntry.quantite += quantity;
    sportEntry.valeurAchat += totalCost;
    sportEntry.valeurVente += totalSaleValue;
    sportEntry.valeurMarche += totalMarketValue;

    const brandEntry = stockByBrandMap.get(brandKey);
    brandEntry.nombreCartes += 1;
    brandEntry.quantite += quantity;
    brandEntry.valeurAchat += totalCost;
    brandEntry.valeurVente += totalSaleValue;
    brandEntry.valeurMarche += totalMarketValue;
  }

  const quantiteTotale = toNumber(aggregate?._sum?.quantity);
  const nombreTotalCartes = toNumber(aggregate?._count?.id);
  const beneficePotentiel = valeurMarcheStock - valeurAchatStock;
  const roiPotentiel = ratio(beneficePotentiel, valeurAchatStock);
  const rotationStock = ratio(soldQuantityTotal, soldQuantityTotal + quantiteTotale);

  return {
    olderThanDays,
    thresholds: {
      lowStockMax,
      highStockMin,
    },
    metrics: {
      nombreTotalCartes,
      quantiteTotale,
      valeurAchatStock,
      valeurVenteStock,
      valeurMarcheStock,
      beneficePotentiel,
      roiPotentiel,
      rotationStock,
      ageMoyenStock: nombreTotalCartes > 0 ? sumAgeDays / nombreTotalCartes : 0,
      ancienneteMaximale: maxAgeDays,
      ancienneteMinimale: Number.isFinite(minAgeDays) ? minAgeDays : 0,
      cartesJamaisVendues: neverSoldCards,
      cartesVenduesUneSeuleFois: soldOnceCards,
      cartesSansPrixVente: cardsWithoutSalePrice,
      cartesSansValeurMarche: cardsWithoutMarketValue,
      stockFaible: lowStockCards,
      stockEleve: highStockCards,
      cartesAnciennesEnStock: oldCards,
      valeurTotaleStock: valeurMarcheStock,
      coutTotalStock: valeurAchatStock,
      nombreCartes: nombreTotalCartes,
    },
    stockParSport: Array.from(stockBySportMap.values()).sort(
      (a, b) => b.valeurMarche - a.valeurMarche || b.quantite - a.quantite
    ),
    stockParMarque: Array.from(stockByBrandMap.values()).sort(
      (a, b) => b.valeurMarche - a.valeurMarche || b.quantite - a.quantite
    ),
  };
}

async function getStockDistribution(filters = {}) {
  const stock = await getStockStatistics(filters);
  const totalStockValue = toNumber(stock.metrics.valeurMarcheStock);

  const bySport = stock.stockParSport.map((row) => ({
    ...row,
    part: ratio(row.valeurMarche, totalStockValue),
  }));

  const byBrand = stock.stockParMarque.map((row) => ({
    ...row,
    part: ratio(row.valeurMarche, totalStockValue),
  }));

  return {
    olderThanDays: stock.olderThanDays,
    metrics: stock.metrics,
    bySport,
    byBrand,
  };
}

module.exports = {
  getStockStatistics,
  getStockDistribution,
};
