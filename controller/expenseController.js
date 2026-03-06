const Expenses = require('../models/expenses');
const User = require('../models/users');
const jwt = require("jsonwebtoken");
const { autoCategorize } = require("../services/aiCategoryService");
const sequelize = require('../utils/db-connection');


// ADD EXPENSE
const addExpenses = async (req, res, next) => {
    try {
        const { amount, description, category, note } = req.body;

        if (!amount || !description) {
            const err = new Error("Amount and description are required");
            err.statusCode = 400;
            throw err;
        }

        const token = req.headers.authorization;
        if (!token) {
            const err = new Error("Authorization token missing");
            err.statusCode = 401;
            throw err;
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const result = await sequelize.transaction(async (t) => {

            let finalCategory = category;
            if (!finalCategory || finalCategory.trim() === "") {
                finalCategory = await autoCategorize(description);
            }

            const expense = await Expenses.create(
                {
                    amount,
                    description,
                    category: finalCategory,
                    note,
                    userId: decoded.userId
                },
                { transaction: t }
            );

            await User.increment(
                { totalExpense: amount },
                { where: { id: decoded.userId }, transaction: t }
            );

            return expense;
        });

        res.status(201).json(result);

    } catch (error) {
        error.statusCode = error.statusCode || 500;
        next(error);
    }
};

// GET ALL
const getAllExpenses = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      const err = new Error("Authorization token missing");
      err.statusCode = 401;
      throw err;
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Get total count first
    const count = await Expenses.count({
      where: { userId: decoded.userId }
    });

    const totalPages = Math.ceil(count / limit) || 1;
    const safePage = page > totalPages ? totalPages : page;

    const offset = (safePage - 1) * limit;

    const expenses = await Expenses.findAll({
      where: { userId: decoded.userId },
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      expenses,
      currentPage: safePage,
      totalPages,
      totalExpenses: count
    });

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};


// UPDATE EXPENSE
const updateExpense = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, description, category, note } = req.body;
        const decoded = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);

        const updatedExpense = await sequelize.transaction(async (t) => {

            const existingExpense = await Expenses.findOne({
                where: { id, userId: decoded.userId },
                transaction: t
            });

            if (!existingExpense) {
                const err = new Error("Expense not found or unauthorized");
                err.statusCode = 404;
                throw err;
            }

            const diff = Number(amount) - existingExpense.amount;

            await existingExpense.update(
                { amount, description, category, note },
                { transaction: t }
            );

            await User.increment(
                { totalExpense: diff },
                { where: { id: decoded.userId }, transaction: t }
            );

            return existingExpense;
        });

        res.status(200).json(updatedExpense);

    } catch (error) {
        error.statusCode = 500;
        next(error);
    }
};

// DELETE EXPENSE
const deleteExpense = async (req, res, next) => {
    try {
        const { id } = req.params;

        const decoded = jwt.verify(
            req.headers.authorization,
            process.env.SECRET_KEY
        );

        await sequelize.transaction(async (t) => {

            const expense = await Expenses.findOne({
                where: { id, userId: decoded.userId },
                transaction: t
            });

            if (!expense) {
                const err = new Error("Expense not found or unauthorized");
                err.statusCode = 404;
                throw err;
            }

            await User.increment(
                { totalExpense: -expense.amount },
                { where: { id: decoded.userId }, transaction: t }
            );

            await expense.destroy({ transaction: t });
        });

        res.status(200).json({
            success: true,
            message: "Expense deleted successfully"
        });

    } catch (error) {
        error.statusCode = error.statusCode || 500;
        next(error);
    }
};

module.exports = {
    addExpenses,
    getAllExpenses,
    updateExpense,
    deleteExpense
};
