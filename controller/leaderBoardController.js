const leaderboardService = require("../services/leaderboardService");

exports.getLeaderboard = async (req, res, next) => {
  try {

    const leaderboard = await leaderboardService.getLeaderboard();

    res.status(200).json(leaderboard);

  } catch (error) {

    error.statusCode = error.statusCode || 500;
    next(error);

  }
};