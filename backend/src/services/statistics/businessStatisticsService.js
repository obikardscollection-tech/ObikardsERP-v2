const statisticsRepository = require("./statisticsRepository");
const {
  SUPPORTED_DIMENSIONS,
  SUPPORTED_TOP_CATEGORIES,
  toNumber,
  ratio,
  normalizeKey,
  formatRange,
  getRangeFromFilters,
} = require("./statisticsCore");

function computeItemCost(item) {
  const quantity = toNumber(item.quantity);
  const snapshotCost = toNumber(item.purchasePriceSnapshot);
  const inventoryCost = toNumber(item.inventory?.purchasePrice);
  const unitCost = snapshotCost || inventoryCost;

  return unitCost * quantity;
}

function computeItemProfit(item) {
  if (item.profitSnapshot !== null && item.profitSnapshot !== undefined) {
    return toNumber(item.profitSnapshot);
  }

  return toNumber(item.totalPrice) - computeItemCost(item);
}

function getDimensionValue(item, dimension) {
  if (dimension === "platform") {
    return normalizeKey(item.sale?.platform);
  }

  if (dimension === "year") {
    return normalizeKey(item.inventory?.year);
  }

  if (dimension === "set") {
    return normalizeKey(item.inventory?.product || item.inventory?.series);
  }

  if (dimension === "grading") {
    return normalizeKey(item.inventory?.gradeCompany || item.inventory?.grade);
  }

  if (dimension === "state") {
    return normalizeKey(item.inventory?.confidence || item.inventory?.status);
  }

  return normalizeKey(item.inventory?.[dimension]);
}

function aggregateByDimension(items, dimension) {
  const map = new Map();

  for (const item of items) {
    const key = getDimensionValue(item, dimension);
    const quantity = toNumber(item.quantity);
    const revenue = toNumber(item.totalPrice);
    const purchaseCost = computeItemCost(item);
    const grossProfit = computeItemProfit(item);
    const unitPrice = quantity > 0 ? revenue / quantity : 0;

    if (!map.has(key)) {
      map.set(key, {
        key,
        nombreVentes: 0,
        quantite: 0,
        chiffreAffaires: 0,
        cout: 0,
        benefice: 0,
        prixMaximum: 0,
        prixMinimum: null,
        _saleIds: new Set(),
      });
    }

    const entry = map.get(key);
    entry._saleIds.add(item.saleId);
    entry.chiffreAffaires += revenue;
    entry.cout += purchaseCost;
    entry.benefice += grossProfit;
    entry.quantite += quantity;
    entry.prixMaximum = Math.max(entry.prixMaximum, unitPrice);
    entry.prixMinimum = entry.prixMinimum === null ? unitPrice : Math.min(entry.prixMinimum, unitPrice);
  }

  return Array.from(map.values())
    .map((entry) => {
      const margePct = ratio(entry.benefice, entry.chiffreAffaires);
      const roiPct = ratio(entry.benefice, entry.cout);

      return {
        key: entry.key,
        nombreVentes: entry._saleIds.size,
        quantite: entry.quantite,
        chiffreAffaires: entry.chiffreAffaires,
        cout: entry.cout,
        benefice: entry.benefice,
        marge: margePct,
        roi: roiPct,
        prixMoyen: entry.quantite > 0 ? entry.chiffreAffaires / entry.quantite : 0,
        prixMaximum: entry.prixMaximum,
        prixMinimum: entry.prixMinimum || 0,
        salesCount: entry._saleIds.size,
        quantiteVendue: entry.quantite,
      };
    })
    .sort((a, b) => b.chiffreAffaires - a.chiffreAffaires || b.benefice - a.benefice);
}

function aggregateCards(items) {
  const map = new Map();

  for (const item of items) {
    const sku = normalizeKey(item.inventory?.sku);
    const title = normalizeKey(item.inventory?.title);
    const key = `${sku}::${title}`;
    const quantity = toNumber(item.quantity);
    const revenue = toNumber(item.totalPrice);
    const purchaseCost = computeItemCost(item);
    const grossProfit = computeItemProfit(item);
    const unitPrice = quantity > 0 ? revenue / quantity : 0;

    if (!map.has(key)) {
      map.set(key, {
        sku,
        title,
        quantite: 0,
        chiffreAffaires: 0,
        cout: 0,
        benefice: 0,
        prixMaximum: 0,
        prixMinimum: null,
        _saleIds: new Set(),
      });
    }

    const entry = map.get(key);
    entry._saleIds.add(item.saleId);
    entry.quantite += quantity;
    entry.chiffreAffaires += revenue;
    entry.cout += purchaseCost;
    entry.benefice += grossProfit;
    entry.prixMaximum = Math.max(entry.prixMaximum, unitPrice);
    entry.prixMinimum = entry.prixMinimum === null ? unitPrice : Math.min(entry.prixMinimum, unitPrice);
  }

  return Array.from(map.values()).map((entry) => ({
    sku: entry.sku,
    title: entry.title,
    nombreVentes: entry._saleIds.size,
    quantite: entry.quantite,
    chiffreAffaires: entry.chiffreAffaires,
    cout: entry.cout,
    benefice: entry.benefice,
    marge: ratio(entry.benefice, entry.chiffreAffaires),
    roi: ratio(entry.benefice, entry.cout),
    prixMoyen: entry.quantite > 0 ? entry.chiffreAffaires / entry.quantite : 0,
    prixMaximum: entry.prixMaximum,
    prixMinimum: entry.prixMinimum || 0,
    salesCount: entry._saleIds.size,
    quantiteVendue: entry.quantite,
  }));
}

async function getBusinessAnalysis(dimension, filters = {}) {
  if (!SUPPORTED_DIMENSIONS.includes(dimension)) {
    const error = new Error(`Dimension non supportee: ${dimension}`);
    error.statusCode = 400;
    throw error;
  }

  const limit = Math.max(1, Math.min(200, Number(filters.limit || 50)));
  const range = getRangeFromFilters(filters);
  const items = await statisticsRepository.getSaleItemsAnalytics(range);
  const aggregates = aggregateByDimension(items, dimension);

  return {
    range: formatRange(range),
    dimension,
    data: aggregates.slice(0, limit),
  };
}

function buildTopCategoryFromCards(cards, category) {
  const sorted = [...cards];

  if (category === "cards") {
    sorted.sort((a, b) => b.chiffreAffaires - a.chiffreAffaires || b.benefice - a.benefice);
  } else if (category === "top-roi") {
    sorted.sort((a, b) => b.roi - a.roi || b.benefice - a.benefice);
  } else if (category === "top-benefits" || category === "most-profitable-cards") {
    sorted.sort((a, b) => b.benefice - a.benefice || b.chiffreAffaires - a.chiffreAffaires);
  } else if (category === "top-margins") {
    sorted.sort((a, b) => b.marge - a.marge || b.benefice - a.benefice);
  } else if (category === "top-sales") {
    sorted.sort((a, b) => b.salesCount - a.salesCount || b.chiffreAffaires - a.chiffreAffaires);
  } else if (category === "least-profitable-cards") {
    sorted.sort((a, b) => a.benefice - b.benefice || a.chiffreAffaires - b.chiffreAffaires);
  }

  return sorted;
}

async function getTopRanking(category, filters = {}) {
  if (!SUPPORTED_TOP_CATEGORIES.includes(category)) {
    const error = new Error(`Categorie top non supportee: ${category}`);
    error.statusCode = 400;
    throw error;
  }

  const limit = Math.max(1, Math.min(100, Number(filters.limit || 10)));
  const range = getRangeFromFilters(filters);

  if (category === "never-sold-cards") {
    const cards = await statisticsRepository.getNeverSoldCards(limit);
    return {
      range: formatRange(range),
      category,
      data: cards,
    };
  }

  if (category === "oldest-cards") {
    const cards = await statisticsRepository.getOldestCardsInStock(limit);
    return {
      range: formatRange(range),
      category,
      data: cards,
    };
  }

  if (category === "most-expensive-cards") {
    const cards = await statisticsRepository.getMostExpensiveSoldCards(range, limit);
    return {
      range: formatRange(range),
      category,
      data: cards.map((entry) => ({
        id: entry.id,
        saleId: entry.saleId,
        sku: entry.inventory?.sku,
        title: entry.inventory?.title,
        player: entry.inventory?.player,
        sport: entry.inventory?.sport,
        brand: entry.inventory?.brand,
        year: entry.inventory?.year,
        unitPrice: toNumber(entry.unitPrice),
        totalPrice: toNumber(entry.totalPrice),
        quantity: toNumber(entry.quantity),
        sale: entry.sale,
      })),
    };
  }

  const items = await statisticsRepository.getSaleItemsAnalytics(range);
  const cards = aggregateCards(items);

  if (
    category === "cards" ||
    category === "top-roi" ||
    category === "top-benefits" ||
    category === "top-margins" ||
    category === "top-sales" ||
    category === "most-profitable-cards" ||
    category === "least-profitable-cards"
  ) {
    return {
      range: formatRange(range),
      category,
      data: buildTopCategoryFromCards(cards, category).slice(0, limit),
    };
  }

  const dimensionMap = {
    players: "player",
    brands: "brand",
    suppliers: "supplier",
    sports: "sport",
    series: "series",
    years: "year",
    platforms: "platform",
  };

  const aggregates = aggregateByDimension(items, dimensionMap[category]);
  const sorted = [...aggregates].sort(
    (a, b) => b.chiffreAffaires - a.chiffreAffaires || b.benefice - a.benefice
  );

  return {
    range: formatRange(range),
    category,
    data: sorted.slice(0, limit),
  };
}

async function getSalesDistribution(filters = {}) {
  const range = getRangeFromFilters(filters);
  const [salesByPlatform, salesByStatus] = await Promise.all([
    statisticsRepository.getSalesByPlatform(range),
    statisticsRepository.getSalesByStatus(range),
  ]);

  const totalRevenue = salesByPlatform.reduce((sum, row) => sum + toNumber(row._sum?.totalAmount), 0);
  const totalProfit = salesByPlatform.reduce((sum, row) => sum + toNumber(row._sum?.profit), 0);

  const byPlatform = salesByPlatform
    .map((row) => {
      const revenue = toNumber(row._sum?.totalAmount);
      const grossProfit = toNumber(row._sum?.profit);
      const purchaseCost = revenue - grossProfit;

      return {
        key: normalizeKey(row.platform),
        salesCount: toNumber(row._count?.id),
        chiffreAffaires: revenue,
        benefice: grossProfit,
        marge: ratio(grossProfit, revenue),
        roi: ratio(grossProfit, purchaseCost),
        quantiteVendue: toNumber(row._sum?.totalItems),
        partChiffreAffaires: ratio(revenue, totalRevenue),
        partBenefice: ratio(grossProfit, totalProfit),
      };
    })
    .sort((a, b) => b.chiffreAffaires - a.chiffreAffaires);

  const byStatus = salesByStatus
    .map((row) => ({
      key: normalizeKey(row.status),
      salesCount: toNumber(row._count?.id),
      chiffreAffaires: toNumber(row._sum?.totalAmount),
      benefice: toNumber(row._sum?.profit),
      quantiteVendue: toNumber(row._sum?.totalItems),
    }))
    .sort((a, b) => b.chiffreAffaires - a.chiffreAffaires);

  return {
    range: formatRange(range),
    byPlatform,
    byStatus,
    data: byPlatform,
  };
}

async function getBenefitsDistribution(filters = {}) {
  const range = getRangeFromFilters(filters);
  const items = await statisticsRepository.getSaleItemsAnalytics(range);
  const bySport = aggregateByDimension(items, "sport");
  const byBrand = aggregateByDimension(items, "brand");
  const bySupplier = aggregateByDimension(items, "supplier");

  return {
    range: formatRange(range),
    bySport,
    byBrand,
    bySupplier,
  };
}

async function getSalesByDimension(dimension, filters = {}) {
  if (!["sport", "player", "supplier", "brand", "platform", "year"].includes(dimension)) {
    const error = new Error(`Dimension ventes non supportee: ${dimension}`);
    error.statusCode = 400;
    throw error;
  }

  const range = getRangeFromFilters(filters);

  if (dimension === "platform") {
    const rows = await statisticsRepository.getSalesByPlatform(range);

    return {
      range: formatRange(range),
      dimension,
      data: rows
        .map((row) => {
          const revenue = toNumber(row._sum?.totalAmount);
          const grossProfit = toNumber(row._sum?.profit);
          const cost = revenue - grossProfit;
          const soldItems = toNumber(row._sum?.totalItems);

          return {
            key: normalizeKey(row.platform),
            nombreVentes: toNumber(row._count?.id),
            quantite: soldItems,
            chiffreAffaires: revenue,
            cout: cost,
            benefice: grossProfit,
            marge: ratio(grossProfit, revenue),
            roi: ratio(grossProfit, cost),
            prixMoyen: soldItems > 0 ? revenue / soldItems : 0,
            prixMaximum: 0,
            prixMinimum: 0,
          };
        })
        .sort((a, b) => b.chiffreAffaires - a.chiffreAffaires),
    };
  }

  const items = await statisticsRepository.getSaleItemsAnalytics(range);
  const data = aggregateByDimension(items, dimension);

  return {
    range: formatRange(range),
    dimension,
    data,
  };
}

module.exports = {
  getBusinessAnalysis,
  getTopRanking,
  getSalesDistribution,
  getBenefitsDistribution,
  getSalesByDimension,
};
