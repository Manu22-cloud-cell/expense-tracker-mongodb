const mongoose = require("mongoose");

const downloadedReportSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true
    },

    downloadedAt: {
      type: Date,
      default: Date.now
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DownloadedReport", downloadedReportSchema);