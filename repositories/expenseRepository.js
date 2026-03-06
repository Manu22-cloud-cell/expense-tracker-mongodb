const Expense = require("../models/expenses");
const mongoose = require("mongoose");

const createExpense = (data, session) => {
  const expense = new Expense(data);

  if (session) {
    return expense.save({ session });
  }

  return expense.save();
};

const findExpenseById = (id, userId, session) => {

  const query = Expense.findOne({
    _id: id,
    userId: new mongoose.Types.ObjectId(userId)
  });

  if (session) query.session(session);

  return query;
};

const updateExpense = (expense, data, session) => {

  Object.assign(expense, data);

  if (session) {
    return expense.save({ session });
  }

  return expense.save();
};

const deleteExpense = (expense, session) => {

  if (session) {
    return expense.deleteOne({ session });
  }

  return expense.deleteOne();
};

const countUserExpenses = (userId) => {

  return Expense.countDocuments({
    userId: new mongoose.Types.ObjectId(userId)
  });

};

const getUserExpenses = (userId, limit, skip) => {

  return Expense.find({
    userId: new mongoose.Types.ObjectId(userId)
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

};

module.exports = {
  createExpense,
  findExpenseById,
  updateExpense,
  deleteExpense,
  countUserExpenses,
  getUserExpenses
};