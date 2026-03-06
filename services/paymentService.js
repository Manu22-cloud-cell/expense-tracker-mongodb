const jwt = require("jsonwebtoken");
const paymentRepo = require("../repositories/paymentRepository");
const userRepo = require("../repositories/userRepository");
const { createOrder } = require("./cashfreeService");
const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
  process.env.CASHFREE_ENV === "production"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_API_KEY,
  process.env.CASHFREE_SECRET_KEY
);


// INITIATE PAYMENT

const initiatePayment = async ({ userId, email, phone }) => {

  const orderId = "ORDER_" + Date.now();
  const amount = 199;

  const sessionId = await createOrder(
    orderId,
    amount,
    userId,
    email,
    phone
  );

  await paymentRepo.createPayment({
    orderId,
    userId,
    amount,
    paymentStatus: "PENDING"
  });

  return { orderId, sessionId };
};


// PAYMENT STATUS

const paymentStatus = async (orderId) => {

  const response = await cashfree.PGFetchOrder(orderId);

  return response.data;
};


// VERIFY PAYMENT

const verifyPayment = async (orderId) => {

  const response = await cashfree.PGFetchOrder(orderId);
  const status = response.data.order_status;

  const payment = await paymentRepo.findPaymentByOrderId(orderId);

  if (!payment) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  await paymentRepo.updatePaymentStatus(payment, status);

  if (status === "PAID") {

    const user = await userRepo.findUserById(payment.userId);

    user.isPremium = true;
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.userName,
        isPremium: true
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    return {
      message: "Payment successful",
      status,
      token,
      username: user.userName
    };
  }

  return {
    message: "Payment status updated",
    status
  };
};


module.exports = {
  initiatePayment,
  paymentStatus,
  verifyPayment
};