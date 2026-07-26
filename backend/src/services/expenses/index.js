const { createExpense } = require("./createExpenseService");
const { getExpenses } = require("./getExpensesService");
const { searchExpenses } = require("./searchExpensesService");
const { getExpense } = require("./getExpenseService");
const { updateExpense } = require("./updateExpenseService");
const { deleteExpense } = require("./deleteExpenseService");

module.exports = {
  createExpense,
  getExpenses,
  searchExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};