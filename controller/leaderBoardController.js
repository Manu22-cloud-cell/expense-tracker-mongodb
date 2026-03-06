const User = require("../models/users");
const sequelize = require("../utils/db-connection");

exports.getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ["userName", "totalExpense"],
      order: [["totalExpense", "DESC"]]
    });

    res.status(200).json(leaderboard);

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};



