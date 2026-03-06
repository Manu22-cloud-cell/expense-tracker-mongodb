const Payment = require("../models/payment");

const createPayment = (data) => {
  const payment = new Payment(data);
  return payment.save();
};

const findPaymentByOrderId = (orderId) => {
  return Payment.findOne({ orderId });
};

const updatePaymentStatus = (payment, status) => {
  payment.paymentStatus = status;
  return payment.save();
};

module.exports = {
  createPayment,
  findPaymentByOrderId,
  updatePaymentStatus
};