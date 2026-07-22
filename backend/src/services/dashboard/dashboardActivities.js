const {
  toNumber,
  getSupplierName,
  createActivityItem,
} = require("./dashboardUtils");

function buildRecentActivity({ sales, purchases, expenses }) {
  return [
    ...sales.slice(0, 15).map((sale) =>
      createActivityItem({
        id: sale.id,
        type: "SALE",
        reference: sale.orderNumber || "Vente sans numero",
        date: sale.soldAt,
        amount: toNumber(sale.totalAmount),
        platform: sale.platform,
        status: sale.status,
        counterparty: sale.customerName,
        quantity: sale.totalItems,
        sport: sale.saleItems?.[0]?.inventory?.sport || null,
      })
    ),
    ...purchases.slice(0, 15).map((purchase) =>
      createActivityItem({
        id: purchase.id,
        type: "PURCHASE",
        reference: purchase.purchaseNumber || "Achat sans numero",
        date: purchase.purchasedAt,
        amount: toNumber(purchase.totalAmount),
        platform: purchase.platform,
        status: purchase.status,
        counterparty: getSupplierName(purchase.supplier),
        quantity: purchase.totalItems,
      })
    ),
    ...expenses.slice(0, 15).map((expense) =>
      createActivityItem({
        id: expense.id,
        type: "EXPENSE",
        reference: expense.expenseNumber || "Depense sans numero",
        date: expense.expenseDate,
        amount: toNumber(expense.amountTTC),
        status: expense.paymentStatus,
        metadata: {
          title: expense.title,
          category: expense.category,
        },
      })
    ),
  ]
    .filter((item) => Boolean(item.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);
}

module.exports = {
  buildRecentActivity,
};
