const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      const error = new Error("Access Denied — No Token Provided");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    // If JWT throws, it could be invalid or expired
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "Invalid or Expired Token";
    }
    next(error); // Pass to centralized error handler
  }
};
