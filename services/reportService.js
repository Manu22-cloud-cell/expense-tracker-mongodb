const reportRepository = require("../repositories/reportRepository");
const s3 = require("../services/s3");

// CSV generator for daily/monthly
function generateCSV(expenses, total) {

  let csv = "Date,Description,Category,Note,Amount\n";

  expenses.forEach(e => {
    csv += `${e.createdAt},${e.description},${e.category || "AI"},${e.note || "-"},${e.amount}\n`;
  });

  csv += `,,,,\nTotal,,,,${total}`;

  return csv;
}

// CSV generator for yearly
function generateYearlyCSV(data, total, year) {

  const monthNames = [
    "January","February","March","April",
    "May","June","July","August",
    "September","October","November","December"
  ];

  let csv = `Year,${year}\n\n`;
  csv += "Month,Expense\n";

  data.forEach(row => {
    const monthName = monthNames[row.month - 1];
    csv += `${monthName},${row.expense}\n`;
  });

  csv += `\nTotal,${total}`;

  return csv;
}

exports.getDailyReport = async (userId, date) => {

  if (!date) {
    date = new Date().toISOString().split("T")[0];
  }

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  const expenses = await reportRepository.getDailyExpenses(userId, start, end);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, totalExpense };
};

exports.getMonthlyReport = async (userId, month, year) => {

  if (!month || !year) {
    const now = new Date();
    month = now.getMonth() + 1;
    year = now.getFullYear();
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const expenses = await reportRepository.getMonthlyExpenses(userId, start, end);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, totalExpense };
};

exports.getYearlyReport = async (userId, year) => {

  if (!year) {
    year = new Date().getFullYear();
  }

  const data = await reportRepository.getYearlyExpenses(userId, year);

  const total = data.reduce((sum, e) => sum + Number(e.expense), 0);

  return { data, total };
};

exports.downloadReport = async (userId, type, year) => {

  let csv;
  let fileName;

  if (type === "daily" || type === "monthly") {

    const report =
      type === "daily"
        ? await this.getDailyReport(userId)
        : await this.getMonthlyReport(userId);

    csv = generateCSV(report.expenses, report.totalExpense);

    fileName = `expense-${type}-${userId}-${Date.now()}.csv`;
  }

  else if (type === "yearly") {

    const report = await this.getYearlyReport(userId, year);

    csv = generateYearlyCSV(report.data, report.total, year);

    fileName = `expense-yearly-${userId}-${year || "current"}-${Date.now()}.csv`;
  }

  else {
    const err = new Error("Invalid report type");
    err.statusCode = 400;
    throw err;
  }

  const result = await s3.upload({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `reports/${fileName}`,
    Body: csv,
    ContentType: "text/csv",
    ACL: "public-read"
  }).promise();

  await reportRepository.saveDownloadedReport({
    userId,
    fileUrl: result.Location,
    downloadedAt: new Date()
  });

  return result.Location;
};

exports.getDownloadedReports = async (userId) => {

  return reportRepository.getDownloadedReports(userId);

};