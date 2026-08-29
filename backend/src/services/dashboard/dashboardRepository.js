const prisma = require("../../lib/prisma");
const {
  buildSaleWhere,
  buildPurchaseWhere,
  buildExpenseWhere,
} = require("../statistics/statisticsRepository");

async function getDashboardSnapshot(range, previousRange) {
  const combinedRange = {
    from: previousRange.from,
    to: range.to,
  };

  const [
    inventoryGroups,
    lowStockCount,
    invalidQuantityCount,
    sales,
    purchases,
    expenses,
    customersCount,
    cancelledSalesCount,
    receptionsAggregate,
    recentReceptions,
    awaitingPurchasesCount,
    stockMovementsAggregate,
    stockEntriesAggregate,
    stockExitsAggregate,
    recentStockMovements,
  ] = await Promise.all([
    prisma.inventory.groupBy({
      by: ["sport", "purchasePrice"],
      where: {
        status: "IN_STOCK",
      },
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
    }),
    prisma.inventory.count({
      where: {
        status: "IN_STOCK",
        quantity: {
          lte: 1,
        },
      },
    }),
    prisma.inventory.count({
      where: {
        quantity: {
          lt: 0,
        },
      },
    }),
    prisma.sale.findMany({
      where: buildSaleWhere(combinedRange),
      select: {
        id: true,
        orderNumber: true,
        soldAt: true,
        totalAmount: true,
        profit: true,
        totalItems: true,
        platform: true,
        status: true,
        isCancelled: true,
        customerName: true,
        saleItems: {
          select: {
            id: true,
            quantity: true,
            totalPrice: true,
            inventory: {
              select: {
                sport: true,
              },
            },
          },
        },
      },
      orderBy: {
        soldAt: "desc",
      },
    }),
    prisma.purchase.findMany({
      where: buildPurchaseWhere(combinedRange),
      select: {
        id: true,
        purchaseNumber: true,
        purchasedAt: true,
        totalAmount: true,
        totalItems: true,
        platform: true,
        status: true,
        supplier: {
          select: {
            name: true,
            company: true,
            contactName: true,
          },
        },
      },
      orderBy: {
        purchasedAt: "desc",
      },
    }),
    prisma.expense.findMany({
      where: buildExpenseWhere(combinedRange),
      select: {
        id: true,
        expenseNumber: true,
        title: true,
        amountTTC: true,
        category: true,
        paymentStatus: true,
        expenseDate: true,
      },
      orderBy: {
        expenseDate: "desc",
      },
    }),
    prisma.customer.count(),
    prisma.sale.count({
      where: {
        soldAt: {
          gte: range.from,
          lte: range.to,
        },
        OR: [
          { isCancelled: true },
          { status: "CANCELLED" },
        ],
      },
    }),
    prisma.reception.aggregate({
      where: {
        receivedAt: {
          gte: range.from,
          lte: range.to,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalQuantity: true,
      },
    }),
    prisma.reception.findMany({
      where: {
        receivedAt: {
          gte: range.from,
          lte: range.to,
        },
      },
      select: {
        id: true,
        receptionNumber: true,
        totalQuantity: true,
        receivedAt: true,
        purchase: {
          select: {
            purchaseNumber: true,
          },
        },
      },
      orderBy: {
        receivedAt: "desc",
      },
      take: 5,
    }),
    prisma.purchase.count({
      where: {
        status: {
          in: ["PENDING", "PARTIALLY_RECEIVED"],
        },
      },
    }),
    prisma.stockMovement.aggregate({
      where: {
        createdAt: {
          gte: range.from,
          lte: range.to,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
    }),
    prisma.stockMovement.aggregate({
      where: {
        createdAt: {
          gte: range.from,
          lte: range.to,
        },
        quantity: {
          gt: 0,
        },
      },
      _sum: {
        quantity: true,
      },
    }),
    prisma.stockMovement.aggregate({
      where: {
        createdAt: {
          gte: range.from,
          lte: range.to,
        },
        quantity: {
          lt: 0,
        },
      },
      _sum: {
        quantity: true,
      },
    }),
    prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: range.from,
          lte: range.to,
        },
      },
      select: {
        id: true,
        type: true,
        source: true,
        quantity: true,
        createdAt: true,
        inventory: {
          select: {
            sku: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return {
    inventoryGroups,
    lowStockCount,
    invalidQuantityCount,
    sales,
    purchases,
    expenses,
    customersCount,
    cancelledSalesCount,
    receptionsAggregate,
    recentReceptions,
    awaitingPurchasesCount,
    stockMovementsAggregate,
    stockEntriesAggregate,
    stockExitsAggregate,
    recentStockMovements,
  };
}

module.exports = {
  getDashboardSnapshot,
};
