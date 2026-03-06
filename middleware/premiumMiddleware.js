const User = require("../models/users");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user || !user.isPremium) {
      const error = new Error("Premium membership required");
      error.statusCode = 403;
      throw error;
    }

    // Attach full user if needed later
    req.userDetails = user;

    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Server error";
    }
    next(error); // Pass to centralized error handler
  }
};

