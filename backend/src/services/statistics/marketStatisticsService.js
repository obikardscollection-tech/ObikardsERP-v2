const statisticsRepository = require("./statisticsRepository");
const {
  toNumber,
  ratio,
  formatRange,
  buildTimeKey,
  resolveGranularity,
  getRangeFromFilters,
} = require("./statisticsCore");

function buildMarketEvolutionRows(snapshots, granularity, field) {
  const map = new Map();

  for (const snapshot of snapshots) {
    const period = buildTimeKey(snapshot.createdAt, granularity);
    const value = toNumber(snapshot[field]);

    if (!map.has(period)) {
      map.set(period, {
        period,
        total: 0,
        count: 0,
      });
    }

    const entry = map.get(period);
    entry.total += value;
    entry.count += 1;
  }

  return Array.from(map.values())
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((row) => ({
      period: row.period,
      value: row.count > 0 ? row.total / row.count : 0,
    }));
}

async function getMarketAnalysis(filters = {}) {
  const range = getRangeFromFilters(filters);
  const granularity = resolveGranularity(range, filters.granularity);
  const [snapshots, cardsWithSnapshots] = await Promise.all([
    statisticsRepository.getMarketSnapshots(range),
    statisticsRepository.getInventoryWithRecentMarketSnapshots(),
  ]);

  const dataAvailable = snapshots.length > 0;

  const evolutionValeurMarche = buildMarketEvolutionRows(snapshots, granularity, "valueEur");
  const variationRoi = buildMarketEvolutionRows(snapshots, granularity, "roi");
  const evolutionPrixMoyen = buildMarketEvolutionRows(snapshots, granularity, "valueEur");

  const cartesEnHausse = [];
  const cartesEnBaisse = [];
  const potentielRevente = [];
  const potentielInvestissement = [];

  for (const card of cardsWithSnapshots) {
    const latest = card.marketSnapshots[0] || null;
    const previous = card.marketSnapshots[1] || null;

    if (latest && previous) {
      const currentValue = toNumber(latest.valueEur);
      const previousValue = toNumber(previous.valueEur);
      const delta = currentValue - previousValue;
      const deltaPct = ratio(delta, previousValue);

      const payload = {
        id: card.id,
        sku: card.sku,
        title: card.title,
        player: card.player,
        sport: card.sport,
        brand: card.brand,
        year: card.year,
        valueEur: currentValue,
        previousValueEur: previousValue,
        variationEur: delta,
        variationPct: deltaPct,
      };

      if (delta >= 0) {
        cartesEnHausse.push(payload);
      } else {
        cartesEnBaisse.push(payload);
      }
    }

    const purchasePrice = toNumber(card.purchasePrice);
    const marketValue = toNumber(card.marketValueEur);
    const salePrice = toNumber(card.salePrice);
    const potentialResale = (salePrice || marketValue) - purchasePrice;

    potentielRevente.push({
      id: card.id,
      sku: card.sku,
      title: card.title,
      purchasePrice,
      salePrice,
      marketValue,
      potentielEur: potentialResale,
      roiPotentiel: ratio(potentialResale, purchasePrice),
    });

    const latestSnapshot = card.marketSnapshots[0] || null;
    potentielInvestissement.push({
      id: card.id,
      sku: card.sku,
      title: card.title,
      roiSnapshot: toNumber(latestSnapshot?.roi),
      profitSnapshot: toNumber(latestSnapshot?.profit),
      marketValue,
      purchasePrice,
    });
  }

  cartesEnHausse.sort((a, b) => b.variationEur - a.variationEur);
  cartesEnBaisse.sort((a, b) => a.variationEur - b.variationEur);
  potentielRevente.sort((a, b) => b.potentielEur - a.potentielEur);
  potentielInvestissement.sort((a, b) => b.roiSnapshot - a.roiSnapshot);

  return {
    range: formatRange(range),
    granularity,
    provider: "SPORTSCARDSPRO",
    dataAvailable,
    evolutionPrixMoyen: {
      available: dataAvailable,
      data: evolutionPrixMoyen,
    },
    evolutionValeurMarche: {
      available: dataAvailable,
      data: evolutionValeurMarche,
    },
    variationRoi: {
      available: dataAvailable,
      data: variationRoi,
    },
    cartesEnHausse: cartesEnHausse.slice(0, 50),
    cartesEnBaisse: cartesEnBaisse.slice(0, 50),
    potentielRevente: potentielRevente.slice(0, 50),
    potentielInvestissement: potentielInvestissement.slice(0, 50),
  };
}

module.exports = {
  getMarketAnalysis,
};
