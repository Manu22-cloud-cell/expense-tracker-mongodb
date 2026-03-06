const userRepo = require("../repositories/userRepository");

const getLeaderboard = async () => {

  const leaderboard = await userRepo.getLeaderboard();

  return leaderboard;

};

module.exports = {
  getLeaderboard
};