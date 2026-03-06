const reportService = require("../services/reportService");

exports.getReports = async (req, res, next) => {

  try {

    const userId = req.user.userId;
    const { type, date, month, year } = req.query;

    let result;

    if (type === "daily") {
      result = await reportService.getDailyReport(userId, date);
    }

    else if (type === "monthly") {
      result = await reportService.getMonthlyReport(userId, month, year);
    }

    else if (type === "yearly") {
      result = await reportService.getYearlyReport(userId, year);
    }

    else {
      const err = new Error("Invalid report type");
      err.statusCode = 400;
      throw err;
    }

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }

};


exports.downloadReport = async (req, res, next) => {

  try {

    const userId = req.user.userId;
    const { type, year } = req.query;

    const fileUrl = await reportService.downloadReport(userId, type, year);

    res.status(200).json({ fileUrl });

  } catch (error) {
    next(error);
  }

};


exports.getDownloadedReports = async (req, res, next) => {

  try {

    const userId = req.user.userId;

    const reports = await reportService.getDownloadedReports(userId);

    res.status(200).json(reports);

  } catch (error) {
    next(error);
  }

};