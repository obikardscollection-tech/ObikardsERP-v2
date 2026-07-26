const prisma = require("../../lib/prisma");

async function getDashboardSnapshot() {
  const [inventory, sales, purchases, expenses, customersCount] = await Promise.all([
    prisma.inventory.findMany({
      select: {
        id: true,
        sku: true,
        title: true,
        quantity: true,
        status: true,
        purchasePrice: true,
        salePrice: true,
        sport: true,
        createdAt: true,
        purchaseDate: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.sale.findMany({
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
  ]);

  return {
    inventory,
    sales,
    purchases,
    expenses,
    customersCount,
  };
}

module.exports = {
  getDashboardSnapshot,
};
