const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/userRepository");

const registerUser = async ({ userName, email, password }) => {

  const normalizedEmail = email.toLowerCase();

  const existingUser = await userRepo.findUserByEmail(normalizedEmail);

  if (existingUser) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userRepo.createUser({
    userName,
    email: normalizedEmail,
    password: hashedPassword
  });

  return newUser;

};


const loginUser = async ({ email, password }) => {

  const normalizedEmail = email.toLowerCase();

  const user = await userRepo.findUserByEmail(normalizedEmail);

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const err = new Error("Incorrect password");
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    {
      userId: user._id,
      username: user.userName,
      isPremium: user.isPremium
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );

  return {
    token,
    username: user.userName,
    isPremium: user.isPremium
  };

};

module.exports = {
  registerUser,
  loginUser
};