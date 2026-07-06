const prisma = require("../../lib/prisma");

async function getExpense(id) {
  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },
    include: {
      supplier: true,
    },
  });

  return expense;
}

module.exports = {
  getExpense,
};