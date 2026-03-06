const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
  process.env.CASHFREE_ENV === 'production'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_API_KEY,
  process.env.CASHFREE_SECRET_KEY
);

exports.createOrder = async (orderId, amount, customerId, email, phone) => {
  try {
    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customerId.toString(),
        customer_email: email || "test@example.com",
        customer_phone: phone || "9999999999",
      },
      order_meta: {
        return_url: `${process.env.API_BASE_URL}/payment/success.html?orderId=${orderId}`,
      }
    };

    console.log("Cashfree Request:", request);

    const response = await cashfree.PGCreateOrder(request);

    console.log("Cashfree Response:", response.data);

    return response.data.payment_session_id;

  } catch (err) {
    console.error("Cashfree Order Error:", err.response?.data || err.message);
    return null;
  }
};