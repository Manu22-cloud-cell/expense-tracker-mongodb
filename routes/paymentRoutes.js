const express = require('express');
const router = express.Router();
const { initiatePayment } = require("../controller/paymentController");
const { verifyPayment } = require("../controller/paymentController")
const { paymentStatus } = require("../controller/paymentController")

router.post("/create-order", initiatePayment);
router.get("/payment-status/:orderId", paymentStatus)
router.get("/verify/:orderId", verifyPayment)

module.exports = router;
