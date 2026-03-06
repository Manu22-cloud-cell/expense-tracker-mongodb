const s3 = require("../services/s3");
const DownloadedReport = require("../models/downloadedReport");

const { Op, fn, col, where, literal } = require("sequelize");
const Expense = require("../models/expenses");

//GET /reports?type=daily|monthly|yearly
exports.getReports = async (req, res, next) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const { type, date, month, year } = req.query;

    let result;

    if (type === "daily") {
      result = await getDailyReport(userId, date);
    }
    else if (type === "monthly") {
      result = await getMonthlyReport(userId, month, year);
    }
    else if (type === "yearly") {
      result = await getYearlyReport(userId, year);
    }
    else {
      const err = new Error("Invalid report type");
      err.statusCode = 400;
      throw err;
    }

    res.status(200).json(result);
    
  }
  catch (error) {
    error.statusCode = error.statusCode || 500; next(error);
  }
};

//csv generator for daily/monthly report
function generateCSV(expenses, total) {
  let csv = "Date,Description,Category,Note,Amount\n";

  expenses.forEach(e => {
    csv += `${e.createdAt},${e.description},${e.category || "AI"},${e.note || "-"},${e.amount}\n`;
  });

  csv += `,,,,\nTotal,,,,${total}`;
  return csv;
}

//csv generator for yearly report
function generateYearlyCSV(data, total, year) {
  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  let csv = `Year,${year}\n\n`;
  csv += "Month,Expense\n";

  data.forEach(row => {
    const monthName = monthNames[row.get("month") - 1];
    csv += `${monthName},${row.get("expense")}\n`;
  });

  csv += `\nTotal,${total}`;
  return csv;
}


//download and upload to S3
exports.downloadReport = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type, year } = req.query;

    let csv;
    let fileName;

    if (type === "daily" || type === "monthly") {
      const report =
        type === "daily"
          ? await getDailyReport(userId)
          : await getMonthlyReport(userId);

      csv = generateCSV(report.expenses, report.totalExpense);
      fileName = `expense-${type}-${userId}-${Date.now()}.csv`;
    }

    else if (type === "yearly") {
      const report = await getYearlyReport(userId, year);

      csv = generateYearlyCSV(report.data, report.total, year);
      fileName = `expense-yearly-${userId}-${year || "current"}-${Date.now()}.csv`;
    }

    const result = await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `reports/${fileName}`,
      Body: csv,
      ContentType: "text/csv",
      ACL: "public-read"
    }).promise();

    await DownloadedReport.create({
      userId,
      fileUrl: result.Location,
      downloadedAt: new Date()
    });

    res.status(200).json({ fileUrl: result.Location });

  } catch (err) {
    next(err);
  }
};


//api to fetch past downloads
exports.getDownloadedReports = async (req, res) => {
  const reports = await DownloadedReport.findAll({
    where: { userId: req.user.userId },
    order: [["downloadedAt", "DESC"]]
  });

  res.json(reports);
};


//DAILY 

async function getDailyReport(userId, date) {
  if (!date) {
    date = new Date().toISOString().split("T")[0];
  }

  const start = new Date(`${date} 00:00:00`);
  const end = new Date(`${date} 23:59:59`);

  const expenses = await Expense.findAll({
    where: {
      userId,
      createdAt: {
        [Op.between]: [start, end]
      }
    },
    order: [["createdAt", "ASC"]]
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, totalExpense };
}

//MONTHLY

async function getMonthlyReport(userId, month, year) {
  if (!month || !year) {
    const now = new Date();
    month = now.getMonth() + 1;
    year = now.getFullYear();
  }

  const expenses = await Expense.findAll({
    where: {
      userId,
      [Op.and]: [
        where(fn("MONTH", col("createdAt")), month),
        where(fn("YEAR", col("createdAt")), year)
      ]
    },
    order: [["createdAt", "ASC"]]
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, totalExpense };
}

//YEARLY

async function getYearlyReport(userId, year) {
  if (!year) {
    year = new Date().getFullYear();
  }

  const data = await Expense.findAll({
    attributes: [
      [fn("MONTH", col("createdAt")), "month"],
      [fn("SUM", col("amount")), "expense"]
    ],
    where: {
      userId,
      [Op.and]: [
        where(fn("YEAR", col("createdAt")), year)
      ]
    },
    group: [fn("MONTH", col("createdAt"))],
    order: [[literal("month"), "ASC"]]
  });

  const total = data.reduce(
    (sum, e) => sum + Number(e.get("expense")),
    0
  );

  return { data, total };
}



