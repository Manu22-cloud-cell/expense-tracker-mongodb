const User = require("../models/users");
const mongoose = require("mongoose");

const findUserByEmail = (email) => {
  return User.findOne({ email });
};

const createUser = (data) => {
  const user = new User(data);
  return user.save();
};

const findUserById = (id) => {
  return User.findById(id);
};

const updateUserTotalExpense = (userId, amount, session) => {

  const options = { new: true };

  if (session) {
    options.session = session;
  }

  return User.findByIdAndUpdate(
    new mongoose.Types.ObjectId(userId),
    { $inc: { totalExpense: amount } },
    options
  );
};

const getLeaderboard = () => {
  return User.find()
    .select("userName totalExpense")
    .sort({ totalExpense: -1 })
    .limit(10);
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserTotalExpense,
  getLeaderboard,
};