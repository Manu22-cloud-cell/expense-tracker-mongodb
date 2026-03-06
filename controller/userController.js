const Users = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//SIGN UP 

const userSignUp = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      const err = new Error("All fields are required");
      err.statusCode = 400;
      throw err;
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await Users.findOne({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      const err = new Error("Email already registered");
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      userName,
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User created successfully",
      userId: newUser.id
    });

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};

//LOGIN

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error("Email and password are required");
      err.statusCode = 400;
      throw err;
    }

    const normalizedEmail = email.toLowerCase();

    const user = await Users.findOne({
      where: { email: normalizedEmail }
    });

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
        userId: user.id,
        username: user.userName,
        isPremium: user.isPremium || false
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      username: user.userName,
      isPremium: user.isPremium || false
    });

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};

//LOGOUT

const userLogout = async (req, res, next) => {
  try {
    // Stateless logout – frontend clears token
    res.status(200).json({
      message: "Logout successful"
    });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};


module.exports = {
  userSignUp,
  userLogin,
  userLogout
};
