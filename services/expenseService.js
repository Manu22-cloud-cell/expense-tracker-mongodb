const mongoose = require("mongoose");
const expenseRepo = require("../repositories/expenseRepository");
const userRepo = require("../repositories/userRepository");
const { autoCategorize } = require("./aiCategoryService");


const addExpense = async ({ amount, description, category, note, userId }) => {

    const session = await mongoose.startSession();

    try {

        let expense;

        await session.withTransaction(async () => {

            let finalCategory = category;

            if (!finalCategory || finalCategory.trim() === "") {
                if (description) {
                    finalCategory = await autoCategorize(description);
                } else {
                    finalCategory = "Other";
                }
            }

            const numericAmount = Number(amount);

            expense = await expenseRepo.createExpense(
                {
                    amount: numericAmount,
                    description,
                    category: finalCategory,
                    note,
                    userId
                },
                session
            );

            await userRepo.updateUserTotalExpense(userId, numericAmount, session);

        });

        return expense;

    } finally {
        session.endSession();
    }

};



const getExpenses = async ({ userId, page, limit }) => {

    const count = await expenseRepo.countUserExpenses(userId);

    const totalPages = Math.ceil(count / limit) || 1;
    const safePage = page > totalPages ? totalPages : page;

    const skip = (safePage - 1) * limit;

    const expenses = await expenseRepo.getUserExpenses(userId, limit, skip);

    return {
        expenses,
        currentPage: safePage,
        totalPages,
        totalExpenses: count
    };

};



const updateExpense = async ({ id, amount, description, category, note, userId }) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const existingExpense = await expenseRepo.findExpenseById(id, userId, session);

        if (!existingExpense) {
            const err = new Error("Expense not found or unauthorized");
            err.statusCode = 404;
            throw err;
        }

        const newAmount = Number(amount);
        const diff = newAmount - existingExpense.amount;

        const updated = await expenseRepo.updateExpense(
            existingExpense,
            { amount, description, category, note },
            session
        );

        await userRepo.updateUserTotalExpense(userId, diff, session);

        await session.commitTransaction();
        session.endSession();

        return updated;

    } catch (error) {

        await session.abortTransaction();
        session.endSession();
        throw error;

    }

};



const deleteExpense = async ({ id, userId }) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const expense = await expenseRepo.findExpenseById(id, userId, session);

        if (!expense) {
            const err = new Error("Expense not found or unauthorized");
            err.statusCode = 404;
            throw err;
        }

        await userRepo.updateUserTotalExpense(userId, -expense.amount, session);

        await expenseRepo.deleteExpense(expense, session);

        await session.commitTransaction();
        session.endSession();

    } catch (error) {

        await session.abortTransaction();
        session.endSession();
        throw error;

    }

};


module.exports = {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense
};