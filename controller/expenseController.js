const expenseService = require("../services/expenseService");
const jwt = require("jsonwebtoken");


const addExpenses = async (req, res, next) => {

  try {

    const token = req.headers.authorization;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const expense = await expenseService.addExpense({
      ...req.body,
      userId: decoded.userId
    });

    res.status(201).json(expense);

  } catch (error) {

    next(error);

  }

};