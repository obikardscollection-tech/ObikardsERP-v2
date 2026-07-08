const prisma = require("../../lib/prisma");

async function createExpense(data) {
  const expense = await prisma.expense.create({
    data: {
      expenseNumber: data.expenseNumber,

      category: data.category,

      supplierId: data.supplierId || null,

      title: data.title,
      description: data.description || null,

      amountHT: data.amountHT || 0,
      tax: data.tax || 0,
      amountTTC: data.amountTTC || 0,

      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus || "PAID",

      expenseDate: data.expenseDate
        ? new Date(data.expenseDate)
        : new Date(),

      invoiceNumber: data.invoiceNumber || null,
      receiptUrl: data.receiptUrl || null,

      notes: data.notes || null,
    },
  });

  return expense;
}

module.exports = {
  createExpense,
};