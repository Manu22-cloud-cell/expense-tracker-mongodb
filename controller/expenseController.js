const expenseService = require("../services/expenseService");


// ADD EXPENSE
const addExpenses = async (req, res, next) => {

  try {

    const { amount, description, category, note } = req.body;

    const expense = await expenseService.addExpense({
      amount,
      description,
      category,
      note,
      userId: req.user.userId
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense
    });

  } catch (error) {
    next(error);
  }

};


// GET ALL EXPENSES
const getAllExpenses = async (req, res, next) => {

  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await expenseService.getExpenses({
      userId: req.user.userId,
      page,
      limit
    });

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }

};


// UPDATE EXPENSE
const updateExpense = async (req, res, next) => {

  try {

    const { id } = req.params;

    const updatedExpense = await expenseService.updateExpense({
      id,
      ...req.body,
      userId: req.user.userId
    });

    res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense
    });

  } catch (error) {
    next(error);
  }

};


// DELETE EXPENSE
const deleteExpense = async (req, res, next) => {

  try {

    const { id } = req.params;

    await expenseService.deleteExpense({
      id,
      userId: req.user.userId
    });

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully"
    });

  } catch (error) {
    next(error);
  }

};


module.exports = {
  addExpenses,
  getAllExpenses,
  updateExpense,
  deleteExpense,
};