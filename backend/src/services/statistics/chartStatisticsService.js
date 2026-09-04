const statisticsRepository = require("./statisticsRepository");
const {
  toNumber,
  ratio,
  formatRange,
  buildTimeKey,
  resolveGranularity,
  getRangeFromFilters,
} = require("./statisticsCore");

function bucketSales(entries, granularity) {
  const bucketMap = new Map();

  for (const entry of entries) {
    const period = buildTimeKey(entry.soldAt, granularity);

    if (!bucketMap.has(period)) {
      bucketMap.set(period, {
        period,
        chiffreAffaires: 0,
        benefice: 0,
        coutAchat: 0,
        ventes: 0,
        quantiteVendue: 0,
      });
    }

    const bucket = bucketMap.get(period);
    const revenue = toNumber(entry.totalAmount);
    const grossProfit = toNumber(entry.profit);
    const soldItems = toNumber(entry.totalItems);

    bucket.chiffreAffaires += revenue;
    bucket.benefice += grossProfit;
    bucket.coutAchat += revenue - grossProfit;
    bucket.ventes += 1;
    bucket.quantiteVendue += soldItems;
  }

  return Array.from(bucketMap.values()).sort((a, b) => a.period.localeCompare(b.period));
}

function bucketPurchases(entries, granularity) {
  const bucketMap = new Map();

  for (const entry of entries) {
    const period = buildTimeKey(entry.purchasedAt, granularity);

    if (!bucketMap.has(period)) {
      bucketMap.set(period, {
        period,
        montantAchat: 0,
        quantiteAchetee: 0,
      });
    }

    const bucket = bucketMap.get(period);
    bucket.montantAchat += toNumber(entry.totalAmount);
    bucket.quantiteAchetee += toNumber(entry.totalItems);
  }

  return Array.from(bucketMap.values()).sort((a, b) => a.period.localeCompare(b.period));
}

function bucketExpenses(entries, granularity) {
  const bucketMap = new Map();

  for (const entry of entries) {
    const period = buildTimeKey(entry.expenseDate, granularity);

    if (!bucketMap.has(period)) {
      bucketMap.set(period, {
        period,
        montantHT: 0,
        tva: 0,
        montantTTC: 0,
        nombreDepenses: 0,
      });
    }

    const bucket = bucketMap.get(period);
    bucket.montantHT += toNumber(entry.amountHT);
    bucket.tva += toNumber(entry.tax);
    bucket.montantTTC += toNumber(entry.amountTTC);
    bucket.nombreDepenses += 1;
  }

  return Array.from(bucketMap.values()).sort((a, b) => a.period.localeCompare(b.period));
}

function bucketStockMovements(entries, granularity) {
  const bucketMap = new Map();

  for (const entry of entries) {
    const period = buildTimeKey(entry.createdAt, granularity);

    if (!bucketMap.has(period)) {
      bucketMap.set(period, {
        period,
        entree: 0,
        sortie: 0,
        net: 0,
      });
    }

    const bucket = bucketMap.get(period);
    const qty = toNumber(entry.quantity);
    const isOutput = entry.type === "SALE" || entry.type === "EXPORT" || entry.type === "TRANSFER";

    if (isOutput) {
      bucket.sortie += qty;
      bucket.net -= qty;
    } else {
      bucket.entree += qty;
      bucket.net += qty;
    }
  }

  const rows = Array.from(bucketMap.values()).sort((a, b) => a.period.localeCompare(b.period));
  let cumulative = 0;

  return rows.map((row) => {
    cumulative += row.net;

    return {
      ...row,
      cumul: cumulative,
    };
  });
}

function mapSalesEvolutionMetric(rows, metric) {
  if (metric === "revenue") {
    return rows.map((row) => ({ period: row.period, value: row.chiffreAffaires }));
  }

  if (metric === "profit") {
    return rows.map((row) => ({ period: row.period, value: row.benefice }));
  }

  if (metric === "margin") {
    return rows.map((row) => ({ period: row.period, value: ratio(row.benefice, row.chiffreAffaires) }));
  }

  if (metric === "roi") {
    return rows.map((row) => ({ period: row.period, value: ratio(row.benefice, row.coutAchat) }));
  }

  if (metric === "sales") {
    return rows.map((row) => ({ period: row.period, value: row.ventes }));
  }

  if (metric === "benefits") {
    return rows.map((row) => ({ period: row.period, value: row.benefice }));
  }

  return rows.map((row) => ({ period: row.period, value: row.quantiteVendue }));
}

async function getChartEvolution(metric, filters = {}) {
  const range = getRangeFromFilters(filters);
  const granularity = resolveGranularity(range, filters.granularity);

  if (["purchases"].includes(metric)) {
    const purchases = await statisticsRepository.getPurchasesTimeline(range);
    const rows = bucketPurchases(purchases, granularity);

    return {
      range: formatRange(range),
      granularity,
      metric,
      data: rows.map((row) => ({ period: row.period, value: row.montantAchat })),
      meta: {
        quantites: rows.map((row) => ({ period: row.period, value: row.quantiteAchetee })),
      },
    };
  }

  if (["stock"].includes(metric)) {
    const movements = await statisticsRepository.getStockMovementsTimeline(range);
    const rows = bucketStockMovements(movements, granularity);

    return {
      range: formatRange(range),
      granularity,
      metric,
      data: rows.map((row) => ({ period: row.period, value: row.cumul })),
      meta: {
        net: rows.map((row) => ({ period: row.period, value: row.net })),
        entries: rows.map((row) => ({ period: row.period, value: row.entree })),
        outputs: rows.map((row) => ({ period: row.period, value: row.sortie })),
      },
    };
  }

  const entries = await statisticsRepository.getSalesTimeline(range);
  const rows = bucketSales(entries, granularity);

  return {
    range: formatRange(range),
    granularity,
    metric,
    data: mapSalesEvolutionMetric(rows, metric),
  };
}

module.exports = {
  bucketExpenses,
  bucketPurchases,
  bucketSales,
  bucketStockMovements,
  getChartEvolution,
  mapSalesEvolutionMetric,
};
