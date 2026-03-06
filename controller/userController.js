const userService = require("../services/userService");


// SIGNUP
const userSignUp = async (req, res, next) => {

  try {

    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      const err = new Error("All fields are required");
      err.statusCode = 400;
      throw err;
    }

    const user = await userService.registerUser({
      userName,
      email,
      password
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user._id
    });

  } catch (error) {

    error.statusCode = error.statusCode || 500;
    next(error);

  }

};


// LOGIN
const userLogin = async (req, res, next) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error("Email and password are required");
      err.statusCode = 400;
      throw err;
    }

    const result = await userService.loginUser({
      email,
      password
    });

    res.status(200).json({
      message: "Login successful",
      ...result
    });

  } catch (error) {

    error.statusCode = error.statusCode || 500;
    next(error);

  }

};


// LOGOUT
const userLogout = async (req, res) => {

  res.status(200).json({
    message: "Logout successful"
  });

};


module.exports = {
  userSignUp,
  userLogin,
  userLogout
};