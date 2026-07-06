const expensesService = require("../services/expenses");

async function create(req, res) {
  try {
    const expense = await expensesService.createExpense(req.body);

    return res.status(201).json(expense);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const expenses = await expensesService.getExpenses();

    return res.json(expenses);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const expense = await expensesService.getExpense(req.params.id);

    return res.json(expense);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const expense = await expensesService.updateExpense(
      req.params.id,
      req.body
    );

    return res.json(expense);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await expensesService.deleteExpense(req.params.id);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};