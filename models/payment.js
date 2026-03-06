const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const Payment = sequelize.define("payment", {
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: "PENDING"
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

module.exports = Payment;
