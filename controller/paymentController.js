const jwt = require("jsonwebtoken");
const paymentService = require("../services/paymentService");


// INITIATE PAYMENT

exports.initiatePayment = async (req, res, next) => {
  try {

    const token = req.headers.authorization;

    if (!token) {
      const err = new Error("Authorization token missing");
      err.statusCode = 401;
      throw err;
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const { phone, email } = req.body;

    if (!phone || !email) {
      const err = new Error("Phone and email are required");
      err.statusCode = 400;
      throw err;
    }

    const result = await paymentService.initiatePayment({
      userId: decoded.userId,
      email,
      phone
    });

    res.status(200).json(result);

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};


// PAYMENT STATUS

exports.paymentStatus = async (req, res, next) => {
  try {

    const { orderId } = req.params;

    if (!orderId) {
      const err = new Error("Order ID is required");
      err.statusCode = 400;
      throw err;
    }

    const result = await paymentService.paymentStatus(orderId);

    res.status(200).json(result);

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};


// VERIFY PAYMENT

exports.verifyPayment = async (req, res, next) => {
  try {

    const { orderId } = req.params;

    if (!orderId) {
      const err = new Error("Order ID is required");
      err.statusCode = 400;
      throw err;
    }

    const result = await paymentService.verifyPayment(orderId);

    res.status(200).json(result);

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};