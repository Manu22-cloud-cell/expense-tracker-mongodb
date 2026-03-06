const Sequelize = require("sequelize");
const sequelize = require("../utils/db-connection");

const DownloadedReport = sequelize.define("DownloadedReport", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fileUrl: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  downloadedAt: {
    type: Sequelize.DATE,
    allowNull: false
  }
});

module.exports = DownloadedReport;
