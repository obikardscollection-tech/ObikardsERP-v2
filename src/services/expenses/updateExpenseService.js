const prisma = require("../../lib/prisma");

async function updateExpense(id, data) {
  const expense = await prisma.expense.update({
    where: {
      id,
    },
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
      paymentStatus: data.paymentStatus,

      expenseDate: data.expenseDate
        ? new Date(data.expenseDate)
        : undefined,

      invoiceNumber: data.invoiceNumber || null,
      receiptUrl: data.receiptUrl || null,

      notes: data.notes || null,
    },
  });

  return expense;
}

module.exports = {
  updateExpense,
};