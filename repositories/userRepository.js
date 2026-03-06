const User = require("../models/users");

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

module.exports = {
  findUserByEmail,
  createUser,
  findUserById
};