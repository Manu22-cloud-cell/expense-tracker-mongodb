const { Cashfree, CFEnvironment } = require("cashfree-pg");
const { createOrder } = require("../services/cashfreeService");
const Payment = require("../models/payment");
const User = require("../models/users");
const jwt = require("jsonwebtoken");

const cashfree = new Cashfree(
  process.env.CASHFREE_ENV === "production"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_API_KEY,
  process.env.CASHFREE_SECRET_KEY
);


//INITIATE PAYMENT

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

    const orderId = "ORDER_" + Date.now();
    const amount = 199;

    const sessionId = await createOrder(
      orderId,
      amount,
      decoded.userId,
      email,
      phone
    );

    await Payment.create({
      orderId,
      userId: decoded.userId,
      amount,
      paymentStatus: "PENDING"
    });

    res.status(200).json({ orderId, sessionId });

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};


//PAYMENT STATUS

exports.paymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      const err = new Error("Order ID is required");
      err.statusCode = 400;
      throw err;
    }

    const response = await cashfree.PGFetchOrder(orderId);
    res.status(200).json(response.data);

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};


//VERIFY PAYMENT

exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      const err = new Error("Order ID is required");
      err.statusCode = 400;
      throw err;
    }

    const response = await cashfree.PGFetchOrder(orderId);
    const status = response.data.order_status;

    const payment = await Payment.findOne({ where: { orderId } });
    if (!payment) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    await payment.update({ paymentStatus: status });

    if (status === "PAID") {
      const user = await User.findByPk(payment.userId);
      await user.update({ isPremium: true });

      const token = jwt.sign(
        {
          userId: user.id,
          username: user.userName,
          isPremium: true
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Payment successful",
        status,
        token,
        username: user.userName
      });
    }

    res.status(200).json({ message: "Payment status updated", status });

  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};
