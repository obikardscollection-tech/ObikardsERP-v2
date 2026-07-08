const prisma = require("../../lib/prisma");

async function deleteExpense(id) {
  const expense = await prisma.expense.delete({
    where: {
      id,
    },
  });

  return expense;
}

module.exports = {
  deleteExpense,
};