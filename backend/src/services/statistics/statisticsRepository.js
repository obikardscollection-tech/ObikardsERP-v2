const prisma = require("../../lib/prisma");

function buildSaleWhere(range = null) {
  const where = {
    isCancelled: false,
    status: {
      notIn: ["CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"],
    },
  };

  if (range?.from || range?.to) {
    where.soldAt = {};

    if (range?.from) {
      where.soldAt.gte = range.from;
    }

    if (range?.to) {
      where.soldAt.lte = range.to;
    }
  }

  return where;
}

function buildPurchaseWhere(range = null) {
  const where = {
    status: {
      not: "CANCELLED",
    },
  };

  if (range?.from || range?.to) {
    where.purchasedAt = {};

    if (range?.from) {
      where.purchasedAt.gte = range.from;
    }

    if (range?.to) {
      where.purchasedAt.lte = range.to;
    }
  }

  return where;
}

function buildExpenseWhere(range = null) {
  const where = {
    paymentStatus: "PAID",
  };

  if (range?.from || range?.to) {
    where.expenseDate = {};

    if (range?.from) {
      where.expenseDate.gte = range.from;
    }

    if (range?.to) {
      where.expenseDate.lte = range.to;
    }
  }

  return where;
}

async function getSalesAggregate(range) {
  return prisma.sale.aggregate({
    where: buildSaleWhere(range),
    _sum: {
      totalAmount: true,
      profit: true,
      totalItems: true,
      taxes: true,
      shippingCost: true,
      platformFees: true,
      discount: true,
    },
    _count: {
      id: true,
    },
  });
}

async function getExpensesAggregate(range) {
  return prisma.expense.aggregate({
    where: buildExpenseWhere(range),
    _sum: {
      amountHT: true,
      tax: true,
      amountTTC: true,
    },
    _count: {
      id: true,
    },
  });
}

async function getTopSaleByAmount(range) {
  return prisma.sale.findFirst({
    where: buildSaleWhere(range),
    select: {
      id: true,
      orderNumber: true,
      soldAt: true,
      totalAmount: true,
      profit: true,
      totalItems: true,
      platform: true,
    },
    orderBy: {
      totalAmount: "desc",
    },
  });
}

async function getTopSaleByProfit(range) {
  return prisma.sale.findFirst({
    where: buildSaleWhere(range),
    select: {
      id: true,
      orderNumber: true,
      soldAt: true,
      totalAmount: true,
      profit: true,
      totalItems: true,
      platform: true,
    },
    orderBy: {
      profit: "desc",
    },
  });
}

async function getSalesProfitabilityEntries(range) {
  return prisma.sale.findMany({
    where: buildSaleWhere(range),
    select: {
      id: true,
      orderNumber: true,
      soldAt: true,
      totalAmount: true,
      profit: true,
      totalItems: true,
      platform: true,
    },
  });
}

async function getSalesTimeline(range) {
  return prisma.sale.findMany({
    where: buildSaleWhere(range),
    select: {
      soldAt: true,
      totalAmount: true,
      profit: true,
      totalItems: true,
    },
    orderBy: {
      soldAt: "asc",
    },
  });
}

async function getExpensesTimeline(range) {
  return prisma.expense.findMany({
    where: buildExpenseWhere(range),
    select: {
      expenseDate: true,
      amountHT: true,
      tax: true,
      amountTTC: true,
    },
    orderBy: {
      expenseDate: "asc",
    },
  });
}

async function getExpensesByCategory(range) {
  return prisma.expense.groupBy({
    by: ["category"],
    where: buildExpenseWhere(range),
    _sum: {
      amountHT: true,
      tax: true,
      amountTTC: true,
    },
    _count: {
      id: true,
    },
  });
}

async function getPurchasesTimeline(range) {
  return prisma.purchase.findMany({
    where: buildPurchaseWhere(range),
    select: {
      purchasedAt: true,
      totalAmount: true,
      totalItems: true,
      taxes: true,
    },
    orderBy: {
      purchasedAt: "asc",
    },
  });
}

async function getStockMovementsTimeline(range) {
  const where = {};

  if (range?.from || range?.to) {
    where.createdAt = {};

    if (range?.from) {
      where.createdAt.gte = range.from;
    }

    if (range?.to) {
      where.createdAt.lte = range.to;
    }
  }

  return prisma.stockMovement.findMany({
    where,
    select: {
      createdAt: true,
      quantity: true,
      type: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

async function getSalesByPlatform(range) {
  return prisma.sale.groupBy({
    by: ["platform"],
    where: buildSaleWhere(range),
    _sum: {
      totalAmount: true,
      profit: true,
      totalItems: true,
    },
    _count: {
      id: true,
    },
  });
}

async function getSaleItemsAnalytics(range) {
  return prisma.saleItem.findMany({
    where: {
      sale: buildSaleWhere(range),
    },
    select: {
      saleId: true,
      quantity: true,
      totalPrice: true,
      purchasePriceSnapshot: true,
      profitSnapshot: true,
      sale: {
        select: {
          platform: true,
          soldAt: true,
        },
      },
      inventory: {
        select: {
          id: true,
          sku: true,
          title: true,
          category: true,
          sport: true,
          player: true,
          team: true,
          supplier: true,
          brand: true,
          year: true,
          series: true,
          product: true,
          grade: true,
          gradeCompany: true,
          confidence: true,
          status: true,
          purchasePrice: true,
          salePrice: true,
          marketValueEur: true,
          createdAt: true,
        },
      },
    },
  });
}

async function getInStockInventory() {
  return prisma.inventory.findMany({
    where: {
      status: "IN_STOCK",
    },
    select: {
      id: true,
      sku: true,
      title: true,
      category: true,
      quantity: true,
      purchasePrice: true,
      salePrice: true,
      marketValueEur: true,
      sport: true,
      player: true,
      team: true,
      supplier: true,
      brand: true,
      year: true,
      series: true,
      product: true,
      grade: true,
      gradeCompany: true,
      confidence: true,
      status: true,
      createdAt: true,
    },
  });
}

async function getInStockInventoryAggregate() {
  return prisma.inventory.aggregate({
    where: {
      status: "IN_STOCK",
    },
    _count: {
      id: true,
    },
    _sum: {
      quantity: true,
    },
    _min: {
      createdAt: true,
    },
    _max: {
      createdAt: true,
    },
  });
}

async function countNeverSoldCardsInStock() {
  return prisma.inventory.count({
    where: {
      status: "IN_STOCK",
      saleItems: {
        none: {},
      },
    },
  });
}

async function countCardsWithoutSalePriceInStock() {
  return prisma.inventory.count({
    where: {
      status: "IN_STOCK",
      OR: [
        {
          salePrice: null,
        },
        {
          salePrice: {
            lte: 0,
          },
        },
      ],
    },
  });
}

async function countCardsWithoutMarketValueInStock() {
  return prisma.inventory.count({
    where: {
      status: "IN_STOCK",
      OR: [
        {
          marketValueEur: null,
        },
        {
          marketValueEur: {
            lte: 0,
          },
        },
      ],
    },
  });
}

async function countOldCardsInStock(olderThanDate) {
  return prisma.inventory.count({
    where: {
      status: "IN_STOCK",
      createdAt: {
        lt: olderThanDate,
      },
    },
  });
}

async function countLowStockCardsInStock(maxQuantity) {
  return prisma.inventory.count({
    where: {
      status: "IN_STOCK",
      quantity: {
        lte: maxQuantity,
      },
    },
  });
}

async function countHighStockCardsInStock(minQuantity) {
  return prisma.inventory.count({
    where: {
      status: "IN_STOCK",
      quantity: {
        gte: minQuantity,
      },
    },
  });
}

async function getCardsSalesOccurrences(range = null) {
  return prisma.saleItem.groupBy({
    by: ["inventoryId"],
    where: {
      sale: buildSaleWhere(range),
    },
    _count: {
      inventoryId: true,
    },
  });
}

async function getSoldQuantityTotal(range = null) {
  const aggregate = await prisma.saleItem.aggregate({
    where: {
      sale: buildSaleWhere(range),
    },
    _sum: {
      quantity: true,
    },
  });

  return aggregate?._sum?.quantity || 0;
}

async function getNeverSoldCards(limit = 10) {
  return prisma.inventory.findMany({
    where: {
      saleItems: {
        none: {},
      },
    },
    select: {
      id: true,
      sku: true,
      title: true,
      sport: true,
      player: true,
      brand: true,
      supplier: true,
      purchasePrice: true,
      salePrice: true,
      marketValueEur: true,
      quantity: true,
      createdAt: true,
      status: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });
}

async function getOldestCardsInStock(limit = 10) {
  return prisma.inventory.findMany({
    where: {
      status: "IN_STOCK",
    },
    select: {
      id: true,
      sku: true,
      title: true,
      sport: true,
      player: true,
      brand: true,
      supplier: true,
      purchasePrice: true,
      salePrice: true,
      marketValueEur: true,
      quantity: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });
}

async function getMostExpensiveSoldCards(range, limit = 10) {
  return prisma.saleItem.findMany({
    where: {
      sale: buildSaleWhere(range),
    },
    select: {
      id: true,
      saleId: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      profitSnapshot: true,
      sale: {
        select: {
          orderNumber: true,
          soldAt: true,
          platform: true,
          totalAmount: true,
          profit: true,
        },
      },
      inventory: {
        select: {
          sku: true,
          title: true,
          sport: true,
          player: true,
          brand: true,
          year: true,
          purchasePrice: true,
        },
      },
    },
    orderBy: {
      unitPrice: "desc",
    },
    take: limit,
  });
}

async function getSalesByStatus(range) {
  return prisma.sale.groupBy({
    by: ["status"],
    where: buildSaleWhere(range),
    _sum: {
      totalAmount: true,
      profit: true,
      totalItems: true,
    },
    _count: {
      id: true,
    },
  });
}

async function getMarketSnapshots(range = null) {
  const where = {};

  if (range?.from || range?.to) {
    where.createdAt = {};

    if (range?.from) {
      where.createdAt.gte = range.from;
    }

    if (range?.to) {
      where.createdAt.lte = range.to;
    }
  }

  return prisma.inventoryMarketSnapshot.findMany({
    where,
    select: {
      createdAt: true,
      valueEur: true,
      roi: true,
      profit: true,
      inventoryId: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

async function getInventoryWithRecentMarketSnapshots() {
  return prisma.inventory.findMany({
    where: {
      marketSnapshots: {
        some: {},
      },
    },
    select: {
      id: true,
      sku: true,
      title: true,
      sport: true,
      player: true,
      brand: true,
      year: true,
      quantity: true,
      purchasePrice: true,
      salePrice: true,
      marketValueEur: true,
      marketSnapshots: {
        select: {
          valueEur: true,
          roi: true,
          profit: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 2,
      },
    },
  });
}

module.exports = {
  buildSaleWhere,
  buildPurchaseWhere,
  buildExpenseWhere,
  getSalesAggregate,
  getExpensesAggregate,
  getTopSaleByAmount,
  getTopSaleByProfit,
  getSalesProfitabilityEntries,
  getSalesTimeline,
  getExpensesTimeline,
  getExpensesByCategory,
  getPurchasesTimeline,
  getStockMovementsTimeline,
  getSalesByPlatform,
  getSalesByStatus,
  getSaleItemsAnalytics,
  getInStockInventory,
  getInStockInventoryAggregate,
  countNeverSoldCardsInStock,
  countCardsWithoutSalePriceInStock,
  countCardsWithoutMarketValueInStock,
  countOldCardsInStock,
  countLowStockCardsInStock,
  countHighStockCardsInStock,
  getCardsSalesOccurrences,
  getSoldQuantityTotal,
  getNeverSoldCards,
  getOldestCardsInStock,
  getMostExpensiveSoldCards,
  getMarketSnapshots,
  getInventoryWithRecentMarketSnapshots,
};