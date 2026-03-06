const Expense = require("../models/expenses");
const DownloadedReport = require("../models/downloadedReport");
const mongoose = require("mongoose");

exports.getDailyExpenses = async (userId, start, end) => {

  return Expense.find({
    userId,
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: 1 });

};

exports.getMonthlyExpenses = async (userId, start, end) => {

  return Expense.find({
    userId,
    createdAt: { $gte: start, $lte: end }
  }).sort({ createdAt: 1 });

};

exports.getYearlyExpenses = async (userId, year) => {

  return Expense.aggregate([

    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },

    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        expense: { $sum: "$amount" }
      }
    },

    {
      $project: {
        month: "$_id.month",
        expense: 1,
        _id: 0
      }
    },

    {
      $sort: { month: 1 }
    }

  ]);

};

exports.saveDownloadedReport = async (data) => {

  return DownloadedReport.create(data);

};

exports.getDownloadedReports = async (userId) => {

  return DownloadedReport
    .find({ userId })
    .sort({ downloadedAt: -1 });

};