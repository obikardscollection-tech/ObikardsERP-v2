const prisma = require("../../lib/prisma");

async function getExpenses() {
  const expenses = await prisma.expense.findMany({
    include: {
      supplier: true,
    },
    orderBy: {
      expenseDate: "desc",
    },
  });

  return expenses;
}

module.exports = {
  getExpenses,
};