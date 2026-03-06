const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const ForgotPasswordRequests = sequelize.define("ForgotPasswordRequests", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = ForgotPasswordRequests;
