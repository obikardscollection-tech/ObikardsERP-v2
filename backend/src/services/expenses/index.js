const { createExpense } = require("./createExpenseService");
const { getExpenses } = require("./getExpensesService");
const { getExpense } = require("./getExpenseService");
const { updateExpense } = require("./updateExpenseService");
const { deleteExpense } = require("./deleteExpenseService");

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};